# QR Studio

A web app where people sign up, generate QR codes from a URL, style them with colours, size and a centre logo, and manage, search, edit, download (PNG/SVG) and delete their own codes.

**Design system: `DESIGN.md` in this directory. Read it before creating or changing any page or component, and follow it — colours, type, spacing and radius come from its tokens, never from a value written into a component.** The app is dark-first (the `<html>` element carries the `dark` class).

## Stack

Next.js (App Router) · TypeScript · Tailwind · shadcn/ui · Drizzle · Postgres (Docker) · Better Auth · Resend (email) · Vercel Blob (logo uploads) · `qrcode` + `sharp` (QR generation)

## Commands

- `pnpm dev` — start the dev server
- `pnpm build` — production build (runs `db:migrate` first)
- `pnpm start` — serve the production build
- `pnpm lint` — ESLint
- `pnpm db:up` / `pnpm db:down` — start/stop local Postgres in Docker
- `pnpm db:generate` — generate a migration from schema changes
- `pnpm db:migrate` — apply pending migrations
- `pnpm db:studio` — Drizzle Studio

## Conventions

- Schema changes go through `db:generate` then `db:migrate`. **Never `drizzle-kit push`.**
- Every table gets a randomly generated UUID id — **except** Better Auth's own tables, which stay exactly as its CLI generates them (any column pointing at a user is `text`, not `uuid`).
- Every query for user data is scoped to the session user; a user can only see, edit and delete their own QR codes.
- QR *content* colours the user picks are data stored per code — they are not theme tokens and do not belong in `globals.css`.
- Uploads use the storage helper: a local folder in dev, Vercel Blob in production, switched by env — never a second code path.
- The QR image is regenerated on demand from the saved fields; only the uploaded logo is stored as a file.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
