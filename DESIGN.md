# Design system — QR Studio

QR Studio should feel like a confident, tech-forward product: a deep navy-black canvas, one decisive indigo accent, bold uppercase display headings, and modular chip/card surfaces with hairline borders and a single soft glow. Calm and legible, never busy. It is **dark-first** — dark is the source of truth; a light mapping exists but the app ships dark. Not a flat admin panel, not a rainbow: one accent, generous space, strong hierarchy.

## Colour

Set in `src/app/globals.css` as theme tokens. **Never write a colour in a component** — use the token or a Tailwind class that maps to it (`bg-primary`, `text-muted-foreground`, `border-border`).

| Token | Dark (source of truth) | Light | Used for |
| --- | --- | --- | --- |
| `--background` / `--foreground` | `#0A0E1A` / `#FFFFFF` | `#FFFFFF` / `#0A0E1A` | Page base and body text |
| `--card` / `--card-foreground` | `#151A28` / `#FFFFFF` | `#FFFFFF` / `#0A0E1A` | Chips, cards, secondary surfaces |
| `--popover` / `--popover-foreground` | `#1F2536` / `#FFFFFF` | `#FFFFFF` / `#0A0E1A` | Modals, dropdowns, toasts, feature cards |
| `--primary` / `--primary-foreground` | `#5B5FE9` / `#FFFFFF` | same | Primary button + key emphasis — one per screen |
| `--secondary` / `--secondary-foreground` | `#151A28` / `#FFFFFF` | `#F1F2F6` / `#0A0E1A` | Secondary/surface buttons |
| `--muted` / `--muted-foreground` | `#151A28` / `#AEB4C2` | `#F1F2F6` / `#55607A` | Secondary surfaces, timestamps, help text |
| `--accent` / `--accent-foreground` | `#1C2233` / `#FFFFFF` | `#EEEFFE` / `#4A4ED4` | Hover surfaces, active nav |
| `--border` / `--input` | white @8% / @12% | ink @10% / @14% | Hairline card/input edges |
| `--ring` | `#5B5FE9` | `#5B5FE9` | Focus rings — always visible |
| `--destructive` | `#F26D6D` | `#E24D4D` | Delete only, never for emphasis |
| `--success` / `--warning` | `#4ADE80` / `#F5B84B` | `#22B865` / `#C9860F` | Status feedback only |

The bottom-center hero glow is the `.hero-glow` utility (`--glow-primary` token) — low-opacity, non-interactive, one per hero.

## Type

- **Font:** Inter for everything, loaded in `layout.tsx` via `next/font` → `--font-sans`. Mono is JetBrains Mono (`--font-mono`) for URLs/code only. No other font.
- **Display headings:** heavy (700–800), often **UPPERCASE** for hero/section titles (e.g. "WE MAKE QR CODES EASY"). Emphasised words use `text-primary`.
- **Body:** regular (400), `text-muted-foreground` for support copy; comfortable line height (~1.6).
- **Scale in use:** display ~3.5rem/800 · h1 ~2.25rem/700 · h2 ~1.5rem/700 · body 1rem · small 0.875rem · label 0.8125rem uppercase (`.label-caps`).
- Chip and nav labels are uppercase with letter-spacing via `.label-caps`.

## Shape and space

- **Radius:** `--radius: 1rem`. Everything inherits it (`rounded-md`/`rounded-lg` map off it); pills use `rounded-full`. Nothing sets its own radius value.
- **Content width:** max ~1200px, centred, with 1–1.5rem padding on narrow screens.
- **Rhythm:** 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64. Stick to these steps.
- Depth comes from hairline borders + one soft glow, not heavy shadows.

## Components

- shadcn/ui, added as needed. A component that exists there is never hand-rolled.
- **One primary button per screen.** Everything else is `secondary`, `outline` or `ghost`.
- **Cards** group one concern each with their own action — not a card around every element.
- **Every list has an empty state** in QR Studio's voice — "No QR codes yet — create your first one" — never a blank panel.
- **Every destructive action confirms** and says what will be lost.
- Icon-only buttons carry an `aria-label`; interactive targets are ≥44px.

## Voice

Confident, plain, second person, jargon-light. Headlines are short and benefit-led. Errors say what happened and what to do next — "That logo is over 1 MB, try a smaller image" — never "An error occurred". No exclamation-mark spam.

## Never

- A hex, `rgb()` or `oklch()` value inside a component. Tokens only. (QR *content* colours the user picks are data, stored per code — not part of this theme.)
- A font that isn't Inter or JetBrains Mono.
- A one-off radius, shadow or spacing value.
- A colour that only works in one of the two modes — the indigo primary must read on both `#0A0E1A` and `#FFFFFF`.
