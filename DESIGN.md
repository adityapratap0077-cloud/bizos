# DESIGN.md — BizOS remake ("Ledger")

Durable visual decisions for the BizOS front-end remake. This replaces the original's generic indigo/gray SaaS look; it does not change product truth (see PRODUCT.md).

## Design read

**"Operate"** — a precise, confident, ledger-inspired tool for a one-person business. The aesthetic reference is a well-kept ledger: tabular figures, clear hierarchy, honest weight. Calm, fast, trustworthy. Never playful, never gamified.

## Palette (Tailwind tokens, `tailwind.config.js`)

| Token | Hex family | Role |
|---|---|---|
| `ink` | #0B0E0C → #F5F7F6 | Neutrals, cool-ink, replacing all gray/slate usage |
| `pine` | #052E22 → #ECF5F1 | Brand accent; primary actions, active nav, won/paid states |
| `gold` | #8A6D1B → #FBF7EA | Pending/caution states |
| `clay` | #7C2D1E → #FBF1EC | Errors, lost/cancelled/high-priority states |
| `sky` | #1D5C8A → #EEF6FC | Informational ("New" lead) |
| `grape` | #5B3B8C → #F4EFFB | Distinguishing ("Qualified" lead) |

Rules:
- **One brand accent: pine.** Status colors are semantic but secondary.
- No purple/blue/indigo gradients anywhere. Buttons are solid pine or ink, with tactile press feedback.
- Focus rings: visible pine `focus-visible` ring on every interactive element.

## Typography

- **Display:** Space Grotesk (headings, hero, logo wordmark) — geometric confidence.
- **Body/UI:** Inter Tight (labels, form fields, tables) — neutral and legible.
- **Figures:** JetBrains Mono (amounts, invoice numbers, counts, timestamps) — ledger feel, tabular numerals.
- `.tnum` utility forces tabular-nums where proportional text wraps figures.
- Semantic case: page titles 24–32px/700; section titles 15–17px/650; labels 12–13px uppercase mono where ledger-like.

## Radius

- Surfaces (cards, modals, hero panels): **16px** (`rounded-surface`).
- Controls (buttons, inputs, selects): **12px** (`rounded-control`).
- Status badges: full pill.
- No other radii.

## Motion

- Purposeful only. Fast press feedback (`.pressable`: scale .98 on active).
- Short staggered entry reveals on dashboards and landing (`stagger`, `fade-up` keyframes); landing hero elements rise 12–20px over ~600ms.
- One restrained marquee (pipeline strip) — the single ambient motion on the landing.
- `prefers-reduced-motion` disables all of it.
- Lenis smooth scrolling on the landing page only (app pages use native scroll).
- Duration rule: entrances ≤ 700ms, exits ~200ms, easing `cubic-bezier(.22,1,.36,1)`.

## Mobile behavior (Android-first)

- All data tables collapse below 640px into **structured mobile cards** (same data, card rows with label/value pairs); action columns become card footers. Implemented once in `DataTable`; no per-page work.
- App shell: sticky top bar + hamburger drawer with Escape-to-close and body scroll lock; desktop gets an ink-black sidebar.
- Touch targets ≥ 44px; hover styles gated behind `@media (hover:hover)` so tap doesn't leave stuck states.
- Modals stack footer buttons on narrow screens.

## Iconography

- Phosphor icons only (`@phosphor-icons/react`), duotone weight preferred. No hand-rolled SVGs (spinner excepted), no emoji as UI icons.

## What changed vs the original

- indigo → pine; gray/slate → ink; green → pine; amber/yellow → gold; red → clay; blue → sky; purple → grape — remapped across every component and page.
- `ui.tsx` rebuilt: buttons, inputs, cards, badges, modals, empty states, page headers, stat cards, tables — same APIs, new system.
- AppShell rebuilt: ink-black sidebar, Phosphor icon family, branded mark, mobile drawer.
- Landing page rebuilt from scratch (`LandingClient.tsx`): asymmetric split hero with real miniature app preview, pipeline marquee, feature bento, numbered how-it-works, pricing/roadmap, FAQ — all claims drawn from PRODUCT.md.
- New: `PRODUCT.md`, `DESIGN.md`.

## What was deliberately NOT done

- No Three.js/shaders/Vanta/liquid-glass in the operational app — decoration would harm clarity in an Operate-mode tool.
- No marketing claims invented: the landing only states modules, free tier, and features that exist.
