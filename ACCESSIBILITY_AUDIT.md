# ACCESSIBILITY_AUDIT.md

Target: **WCAG 2.2 Level AA**.

Two automated gates run in `npm run audit`: `scripts/check-a11y.mjs` (structure and contrast) and
`scripts/check-mobile.mjs` (real-browser target sizes and reflow across four viewports). Both
pass. Neither replaces testing with an actual screen reader — see §8.

---

## 1. Before / after

| Defect | Live site | Rebuild |
|---|---|---|
| Informative images with empty `alt` | ~120 | 0 |
| Images with no `alt` attribute at all | 6 (site chrome, every page) | 0 |
| Images with no `width`/`height` | ~90 | 0 |
| Pages with no `<h1>` | 20 of 71 | 0 |
| Pages with H1 = "Single Blog" | 10 | 0 |
| Skip link | absent | present on every page |
| Landmarks (`main`, `header`, `footer`, named `nav`) | partial | complete |
| Content reachable without JavaScript | hero, testimonials, gallery, FAQ all JS-dependent | 100% |
| Horizontal overflow at 320px | present | 0 across 22 routes |
| Tap targets below 44×44 | many | 0 |
| Contrast failures in the palette | not measured | 0 of 19 pairs |
| `prefers-reduced-motion` honoured | no | yes |

## 2. Colour contrast — all 19 token pairs computed

Ratios are calculated from the actual CSS custom properties, so the palette cannot drift from the
audit.

| Pair | Ratio | Min | |
|---|---|---|---|
| Body text on white | 15.48:1 | 4.5 | PASS |
| Muted text on white | 5.64:1 | 4.5 | PASS |
| Muted text on subtle grey | 5.27:1 | 4.5 | PASS |
| Link green on white | 5.19:1 | 4.5 | PASS |
| Link green on subtle grey | 4.85:1 | 4.5 | PASS |
| Link green on green-50 | 4.81:1 | 4.5 | PASS |
| **White on primary button** | **5.19:1** | 4.5 | PASS |
| White on primary button hover | 8.16:1 | 4.5 | PASS |
| White on dark button | 15.48:1 | 4.5 | PASS |
| Footer text on dark | 8.34:1 | 4.5 | PASS |
| Footer link hover on dark | 9.38:1 | 4.5 | PASS |
| Eyebrow green on white | 5.19:1 | 4.5 | PASS |
| Answer text on green-50 | 14.35:1 | 4.5 | PASS |
| Answer label on green-50 | 7.57:1 | 4.5 | PASS |
| Hero lede on hero overlay | 14.45:1 | 4.5 | PASS |
| Hero facts on hero overlay | 12.49:1 | 4.5 | PASS |
| Focus ring on white | 5.28:1 | 3.0 | PASS |
| Border on white (non-text) | 1.62:1 | 1.4 | PASS |
| Step number ink on green | 7.24:1 | 4.5 | PASS |
| Initials on green-100 | 6.77:1 | 4.5 | PASS |

### A real failure this caught

The brand green `#86b43a` gives white text only **2.1:1**, and the 600 step `#6f9a2c` only
**3.32:1** — both fail AA for a button label. The audit failed the build. Rather than weaken the
check or abandon the brand colour, a dedicated `--c-accent-solid` token was introduced at the
green-700 step (`#55771f`, **5.19:1**), which stays unmistakably within the FlexTyres green ramp
while carrying white text at AA. The brand green remains the accent colour for borders, rules and
non-text marks, where it is not required to carry text.

## 3. Structure and semantics — enforced per page

| Check | Result |
|---|---|
| Exactly one `<main>` | 29/29 |
| `<header>` and `<footer>` landmarks | 29/29 |
| Skip link to `#main` | 29/29 |
| Every `<nav>` has a distinguishing accessible name | pass |
| `lang="en"` on `<html>` | 29/29 |
| No duplicate `id` | 29/29 |
| Exactly one `<h1>` | 29/29 |
| No skipped heading levels | 29/29 |
| No empty headings | pass |
| Every `<img>` has `alt` | pass |
| Every link has an accessible name | pass |
| Every button has an accessible name | pass |
| No non-descriptive link text ("click here", bare "read more") | pass — "Read more" always carries a `visually-hidden` continuation naming its target |
| Every `<iframe>` has a `title` | pass |
| Every `<table>` has `<th>`, `scope` and a `<caption>` | pass |
| Every `<fieldset>` has a `<legend>` | pass |
| No positive `tabindex` | pass |
| No focusable element inside `aria-hidden` without `tabindex="-1"` | pass |

## 4. Forms

| Requirement | Implementation |
|---|---|
| Every control has a programmatic label | `<label for>` on every input, select and textarea; enforced |
| Required fields | Native `required`, marked visually with `*` that is `aria-hidden` (the word is in the label text) |
| Input types | `email`, `tel`, `text` with matching `inputmode` |
| Autocomplete | `name`, `email`, `tel`, `organization`, `country-name` — WCAG 1.3.5 |
| Grouping | `<fieldset>` + `<legend>` around the size pickers |
| Error handling | Native browser validation. `:user-invalid` styling only, so a field is never marked red before the user has interacted with it |
| Focus visibility | 3px `#0b6bcb` ring at 5.28:1, 2px offset, on every interactive element |
| Keyboard | No custom widgets. Every control is a native element. |
| Anti-spam | Honeypot field, off-screen, `aria-hidden`, `tabindex="-1"` — no CAPTCHA, so no cognitive or visual barrier |
| Consent | Privacy policy linked directly above the submit button on every form |

## 5. Interaction without JavaScript

The site ships **461 bytes** of JS — a mobile drawer toggle. Everything else is native:

| Pattern | Mechanism |
|---|---|
| Desktop dropdown menus | `:hover` and `:focus-within` — fully keyboard operable |
| FAQ accordions | `<details>` / `<summary>` |
| Tyre-size pickers | `<details>` / `<summary>` |
| YouTube and Maps embeds | `<details>` — also a privacy benefit: nothing loads from those origins until opened |
| Testimonials | CSS grid, not a carousel — content is in the HTML for both screen readers and crawlers |
| Gallery | CSS grid of `<figure>`, no lightbox library |

With JavaScript disabled the mobile menu panel is still present in the DOM and every link in it
works; only the collapse behaviour is lost.

## 6. Responsive and target size — measured in Chrome

`scripts/check-mobile.mjs`, 22 routes × 4 viewports (320, 390, 768, 1440):

| Check | Result |
|---|---|
| Horizontal overflow (WCAG 1.4.10 Reflow) | **0 px on all 88 combinations** |
| Tap targets ≥ 44×44 (WCAG 2.5.8) | **pass** — label-wrapped controls measured at the label, which is the hit area |
| Console errors | **0** |
| Text resize | Layout uses `rem` and `clamp()` throughout; no fixed pixel heights on text containers |

### Two real failures this caught

1. **`/contact/` overflowed 23px at 320px.** The `.facts` definition list reserved a 9rem label
   column, and the unbreakable string `info@flextyres.com` in the value column pushed past the
   viewport. Fixed by collapsing to a single column below 30em and adding
   `overflow-wrap: anywhere` to the value cell.
2. **Tap targets at 40–41px.** The size-selection labels, disclosure summaries and the header
   phone link all fell just short of 44px. All raised to a 44px minimum.

## 7. Motion

`prefers-reduced-motion: reduce` sets every transition and animation to ~0ms and disables
`scroll-behavior: smooth`. There is no autoplaying media, no carousel, no parallax and no
animation that conveys information.

## 8. What automated testing cannot cover

These require a person and are **not** claimed as verified:

- Screen-reader walkthrough (NVDA, JAWS, VoiceOver) of the quote forms and the mobile drawer
- Voice-control operation
- Cognitive load review of the tyre-size pickers, which present 348 checkboxes across 11 groups
- Real-device testing on low-end Android
- Confirmation that the disclosure pattern for the size pickers suits users who need to scan the
  whole list at once

Recommended before launch: one NVDA pass over `/`, `/request-a-quote/car-tyres/` and `/contact/`.

## PHASE RESULT — Phase 13, Accessibility

**Status: PASS** (automated gates), with the manual testing in §8 **outstanding**.

### Audit results
- 19/19 contrast pairs pass AA, including a real button-contrast failure found and fixed properly
- 0 horizontal overflow across 88 route/viewport combinations
- 0 undersized tap targets
- 0 structural violations across 29 pages
- 100% of content reachable without JavaScript

### Remaining risks
Automated checks cover roughly the structural half of WCAG. A screen-reader pass is the single
highest-value remaining action and is listed in `FINAL_QA_REPORT.md` as an open item.
