# PHASE 2 — Content, Asset, Design and Brand Reverse Engineering

## 1. Image inventory

**148 unique image URLs** referenced across the site. 132 are `wp-content/uploads` assets; the
remainder are plugin sprites, flag icons and hotlinked third-party images.

Original-resolution files were resolved by stripping WordPress size suffixes and re-fetching:
**130 of 132 downloaded successfully (20.5 MB)**; 2 returned 404 (`IMG-20190513-WA0010.jpg`,
`WhatsApp-Image-2019-03-29-at-22.07.161-576x1024.jpeg` — both are thumbnails whose originals were
deleted at source). Catalogue: `_research/img-meta.json`.

### 1.1 Classification

Every downloaded image was visually inspected via contact sheets
(`_research/contact/sheet1.jpg`, `sheet2.jpg`).

| Group | Files | Verdict |
|---|---|---|
| **Genuine FlexTyres warehouse photography** | `uploads/2020/10/WhatsApp-Image-2020-10-04-at-*.jpeg` (14), `uploads/2019/05/IMG-2019051*` (32), `uploads/2019/10/index*-1.jpg` (10), `uploads/2019/01/20190130_*.jpg` (5), `uploads/2019/01/WhatsApp-Image-2019-03-*.jpeg` (9) | **PRESERVE** — real stock, real containers, real loading |
| **Genuine FlexTyres process photography** | `service1.jpg` (tripling machine), `service-copy.jpg` (forklift loading a container), `service4.jpg` (loaded container), `about3.jpg` (tripling machine in warehouse), `a2.jpg` (worker at tyre racks), `slider-bg-2-2.jpg` (hero, tyre stacks) | **PRESERVE** |
| **Genuine FlexTyres marketing graphic** | `a1.jpg` — "CAN YOU TELL WHICH TIRE IS USED?" | **PRESERVE** |
| **Brand identity** | `logo-new2.png` (470×319), `footer-logo-new.png` (100×68), legacy `flextyres-website-logo-1.png` (449×305) | **PRESERVE** |
| **Theme stock — mechanics in blue overalls** | `work-1…8-640x640-2.jpg`, `member-1…4-303x363-2.jpg`, `technicial-3.png`, `bg-why-1-2.jpg`, `slider-bg-3.jpg`, `gallery-*-full-2.jpg`, `gallery-*-848x439*.jpg` | **DISCARD** — depicts a consumer auto-repair garage, not a tyre wholesaler; supplied with the `autoser` theme |
| **Third-party manufacturer logos** | `Michelin-logo.png` (4000×1000, 478 KB), `Pirelli-logo-1.png`, `Dunlop-Logo.png`, `Continental-logo-1.png`, `Bridgestone-logo.png` | **DISCARD as images** — see `CONTENT_TRUST_CONFLICTS.md` C-24; brands published as text |
| **Plugin chrome** | GTranslate flag PNGs (5), `cart.png`, Google logo, PDF/Excel icons, `yt-300x120.png`, `The-Credit-Dude-Got-Credit-Google-Reviews.jpg` | **DISCARD** — replaced by inline SVG |
| **Hotlinked third-party** | `usedtiresquote.com/.../WA-300x104.png`, 6 × `lh3.googleusercontent.com` avatars, `secure.gravatar.com` | **DISCARD** — cross-domain dependencies; replaced by inline SVG and rendered initials |

### 1.2 Defects recorded per image

| Defect | Count | Detail |
|---|---|---|
| Empty `alt=""` on informative images | ~120 | Every warehouse photo, every gallery image, every brand logo |
| Missing `alt` attribute entirely | 6 | Header/footer chrome |
| Non-descriptive filename | ~110 | `WhatsApp-Image-2020-10-04-at-10.43.59-PM-copy-1.jpg`, `index7-1-400x284.jpg`, `work-5-640x640-2.jpg` |
| Oversized for container | 9 files > 300 KB | `20190130_134423-1.jpg` is **4032×1960** (647 KB); `Michelin-logo.png` is **4000×1000** (478 KB) |
| Portrait photo forced into landscape slot | 14 | `900×1600` and `777×1600` WhatsApp photos rendered into a 6-up footer strip |
| No `width`/`height` on most `<img>` | ~90 | Layout-shift source |
| No modern format | 130 | All JPEG/PNG; no WebP, no AVIF |
| Duplicate uploads of the same photo | 12 pairs | e.g. `…10.52.19-PM-1.jpeg` and `…10.52.19-PM-2.jpeg` |
| Above-the-fold LCP candidate | `slider-bg-2-2.jpg` (1920×620, 873 KB) | Loaded by Slider Revolution **after** JS executes |

### 1.3 Migration plan

- 62 genuine photographs are carried into `src/assets/`, renamed descriptively
  (`warehouse-tyre-stacks-01.jpg`, `container-loading-forklift.jpg`, …).
- Astro's built-in Sharp pipeline emits AVIF + WebP with JPEG fallback, responsive `srcset`,
  and intrinsic `width`/`height` on every image.
- Every informative image receives natural, human-written alt text describing what is in the frame.
- Decorative images use `alt=""` deliberately, not by omission.
- The hero image is `loading="eager" fetchpriority="high"`; everything below the fold is
  `loading="lazy" decoding="async"`.

## 2. Visual system reverse-engineered

### 2.1 Colour

Sampled from the live CSS and from the logo raster (opaque-pixel histogram,
`_research/assets/img/logo-new2.png`).

| Role | Value | Evidence |
|---|---|---|
| Brand green (primary accent) | `#86b43a` | Declared 6× in the site's inline theme override CSS; logo sample `#83b43b` |
| Brand green (bright, logo highlight) | `#a4c21e` | 3,261 opaque logo pixels — the wordmark fill |
| Brand charcoal | `#343435` | 15,404 opaque logo pixels — the dominant logo colour |
| Dark UI surface | `#1f252a` / `#20252b` | Footer and legal-bar background in theme CSS |
| Light surface | `#f7f7f7` | Section backgrounds |
| White | `#ffffff` | |
| Theme default blue (unused, overridden) | `#1c63b8` | 59 occurrences in `autoser/style.css` — vestigial |
| Accent stripes | red / amber / black | Logo speed-lines (German flag reference) |

The brand is **green + charcoal**. The theme's stock blue never surfaces; it is dead CSS shipped on
every request.

### 2.2 Typography

| Family | Weights loaded | Actually used |
|---|---|---|
| **Poppins** | **18** (100–900, each with italic) | Headings, buttons, nav — 3 weights in practice |
| Open Sans | 6 (400/600/700 + italics) | Body |
| Roboto | 2 (400/700) | Loaded by a second Google Fonts request; no visible use |

Two separate Google Fonts requests load **26 font faces** for a site that renders three.
Type hierarchy observed: uppercase display headings with wide letter-spacing, sentence-case body,
uppercase button labels.

**Rebuild:** Poppins (600, 700) + Inter (400, 600) — 4 self-hosted woff2 faces, `font-display: swap`,
subset to `latin`. Roboto and Open Sans are dropped; Open Sans's role is filled by Inter, which is
metrically closer to the observed body rendering and ships smaller.

### 2.3 Components observed

| Pattern | Source behaviour | Rebuild decision |
|---|---|---|
| Top utility bar | Locations, phone, hours | Keep — high-value NAP above the fold |
| Sticky header | Logo, 5-item nav with 2 dropdowns, phone, WhatsApp, quote CTA | Keep; rebuild as pure CSS + one small JS island for the mobile drawer |
| Hero | Slider Revolution, 3 slides, JS-dependent, Vegas background | Replace with a **static** hero — LCP becomes a real `<img>`, not a JS-injected background |
| Quality grade cards | 3-up, icon + tread depth + grade + "All brands" | Keep — converted to a semantic `<table>` (it is tabular data) |
| Service cards | 4-up, icon + title + text + "READ MORE" | Keep |
| Counter block | `countto.js` animated numerals | **Remove** — see C-08 |
| Progress bars ("TOP QUALITY TIRES 100%") | Decorative percentage bars | **Remove** — meaningless metrics |
| Testimonial slider | Owl Carousel, JS-dependent | Replace with a static CSS grid — content becomes crawlable without JS |
| Brand logo strip | 5 manufacturer PNGs | Replace with a text list — see C-24 |
| Gallery | cubePortfolio + Magnific Popup lightbox | Replace with a CSS grid of `<figure>`s; no lightbox library |
| Footer | 3 columns + 6-image strip + legal bar | Keep, restructured |
| Cookie banner | `eu-cookie-law`, blocks nothing | Only ships if analytics ships — see Phase 13 |
| Forms | Contact Form 7 + reCAPTCHA v3 | Rebuild as native HTML with a swappable endpoint |

### 2.4 Design tokens proposed

Full token set is implemented in `src/styles/tokens.css` and documented in `DESIGN_SYSTEM.md`
(Phase 7). Summary: 2 font families / 4 faces, a 9-step neutral ramp anchored on `#343435`,
a 5-step green ramp anchored on `#86b43a`, an 8-point spacing scale, 3 radii, 2 shadows,
4 breakpoints, 1 container width.

## 3. Content reverse-engineering — what is genuinely there

| Content asset | Location in source | Value |
|---|---|---|
| Car quality grades (3 tiers, tread depth, grade letter) | Homepage, About, Tripling, legacy Cars | **High** — the core product spec |
| Truck quality grades (3 tiers, retread/damage/export rules) | **Legacy install only** | **High** — unique, at risk of being lost |
| Car tyre size list, rim 12″–22″ | 4 divergent sources + XLSX/PDF | **High** |
| Truck tyre size list, 15 sizes | Truck quote form + XLSX | **High** |
| Container capacities (20 ft ≈ 1,350 / 40 ft ≈ 2,800 tripled; truck 130 / 270) | Quote forms | **High** |
| 4 documented services | Services page + homepage | **High** |
| Tripling by machine vs by hand | Tripling page, legacy Cars page | **High** |
| 7 FAQ question/answer pairs | FAQs, legacy FAQ | **High** |
| Sprinter van delivery offer (180 tyres, 4–6 mm, sets of 2, ≤7 days, 400 km free radius, 50/50 or 80/20 summer/winter mix) | Sprinter page (orphaned) | **High** — richest commercial content on the site |
| Export destination list (12 countries/regions) | **Legacy About only** | **High** — the only concrete geography published |
| Recycling: chips and bales, two grades | Tire Recycling, legacy Recycling | Medium |
| Franchise package (contract, equipment, container of tyres, merchandise) | Homepage + Franchise page | Medium |
| 6 customer testimonials with names and dates | Homepage | Medium |
| Purchasing terms (net 30, 3-day inspection, 10 % restocking, 50-tyre refund cap, Belgian law) | Terms PDF | Medium |
| Google MyMaps export map | Homepage embed (`mid=1u1QPLAhv9a2GRMRWLUIdjpSOs0fgKiNq`) | Medium |
| 2 YouTube videos | Homepage (`qZ2zQQBqHQg`), Stock page (`AbRg1MrSFe4`) | Medium |
| 62 genuine photographs | Across both installs | Medium |

## PHASE RESULT

**Status: PASS**

### Completed
148 image URLs inventoried and 130 originals retrieved and visually classified; brand palette
sampled from source CSS and logo raster; typography, component patterns and design tokens
reverse-engineered; every genuine content asset catalogued; 24 content-trust conflicts documented.

### Findings
The visual identity is **green `#86b43a` + charcoal `#343435`**, not the theme's stock blue.
26 font faces are loaded to render three. Roughly a quarter of the site's imagery is theme stock
depicting a business FlexTyres is not. The single most valuable content asset — truck tyre grading —
exists only on the abandoned legacy install and would be lost by a naive `/en/`-only migration.

### Changes Made
`CONTENT_TRUST_CONFLICTS.md` (24 conflicts, 15 owner decisions), `docs/PHASE-2-ASSETS-AND-BRAND.md`,
130 original images retrieved to `_research/assets/orig/`.

### Audit Results
- Public assets inventoried — PASS
- Visual system understood — PASS
- Design tokens proposed — PASS
- Content and brand risks documented — PASS (24 conflicts, C-01 … C-24)

### Remaining Risks
15 owner decisions open (6 at P1, two of them legal). None blocks implementation: every one has a
documented least-misleading fallback in place.

### Files Changed
`CONTENT_TRUST_CONFLICTS.md`, `docs/PHASE-2-ASSETS-AND-BRAND.md`, `_research/assets/**`

### Exit Criteria
All four Phase 2 exit criteria met.

### Next Phase
Phase 3 — Information architecture audit.
