# Design System

## 1. Purpose

This design system documents the visual language of the QR Studio product, derived from the marketing/product reference. The aesthetic is a **dark, high-contrast, tech-forward interface** anchored by an indigo/violet accent and a deep navy canvas with soft glow lighting. It is intended to keep pages, marketing surfaces, and product UI visually consistent and easy to build.

The system prioritizes clarity, strong hierarchy, and a confident "product-first" tone.

## 2. Design Principles

- **Dark-first, glow-accented.** The default canvas is a deep navy-black. Depth comes from subtle surface elevation and a single focused radial glow, not heavy shadows.
- **One decisive accent.** Indigo/violet is the only brand color used for emphasis (primary actions, key words, active states). Green is a secondary, functional accent for flow/status only.
- **Bold, confident typography.** Headlines are large, uppercase, and heavy. Body copy is calm, muted, and readable.
- **Modular chips & cards.** UI is built from consistent rounded surfaces (chips, cards, pills) with hairline borders.
- **Generous negative space.** Content breathes; components are centered and rhythmic.
- **Legible contrast.** White on navy for headlines, muted gray for support text — always meeting contrast targets.

## 3. Foundations

### Colors

#### Brand / Accent
| Token | Value | Usage |
|---|---|---|
| `--color-primary` | `#5B5FE9` | Primary buttons, key headline words, active/brand accents |
| `--color-primary-hover` | `#6E72F2` | Hover state for primary actions |
| `--color-primary-pressed` | `#4A4ED4` | Pressed/active state |
| `--color-primary-subtle` | `rgba(91, 95, 233, 0.14)` | Tinted backgrounds, focus rings, glow tint |
| `--color-accent-green` | `#4ADE80` | Flow chevrons, success/status accents only |

#### Surfaces (dark)
| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#0A0E1A` | Page background (deepest navy-black) |
| `--color-bg-elevated` | `#0F1420` | Section/hero backdrop |
| `--color-surface` | `#151A28` | Chips, cards, secondary buttons |
| `--color-surface-hover` | `#1C2233` | Hover for interactive surfaces |
| `--color-surface-strong` | `#1F2536` | Central/feature card fill |

#### Borders & Lines
| Token | Value | Usage |
|---|---|---|
| `--color-border` | `rgba(255, 255, 255, 0.08)` | Default hairline borders on chips/cards |
| `--color-border-strong` | `rgba(255, 255, 255, 0.14)` | Emphasized/hover borders |
| `--color-connector` | `rgba(255, 255, 255, 0.12)` | Flow/connector lines |

#### Text
| Token | Value | Usage |
|---|---|---|
| `--color-text` | `#FFFFFF` | Headlines, high-emphasis text |
| `--color-text-secondary` | `#AEB4C2` | Body copy, descriptions |
| `--color-text-muted` | `#6B7280` | Captions, disabled, placeholders |
| `--color-text-on-primary` | `#FFFFFF` | Text/icons on primary buttons |

#### Effects
| Token | Value | Usage |
|---|---|---|
| `--glow-primary` | `radial-gradient(closest-side, rgba(91,95,233,0.45), rgba(91,95,233,0) 70%)` | Bottom-center hero glow |

#### Semantic
| Token | Value | Usage |
|---|---|---|
| `--color-success` | `#4ADE80` | Success feedback |
| `--color-warning` | `#F5B84B` | Warnings |
| `--color-error` | `#F26D6D` | Errors, destructive |
| `--color-info` | `#5B5FE9` | Informational |

### Typography

**Font family:** A geometric/grotesque sans-serif.
- Primary: `"Inter", "Helvetica Neue", Arial, sans-serif`
- Headlines use a heavy weight; body uses regular.

| Token | Size | Line height | Weight | Case / Notes |
|---|---|---|---|---|
| `--font-display` | 64px | 1.0 | 800 | Uppercase hero (e.g. "WE MAKE QR CODES EASY") |
| `--font-h1` | 44px | 1.1 | 700 | Page titles |
| `--font-h2` | 32px | 1.2 | 700 | Section titles |
| `--font-h3` | 24px | 1.3 | 600 | Subsections |
| `--font-body-lg` | 18px | 1.6 | 400 | Lead paragraphs / hero subcopy |
| `--font-body` | 16px | 1.6 | 400 | Default body |
| `--font-body-sm` | 14px | 1.5 | 400 | Secondary text |
| `--font-label` | 13px | 1.2 | 600 | Chip/nav labels — **uppercase, letter-spacing 0.06em** |
| `--font-caption` | 12px | 1.4 | 500 | Captions, badges |

Notes:
- Display and label text are **uppercase**.
- Emphasized headline words use `--color-primary` inline (e.g. "QR CODES").
- Body copy uses `--color-text-secondary` and is often center-aligned in marketing contexts.

### Spacing

Base unit: **4px**. Use the scale for padding, gaps, and margins.

| Token | Value |
|---|---|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 20px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-10` | 40px |
| `--space-12` | 48px |
| `--space-16` | 64px |
| `--space-20` | 80px |

### Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | 8px | Chips, small buttons, inputs |
| `--radius-md` | 12px | Cards, CTA button |
| `--radius-lg` | 16px | Feature/central cards |
| `--radius-pill` | 999px | Nav buttons, feature pills, icon buttons |

### Shadows

Elevation is subtle on dark surfaces; rely on borders + glow more than shadow.

| Token | Value | Usage |
|---|---|---|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.4)` | Chips, resting cards |
| `--shadow-md` | `0 6px 20px rgba(0,0,0,0.45)` | Elevated/hovered cards, menus |
| `--shadow-primary` | `0 8px 30px rgba(91,95,233,0.35)` | Primary CTA emphasis / hover |

### Breakpoints

| Token | Value | Target |
|---|---|---|
| `--bp-sm` | 640px | Large phones |
| `--bp-md` | 768px | Tablets |
| `--bp-lg` | 1024px | Small laptops |
| `--bp-xl` | 1280px | Desktops |
| `--bp-2xl` | 1536px | Large desktops |

## 4. Layout

### Page Structure

Top → bottom:
1. **Header / Nav** — logo (icon + wordmark) at left; utility actions at right (help icon button, Log in, Sign up).
2. **Hero** — centered display headline, muted subcopy, primary CTA.
3. **Content / Diagram zone** — modular chips and cards arranged around a central hero card, connected by hairline flow lines with green chevrons; a radial indigo glow sits behind the lower portion.
4. **Feature strip** — row of pill badges summarizing key value props.

### Grid Rules

- Max content width: **1200px**, centered with `--space-16` horizontal padding on desktop.
- Base grid: **12 columns**, gutter `--space-6` (24px).
- Hero content is center-aligned within the container.
- Chip/card clusters align to a consistent vertical rhythm using the spacing scale.

### Responsive Rules

- **≥1024px:** Full multi-column diagram layout; hero display at `--font-display`.
- **768–1023px:** Reduce display size (~48px); stack side chip columns closer; keep central card centered.
- **<768px:** Single-column stack; convert diagram to a vertical flow; nav collapses to logo + primary action (menu for the rest); reduce section padding to `--space-8`.
- Never let body line length exceed ~65 characters for readability.

## 5. Components

### Buttons

**Primary (filled)** — `Create QR Codes`, `Sign up`
- Background `--color-primary`; text `--color-text-on-primary`; radius `--radius-md` (pill for nav-scale); padding `12px 20px`; optional leading icon.
- Hover: `--color-primary-hover` + `--shadow-primary`. Pressed: `--color-primary-pressed`.

**Secondary (surface)** — `Log in`
- Background `--color-surface`; `1px solid --color-border`; text `--color-text`; radius `--radius-pill`; leading icon allowed.
- Hover: `--color-surface-hover` + `--color-border-strong`.

**Ghost / Icon button** — help `?` button
- Transparent or `--color-surface`; `1px solid --color-border`; square-ish with `--radius-pill`; icon in `--color-text-secondary`.
- Hover: `--color-surface-hover`.

Sizing: default height 44px; small 36px; large 52px.

### Inputs

- Background `--color-surface`; `1px solid --color-border`; text `--color-text`; placeholder `--color-text-muted`; radius `--radius-sm`; padding `10px 14px`.
- Focus: border `--color-primary` + `0 0 0 3px --color-primary-subtle` ring.
- Error: border `--color-error` + helper text in `--color-error`.

### Cards

**Chip card** (LINK, WIFI, IMAGE, PDF, JPG, PNG, SVG, etc.)
- `--color-surface`; `1px solid --color-border`; radius `--radius-sm`; padding `10px 14px`; leading icon + **uppercase `--font-label`**.
- Hover: `--color-surface-hover` + `--color-border-strong`.

**Feature / Central card** (QR Generator card)
- `--color-surface-strong`; `1px solid --color-border-strong`; radius `--radius-lg`; larger internal padding (`--space-6`); centered icon/content; optional caption below in `--font-label`.

### Navigation

- Header is transparent over the hero backdrop.
- Left: logo icon (indigo QR glyph) + two-line/inline wordmark in `--color-text`.
- Right: cluster of buttons with `--space-3` gap — icon button, secondary button, primary button.
- Sticky on scroll may add `--color-bg-elevated` background + bottom `--color-border`.

### Modals

- Overlay: `rgba(5, 8, 16, 0.7)`.
- Panel: `--color-surface-strong`; `1px solid --color-border-strong`; radius `--radius-lg`; `--shadow-md`; max-width 480px; padding `--space-8`.
- Header (title `--font-h3`), body (`--font-body`), footer actions right-aligned with primary + secondary.

### Tables

- Header row: `--color-text-muted`, `--font-label` uppercase, bottom border `--color-border`.
- Rows: `--font-body-sm`, row divider `--color-border`; hover `--color-surface-hover`.
- Zebra optional using `--color-bg-elevated`.

### Feedback Components

**Pill badge** (bottom feature strip: "Generate dynamic, editable QR codes", etc.)
- `--color-surface`; `1px solid --color-border`; radius `--radius-pill`; leading icon (accent) + `--font-body-sm`; padding `8px 16px`.

**Toast**
- `--color-surface-strong`; `1px solid --color-border`; radius `--radius-md`; `--shadow-md`; leading semantic icon; auto-dismiss.

**Inline alert**
- Tinted background from the relevant semantic color at ~14% opacity; matching left border/icon.

## 6. Interaction States

Apply consistently across interactive elements:

- **Default:** as specified per component.
- **Hover:** lighten surface one step (`--color-surface` → `--color-surface-hover`) and/or strengthen border; primary shifts to `--color-primary-hover`.
- **Focus-visible:** `2px` outline or `3px` ring using `--color-primary-subtle`; never remove focus outlines.
- **Active/Pressed:** darken/deepen (`--color-primary-pressed`); subtle scale `0.98` optional.
- **Selected/Active nav:** primary-tinted background `--color-primary-subtle` + text `--color-primary`.
- **Disabled:** 40% opacity, `--color-text-muted`, no hover, `cursor: not-allowed`.
- **Transitions:** 150–200ms ease for color/border; 200ms for shadow.

## 7. Forms and Validation

- Label above input in `--font-label` (sentence case allowed for forms), `--color-text-secondary`.
- Required marked with `*` in `--color-primary`.
- Helper text `--font-caption` in `--color-text-muted`.
- **Validate on blur**, re-validate on change once errored.
- Error: input border `--color-error`, helper text `--color-error`, icon optional.
- Success: optional `--color-success` checkmark; avoid overusing green.
- Group related fields with `--space-6`; field-to-label gap `--space-2`.

## 8. Empty, Loading, and Error States

- **Empty:** centered icon (muted), short `--font-h3` title, one line of `--font-body-sm` guidance, single primary action.
- **Loading:** skeleton blocks using `--color-surface` with a subtle shimmer to `--color-surface-hover`; spinners in `--color-primary`.
- **Error:** `--color-error` icon + concise message + retry (secondary button); never blame the user.
- Preserve layout dimensions between loading and loaded to avoid shift.

## 9. Accessibility

- **Contrast:** headline white on navy and body `--color-text-secondary` on `--color-bg` must meet WCAG AA (≥4.5:1 body, ≥3:1 large text). Do not place `--color-text-muted` on `--color-surface` for essential text.
- **Focus:** always visible focus-visible ring (`--color-primary-subtle`); logical tab order.
- **Targets:** minimum 44×44px interactive size.
- **Motion:** honor `prefers-reduced-motion`; disable non-essential glow pulses/transitions.
- **Semantics:** icon-only buttons require `aria-label`; decorative icons `aria-hidden`.
- **Color independence:** never rely on green/indigo alone to convey status — pair with icon/text.

## 10. Content and Microcopy

- **Headlines:** short, bold, uppercase, benefit-led (e.g. "WE MAKE QR CODES EASY").
- **Subcopy:** one or two sentences, plain language, sentence case.
- **Labels:** single words or short phrases, **UPPERCASE** for chips/nav (e.g. LINK, WIFI, DOWNLOAD).
- **Buttons:** action-first verbs ("Create QR Codes", "Sign up", "Log in").
- **Feature pills:** concise value statements, sentence case.
- Voice: confident, helpful, jargon-light.

## 11. Implementation Guidelines

- Consume **tokens only** (CSS custom properties / theme variables) — never hardcode hex values in components.
- Build from the shared component set; do not fork one-off variants for spacing/radius.
- Compose spacing from the 4px scale; avoid arbitrary values.
- The hero glow is a single background radial (`--glow-primary`) positioned bottom-center; keep it low-opacity and non-interactive.
- Icons: consistent stroke style (~1.75px), sized 16/20/24; color via `currentColor` so they inherit state.
- Dark theme is the source of truth; any light theme must map the same token names.
- Keep flow connectors as thin `--color-connector` lines with `--color-accent-green` chevrons used sparingly.

## 12. Do / Don't Examples

**Do**
- Use `--color-primary` for exactly one primary action per view and for key emphasized words.
- Keep surfaces flat with hairline `--color-border`; layer with one soft glow.
- Uppercase chip/nav labels with letter-spacing.
- Maintain generous negative space and centered hero composition.

**Don't**
- Don't introduce additional saturated colors beyond indigo (+ functional green/semantic).
- Don't use heavy drop shadows to fake depth on the dark canvas.
- Don't place muted text on surfaces where it fails contrast.
- Don't stack multiple primary buttons competing for attention.
- Don't mix radius scales within the same component group.

## 13. Changelog

| Version | Date | Notes |
|---|---|---|
| 1.0.0 | 2026-08-25 | Initial design system authored from the QR generator reference (dark navy canvas, indigo accent, chip/card modules, glow-lit hero). |
