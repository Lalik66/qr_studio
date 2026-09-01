# QR Studio — Build Plan

A web app where people register, sign in, generate QR codes from a URL, and view/download their past QR codes. Built with the fixed stack (Next.js, TypeScript, Tailwind, shadcn/ui, Drizzle, Better Auth) via the `start-an-app` skill.

## Build sheet (what the user approved)

- **Name:** QR Studio
- **What it remembers:** QR codes — each with a title/label, the destination URL, styling (foreground color, background color, pixel size, optional center logo), and when it was created. Each belongs to one user; nobody else sees them.
- **What you can do:** sign up / sign in, generate a QR code from a URL, **name it**, **style it** (colors, size, logo), see them newest-first on a dashboard, **search/filter** the list, **edit** the title/destination/styling later, download each as PNG or SVG, and **delete** ones you no longer need.
- **QR scope:** URLs only in v1.
- **QR styling:** user-customizable — foreground + background color, output size, and an optional logo image in the center (error-correction level H so it still scans). The generated QR image is regenerated on demand from the saved fields; only the uploaded **logo** is stored as a file.
- **Signing in:** email + password (Better Auth).
- **Email:** verification of new addresses + password reset via Resend. Works for sending to yourself immediately; emailing others needs a domain + DNS later. Emails print to the terminal until a domain is verified.
- **Database:** Postgres, running locally in Docker (same DB as production).
- **Payments:** none — free for everyone, unlimited QR codes.
- **Agent access:** none (browser only).
- **Help docs:** none — the landing page explains the product.
- **How it'll look:** the existing `DESIGN.md` governs every screen — dark navy canvas, indigo/violet (`#5B5FE9`) accent, soft radial glow, uppercase display headings, chip/card modules, hairline borders. Tokens only, no hardcoded values.
- **Uploads:** center logos are uploaded. Locally they save into a project folder; on deploy they move to cloud storage (Vercel Blob) automatically — same code, switched by env. Accepted: PNG/JPG/SVG, small size cap.
- **Being found:** public product → sitemap, `robots.txt`, `llms.txt`, and a shared-link preview card. Search + citation crawlers allowed.
- **Settings + system visibility:** account settings (profile, password, delete account) and a system page (what's configured, what happened, e.g. email sends).
- **Legal:** public product that takes accounts and sends email → a first-draft privacy policy + terms. Cookie banner only if a non-essential tracker is added later (none in v1, so no banner — session cookie is essential).
- **Not in version one:** other QR types (WiFi, text, email), **dynamic** QR codes (change where a code points *without* regenerating the image, via a redirect), scan analytics/tracking, paid plans, Google sign-in, agent access. (Note: editing the destination *is* in v1, but it regenerates the code — it is not a dynamic redirect.)

## Prerequisites (need from the user before/at build)

- **Start Docker Desktop** — installed (v29.1.2) but the daemon isn't running. Required before the database step. (Fallback: switch to SQLite if they'd rather not.)
- **Resend API key** — needed to actually send verification/reset emails to others; until then emails print to the terminal and self-sends work.

## Progress so far (DONE + verified)

Steps 1–7 of the original order are complete and runtime-verified:

- **Skills installed**, **version research** done, **Next.js scaffold**, **design system** (`DESIGN.md` → tokens in `globals.css`/`layout.tsx`; `AGENTS.md`/`CLAUDE.md` point at it), **Postgres-in-Docker + Drizzle** (`qr_code` + `email_log` + Better Auth tables), **email+password sign-in** (sign-in/up/forgot/reset pages), **Resend email** (verification + reset, logs to `email_log`, degrades to terminal when no key).
- **Better Auth `issuer` blocker — FIXED.** Better Auth 1.7.1 requires `account.issuer` + a unique index on `(issuer, account_id)`; the CLI (1.4.21, no 1.7.1 exists) can't generate it. Hand-added both to `auth-schema.ts` to match better-auth's own `get-tables.mjs`, generated `0002_broad_martin_li.sql`, migrated. Sign-up now returns 200; `account.issuer = local:credential`; verification email logs to `email_log`. Test users cleared so the first real account is admin.
- **Deviations to flag at hand-off:** (1) PG18 Docker image needs the volume at `/var/lib/postgresql`, not `/var/lib/postgresql/data` (database.md is stale). (2) `@better-auth/cli` lags the runtime — `auth-schema.ts` was hand-patched for `issuer`; re-running the CLI would drop it. (3) shadcn Button is base-ui (uses `render`/`buttonVariants`, not `asChild`).

## Decisions locked in this review

- **Email verification: allow in, don't block.** Verify link is still sent on sign-up, but unverified users can use the dashboard. No hard gate (dev emails only print to terminal, so gating would lock the developer out). `requireUser()` stays as-is.
- **SVG logos: rasterize to PNG on upload.** Accept PNG/JPG/SVG, convert SVG → PNG immediately with sharp. Eliminates stored-XSS from script-in-SVG; the centered logo is identical; SVG downloads embed the logo as a small base64 raster `<image>`.

## Remaining execution order (corrected for dependencies)

**A. Foundations — storage + QR engine (before dashboard)**

1. **Logo storage** → `references/storage.md`. Four files under `src/lib/storage/` (`types.ts`, `local.ts`, `blob.ts`, `index.ts`); presence of `BLOB_READ_WRITE_TOKEN`/`BLOB_STORE_ID` switches local↔Blob. Add `public/uploads/` to `.gitignore`. Hardened upload route `src/app/api/upload/route.ts`: **require session** (`requireUser`), size cap (~500 KB for a logo), MIME allow-list PNG/JPG/SVG, **rasterize SVG→PNG with sharp**, store under `logos/<userId>/`. Save both `url` and `pathname` on the row.
2. **Schema: add `logoPath`** to `qr_code` (nullable) so the logo file can be deleted on QR delete (FK cascade drops the row, not the file). `db:generate` + `db:migrate`.
3. **QR engine** → `src/lib/qr.ts` (Step 5 core; libs `qrcode@1.5.4` + `sharp@0.35.4` installed, sharp loads on win32).
   - **PNG:** `QRCode.toBuffer(url, { errorCorrectionLevel: 'H', width, margin: 4, color: { dark: fg, light: bg } })`; if logo, `sharp(qr).composite([{ input: resizedLogo, gravity: 'centre' }])`. Logo ≈ **22–25%** of QR width (safe under EC-H 30%).
   - **SVG (hand-built for parity + knockout):** `QRCode.create(url, { errorCorrectionLevel: 'H' })` exposes `modules` (a `BitMatrix`). Build the SVG from the module grid: bg `<rect>`, fg module `<rect>`s in the chosen colors; when a logo is present, **clear the center module region** before emitting, then overlay `<image href="data:image/png;base64,…">`. Guarantees the SVG matches the PNG and stays scannable.
   - **Download endpoint** `src/app/api/qr/[id]/route.ts` (`?format=png|svg`): `requireUser`, fetch row scoped `and(eq(id), eq(userId))`, 404 if not owner, regenerate on demand, return with `Content-Type`, `Content-Disposition: attachment`, `X-Content-Type-Options: nosniff`.
   - **Live preview:** client uses `qrcode.react` with `imageSettings.excavate` for the logo knockout (fast, smooth). Minor encoder drift vs the server download is imperceptible at EC-H; the **downloaded file always comes from `qr.ts`** so it's the source of truth.

**B. Pages — landing + dashboard** → `references/pages.md`

4. **Move the front door into a route group.** `src/app/page.tsx` (still Create-Next-App boilerplate) → `src/app/(marketing)/page.tsx`, rebuilt from `index.html` with **tokens only** and the Brand/Button components. **Strip every out-of-scope promise:** WiFi/VCard/PDF/Video chips, "dynamic/editable" codes, scan analytics, and JPG output (keep only URL input, color/size/logo styling, PNG/SVG).
5. **Dashboard** under `src/app/(dashboard)/` with a `layout.tsx` that calls `requireUser()` once and provides nav with **Settings** + **System** links (so later steps hang off it).
   - **List + search:** user's codes newest-first (`orderBy desc(createdAt)`, `where eq(userId)`), each card = title, URL, small live preview, download PNG/SVG, edit, delete. Client-side search over title + destinationUrl. **Empty state** per DESIGN.md §8.
   - **Generate:** form (URL, title, fg/bg color pickers, size, logo upload) → live preview → server action inserts `qr_code` scoped to `userId`.
   - **Edit:** owner-scoped fetch, change fields/logo, save (regenerates image — static, not a redirect).
   - **Delete:** confirm dialog → owner-scoped delete → `deleteFile(logoPath)` for the stored logo.
   - **Ownership everywhere:** every read/update/delete uses `and(eq(qrCode.id, id), eq(qrCode.userId, user.id))`; server actions are `"use server"` (built-in CSRF).

**C. Account + ops**

6. **Account settings** → `references/settings.md` under `src/app/(dashboard)/settings/`: profile (name), account (email + verification status/resend), security (change password, sessions/devices). Set `freshAge: 0` and the **first-account-admin** hook (`role` field, `input:false`) in `auth.ts` (regenerate schema + migrate). **Account delete cleans up** the user's `qr_code` rows (FK cascade) **and their logo files** (afterDelete hook → `deleteFile`). No notifications tab (only transactional email in v1), no billing/connected-apps/cookie tabs.
7. **System visibility** → `references/ops.md` at `src/app/(dashboard)/system/`, **admin-gated** (first account). `src/lib/system-status.ts` reports config presence (`RESEND_API_KEY`, `BLOB_*`, `BETTER_AUTH_URL`, `APP_URL`). Surfaces the **`email_log`** history (recipient, template, status, resend on failure). Keep to config-health + email log (satisfies "what's configured, what happened") — no separate activity_log table in v1.

**D. Legal + discoverability (last — SEO lists every public page)**

8. **Legal** → `references/legal.md`: `src/lib/legal.ts` (appName filled; `entity`/`contactEmail`/`jurisdiction` left null for the user) + `src/components/legal-blank.tsx` (marks unfilled fields). `/privacy` + `/terms` first drafts disclosing Postgres, Better Auth session cookie, Resend, Blob logo storage. **No cookie banner** (session cookie is essential) — state the one-line reason at hand-off. Claim only what the code keeps (deletion yes; no fabricated retention/age limits).
9. **Discoverability** → `references/seo.md`: `src/lib/site.ts` (`siteUrl` from `APP_URL`/`BETTER_AUTH_URL`, `site` metadata, `publicPages` = landing + privacy + terms). **Add `metadataBase` to `layout.tsx` root metadata** (missing now → prod canonicals/OG would be localhost). `src/app/sitemap.ts`, `robots.ts` (disallow `/api`, `/dashboard`, `/settings`; allow AI search/citation crawlers), `llms.txt` route, `opengraph-image.tsx`. Confirm no stray `public/robots.txt`.

**E. Also fold in:** `next.config.ts` `images.remotePatterns` for `*.public.blob.vercel-storage.com` (only if `next/image` renders logos; a plain `<img>` needs none).

## Critical files (created/modified)

- `src/lib/db/schema.ts` (add `logoPath`), `src/lib/db/auth-schema.ts` (issuer — done; +role for admin), Drizzle migrations
- `src/lib/storage/{types,local,blob,index}.ts`, `src/app/api/upload/route.ts`
- `src/lib/qr.ts`, `src/app/api/qr/[id]/route.ts`
- `src/lib/auth.ts` (freshAge, role, first-account-admin hook), `src/lib/session.ts`
- `src/app/(marketing)/page.tsx` (from `index.html`, out-of-scope stripped)
- `src/app/(dashboard)/{layout,page}.tsx` + generate/edit/delete server actions
- `src/app/(dashboard)/settings/*`, `src/app/(dashboard)/system/*`, `src/lib/system-status.ts`
- `src/lib/legal.ts`, `src/components/legal-blank.tsx`, `src/app/privacy`, `src/app/terms`
- `src/lib/site.ts`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/llms.txt/route.ts`, `src/app/opengraph-image.tsx`, `src/app/layout.tsx` (metadataBase)
- `.gitignore` (`public/uploads/`), `next.config.ts` (Blob remotePatterns)

## Verification (skill Steps 6–7) → `references/verify.md`

- **Static:** `tsc --noEmit`; `db:generate` shows no drift; `build` (runs migrate first) — inspect the route table (no page statically serving user data); `lint` + grep for hardcoded colors and unfilled-legal markers.
- **Runtime (prod serve):** curl every route — `/`, `/sign-in`, `/sign-up`, `/privacy`, `/terms`, `/dashboard`, `/settings`, `/settings/system`, `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/opengraph-image`.
- **End-to-end:** sign up (first account = admin, in a browser), generate a QR from a URL with custom colors/size + a logo, **confirm it scans**, download PNG + SVG, edit destination + styling, search/filter, delete (logo file gone too).
- **Ownership:** second account (via curl) cannot list/read/edit/delete/download the first account's codes.
- **Keys removed:** blank `RESEND_API_KEY`/`BLOB_*` via `.env.production.local` → emails to terminal, uploads to local folder, no crash.
- **Fresh-eyes critics** (parallel, two rounds max): promise-keeping vs this sheet, looks-like-theirs (DESIGN.md), ownership, operability.
- **Named-but-unrun:** email to *others* (needs domain+DNS), any browser-only interaction I can't drive, Blob path (needs a deployed store).

## Notes to surface at hand-off

- **Resolved deviations:** PG18 volume path, hand-patched `issuer` (don't re-run the Better Auth CLI or it drops the column), Button `render`/`buttonVariants` not `asChild`.
- **Decisions:** verification is send-but-don't-block; SVG logos are rasterized to PNG on upload (note the tiny quality tradeoff in SVG downloads).
- **Hardening not in v1:** auth rate-limiting is Better Auth's built-in default in prod; add a captcha/stricter limit before launch if abused. Rotate `BETTER_AUTH_SECRET` before going live (it's gitignored, not committed).
- **Legal:** privacy/terms are a first draft, not legal advice; fill `entity`/`contactEmail`/`jurisdiction` in `src/lib/legal.ts`. No cookie banner because the only cookie is the essential session — add analytics later and it'll need one.
- **SEO:** sitemap is an invitation not a ranking; `llms.txt` is a proposed convention; `robots.txt` is what actually governs crawlers. Set `APP_URL` to the real domain so sitemap/canonical/OG aren't localhost.
- **Run it:** `pnpm db:up` (Docker Postgres) then `pnpm dev`; what each `.env` entry is for; `DESIGN.md` governs the look (change a token there + in `globals.css`). The system page answers "did that email send?".
- **Deploy switches (host settings):** `POSTGRES_URL`, connect a Blob store, Resend key + verified domain, `BETTER_AUTH_URL`, `APP_URL`; `deploy-to-vercel` skill is installed for this.
