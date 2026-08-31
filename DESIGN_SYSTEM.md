# DESIGN_SYSTEM.md

The visual system is reverse-engineered from the live site, not invented. Colours are sampled from
the source CSS and from the FlexTyres logo raster; type and component patterns follow what the
`autoser` theme actually rendered, rebuilt without its 1.5 MB of stylesheet.

Tokens live in [`src/styles/tokens.css`](src/styles/tokens.css).

---

## 1. Colour

### Provenance

| Value | Where it came from |
|---|---|
| `#86b43a` | Declared 6× in the live site's own inline theme-override CSS — the accent the site actually uses |
| `#a4c21e` | 3,261 opaque pixels in `logo-new2.png` — the wordmark fill |
| `#343435` | 15,404 opaque pixels in the logo — its dominant colour |
| `#1f252a` | Footer and legal-bar surface in the theme CSS |
| `#f7f7f7` | Section background in the theme CSS |
| ~~`#1c63b8`~~ | The `autoser` theme's stock blue — 59 occurrences in `style.css`, **never rendered**. Deliberately absent here. |

### Green ramp

| Token | Value | Use |
|---|---|---|
| `--c-green-50` | `#f4f8ea` | Answer-block and callout backgrounds |
| `--c-green-100` | `#e4eecd` | Avatar circles |
| `--c-green-300` | `#b9d472` | Accents on dark surfaces |
| `--c-green-500` | `#86b43a` | **Brand accent** — borders, rules, non-text marks |
| `--c-green-600` | `#6f9a2c` | Reserved; 3.32:1 on white, so never used for text or buttons |
| `--c-green-700` | `#55771f` | **Link text (5.19:1)** and **solid button background (5.19:1)** |
| `--c-green-800` | `#3d5715` | Button hover (8.16:1), answer labels |

The brand green is kept for everything it can legitimately do. It cannot carry white text at AA
(2.1:1), so `--c-accent-solid` maps to the 700 step. See `DECISIONS.md` D-13.

### Neutral ramp

| Token | Value | Use |
|---|---|---|
| `--c-ink-950` | `#16191b` | Hero overlay base |
| `--c-ink-900` | `#1f252a` | Footer, utility bar, dark sections, body text |
| `--c-ink-800` | `#2a2f33` | Nav links |
| `--c-ink-700` | `#343435` | **Logo charcoal** — secondary text |
| `--c-ink-500` | `#62686d` | Muted text (5.64:1 on white) |
| `--c-ink-300` | `#c7ccd1` | Strong borders |
| `--c-ink-200` | `#e2e6e9` | Default borders |
| `--c-ink-100` | `#f0f2f4` | Image placeholders |
| `--c-ink-50` | `#f7f7f7` | Subtle section background |

### Semantic tokens

`--c-bg`, `--c-bg-subtle`, `--c-bg-inverse`, `--c-text`, `--c-text-muted`, `--c-text-inverse`,
`--c-text-inverse-muted`, `--c-border`, `--c-border-strong`, `--c-accent`, `--c-accent-text`,
`--c-accent-solid`, `--c-accent-solid-hover`, `--c-focus` (`#0b6bcb`), `--c-danger` (`#b3261e`).

**Every pairing is contrast-verified.** 19 pairs are computed from these values in
`scripts/check-a11y.mjs` and fail the build below AA. Table in `ACCESSIBILITY_AUDIT.md` §2.

## 2. Typography

### What the live site does

Poppins in **18 weights**, Open Sans in 6, Roboto in 2 — **26 faces across 2 render-blocking
Google Fonts requests** — to render three.

### What this site does

| Family | Weights | Role | Size |
|---|---|---|---|
| **Poppins** | 600, 700 | Headings, buttons, nav, table headers | 15.8 KB |
| **Inter** | 400, 600 | Body, UI text | 48.1 KB |

Self-hosted woff2, latin subset, **62.4 KB total**, `font-display: swap`. The two above-the-fold
faces are preloaded. No connection to `fonts.googleapis.com` or `fonts.gstatic.com`.

Inter replaces Open Sans: metrically closer to the observed body rendering and smaller. Roboto was
loaded but never used.

### Scale

Fluid via `clamp()`, so there are no breakpoint jumps:

| Token | Value |
|---|---|
| `--fs-xs` | `0.8125rem` |
| `--fs-sm` | `0.9062rem` |
| `--fs-base` | `1rem` |
| `--fs-md` | `1.0625rem` (body) |
| `--fs-lg` | `clamp(1.125rem, 0.35vw + 1.05rem, 1.25rem)` |
| `--fs-xl` | `clamp(1.375rem, 0.7vw + 1.2rem, 1.625rem)` |
| `--fs-2xl` | `clamp(1.625rem, 1.3vw + 1.35rem, 2.125rem)` |
| `--fs-3xl` | `clamp(2rem, 2.4vw + 1.5rem, 3rem)` |

Line heights: `--lh-tight` 1.15 (headings), `--lh-snug` 1.3, `--lh-normal` 1.65 (body).
Measure is capped at `68ch` on paragraphs and `66ch` on list items. Headings use
`text-wrap: balance`, body uses `text-wrap: pretty`.

## 3. Spacing, layout, shape

8-point scale: `--s-1` 4px through `--s-9` 96px.

| Token | Value |
|---|---|
| `--container` | `74rem` |
| `--container-narrow` | `48rem` |
| `--gutter` | `clamp(1rem, 4vw, 2.5rem)` |
| `--section-y` | `clamp(3rem, 7vw, 5.5rem)` |

Radii: `--r-sm` 4px, `--r-md` 8px, `--r-lg` 14px, `--r-pill` 999px.
Shadows: `--shadow-sm`, `--shadow-md` — two only, both neutral-tinted.

Breakpoints (min-width, em-based): **30em** stacked-to-columns · **40em** 2-up grids ·
**56em** split layouts · **60em** 3-up grids · **64em** desktop navigation.

## 4. Components

| Component | Notes |
|---|---|
| `Header` | Utility bar (locations, hours) + sticky nav. Dropdowns are `:hover`/`:focus-within` — no JS. Logo height-constrained so it can never overflow the bar. |
| `Footer` | 5 columns, downloads block, legal bar. All links from `nav.ts`. |
| `Breadcrumbs` | Rendered whenever depth > 1; mirrored exactly by `BreadcrumbList` schema (build-verified). |
| `PageHeader` | Eyebrow + `<h1>` + lede. One H1 per page. |
| `AnswerBlock` | Green-bordered block directly under the H1. The AEO primitive. |
| `CTABand` | Dark band: quote CTA + phone + WhatsApp. |
| `GradeTable` | Semantic table with caption and scoped headers. |
| `SizeTable` | Sizes grouped by rim, with the stock caveat above. |
| `QuoteForm` | Native HTML. Labels, autocomplete, `inputmode`, honeypot, `<details>` size pickers. |
| `FAQList` | Native `<details>`; question is a real heading inside `<summary>`. |
| `Testimonials` | CSS grid. Initials rendered, never hotlinked avatars. |
| `RelatedLinks` | Descriptive anchor + hint. |
| `SEOHead` | Metadata, OG/Twitter, JSON-LD, preloads. Validates and throws. |

### Button variants

| Class | Background | Text | Contrast |
|---|---|---|---|
| `.btn--primary` | `--c-accent-solid` | white | 5.19:1 |
| `.btn--dark` | `--c-ink-900` | white | 15.48:1 |
| `.btn--ghost` | transparent, bordered | `--c-ink-800` | 12.6:1 |

All buttons: `min-height: 3rem` (48px), Poppins 600, `--r-md`.

## 5. Interaction and motion

Focus: 3px `--c-focus` ring, 2px offset, on `:focus-visible` only — visible for keyboard users,
absent for mouse users, never removed.

Motion: `--t-fast` 120ms, `--t-base` 200ms, `cubic-bezier(0.2, 0, 0.2, 1)`. Under
`prefers-reduced-motion: reduce` both drop to ~0ms and `scroll-behavior: smooth` is disabled. No
autoplay, no carousel, no parallax.

Tap targets: 44×44 minimum on every control, verified in a real browser at four viewports.

## 6. Imagery

| Rule | Implementation |
|---|---|
| Genuine FlexTyres photography only | 64 curated images; all theme stock discarded |
| Descriptive filenames | `warehouse-tyre-stacks.jpg`, not `index7-1-400x284.jpg` |
| Alt text | Hand-written per image, describing what is in the frame |
| Decorative images | `alt=""` deliberately, never by omission |
| Formats | AVIF + WebP + fallback, responsive `srcset` per layout slot |
| Dimensions | Intrinsic `width`/`height` always present — CLS 0.0000 on mobile |
| Loading | Hero `eager` + `fetchpriority="high"` + preload; everything else `lazy` + `decoding="async"` |
| Quality | 58 hero, 64 gallery, 68–70 content |
| Cap | 320 KB per emitted variant (enforced); largest is 239 KB |

## 7. Voice

Preserved from the source where it is genuine: *"We know that honesty and transparency, coupled
with reliable and friendly customer service, is what really builds customer trust."*

Applied consistently:

- **Attribute company claims.** "FlexTyres states it holds more than 100,000 tyres" — not "we hold".
- **State limitations plainly.** Every service page has a "What is publicly known about
  limitations" section.
- **No unsupported superlatives.** "The number-one used tire company" was dropped.
- **Quote the source verbatim** where its own words are clearer, in quotation marks.
- **British English**, except inside quotations, where the source's spelling is preserved.
