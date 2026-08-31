# PHASE 0 — Repository / Environment Inspection

Date of inspection: 2026-08-31

## 1. Repository state

| Item | Finding |
|---|---|
| Path | `E:\VS CODE\z-tires\z-tires` |
| Git | Initialised, branch `main`, **zero commits**, working tree empty |
| Existing source | **None.** No `package.json`, `src/`, `public/`, config, assets or history |
| Sibling projects | `E:\VS CODE\*` contains unrelated projects; none referenced by this one |

**Conclusion:** this is a greenfield repository. There is no legacy code to preserve, reuse or delete.
The "existing implementation" to be replaced is the **live public website only**
(`https://flextyres.com/`), which is external to this repository.

## 2. Toolchain available

| Tool | Version |
|---|---|
| Node.js | v24.16.0 |
| npm | 11.13.0 |
| pnpm / yarn | not installed |
| git | 2.54.0.windows.1 |
| curl | 8.19.0 |
| Python | available (Pillow present) |
| pdftotext | 4.00 |
| OS / shell | Windows 10 Pro, PowerShell + Git Bash |

**Decision:** npm is the package manager (the only one present). Node 24 supports every current
Astro release, so the latest stable Astro can be used.

## 3. Live-site technology detected (the system being replaced)

Detected purely from public HTTP responses, HTML, headers and asset URLs.

| Layer | Finding |
|---|---|
| Server | nginx |
| CMS | WordPress **6.7.7** |
| Structure | **Two parallel WordPress installs on one host** — a legacy root install and the live install under `/en/` |
| Theme | `autoser` (commercial auto-service theme) |
| Page builder | WPBakery / `js_composer` 6.4.0 plus a Divi-style icon plugin |
| Legacy theme | Divi (root install) |
| SEO plugin | Yoast SEO 24.6 (`/en/`), All in One SEO (root, stale) |
| Commerce | WooCommerce present but **unused** — `cart`, `checkout`, `my-account`, `shop`, `shop-3` are all empty |
| Forms | Contact Form 7 6.0.5 plus `wpcf7-redirect` plus reCAPTCHA v3 |
| Sliders | Slider Revolution 6.2.23, Owl Carousel, FlexSlider, Vegas, cubePortfolio |
| Reviews | `wp-google-places-review-slider`, `fb-reviews-widget`, `widget-google-reviews`, `rich-reviews` (four separate review plugins) |
| Legal | `auto-terms-of-service-and-privacy-policy` (wpautoterms) |
| Translation | GTranslate plugin — **client-side Google machine translation**, no real translated URLs |
| Cookies | `eu-cookie-law` |
| Analytics | gtag x3 — `UA-129455084-1` (dead Universal Analytics), `AW-1015016995` (Ads), `G-GV9FHYB4FT` (GA4) |
| Fonts | Google Fonts x2 requests — Open Sans (6 weights), Poppins (**18 weights**), Roboto (2 weights) |
| Icons | Font Awesome 5.15.4 loaded **twice** (CDN plus bundled) plus a Divi icon set plus Dashicons |
| JS runtime | jQuery 3.7.1 plus jquery-migrate plus Bootstrap |

## 4. Public endpoints and files inventoried

| Endpoint | Status | Note |
|---|---|---|
| `/robots.txt` | 200 | Points at `/sitemap.xml` and `/sitemap.rss` (root install only) |
| `/sitemap.xml` | 200 | **Stale AIOSEO index** for the legacy root site |
| `/en/sitemap_index.xml` | 200 | Live Yoast index — **not referenced by robots.txt** |
| `/en/robots.txt` | 404 | Serves an HTML 404 page |
| `/EUSIZESFLEX.xlsx` | 200 | 108 KB public stock/size order sheet (last modified 2021-08-29) |
| `/EUSIZESFLEX.pdf` | 200 | 613 KB PDF of the same order sheet |
| `/en/Terms & Conditions.pdf` | 200 | 170 KB purchasing terms, "Last updated: October 1, 2012" |
| `/feed/`, `/comments/feed/` | 200 | Legacy RSS |
| `/wp-login.php` | 200 | Public admin login (expected for WordPress) |
| `/es/` | 403 | Forbidden — no Spanish site |
| `/fr/` | 301 | Redirects to `/frequently-asked-questions/` (misconfiguration) |
| `/nl/ /de/ /it/ ...` | 404 | No other language installs |

## 5. Measured baseline (live homepage `/en/`)

| Metric | Value |
|---|---|
| HTML (uncompressed) | 148,528 B |
| CSS | 1,547,500 B across 23 stylesheets |
| JavaScript | 2,404,522 B across 39 scripts |
| Images | 4,686,066 B |
| **Total (uncompressed)** | **8,786,616 B — approx. 8.79 MB** |
| Sub-resource requests | 98 (1 failed) |

This is the baseline the rebuild must beat.

## 6. What exists / is reusable / is obsolete

### Must be preserved (legitimate business substance)
- Brand identity: logo mark, green and charcoal palette, "FlexTyres" wordmark
- All genuine business copy: services, quality grades, FAQs, franchise, recycling, sprinter offer
- Real warehouse and product photography (`uploads/2019/*`, `uploads/2020/10/WhatsApp-Image-*`)
- Contact data, business hours, locations, WhatsApp / phone / email
- The public tyre-size lists (car and truck), container quantities, minimum orders
- The six published customer testimonials
- Purchasing Terms PDF and the stock-list XLSX/PDF as downloadable documents
- YouTube channel and the two embedded videos
- The published Google MyMaps export map
- URL paths that carry link equity

### Reusable with rework
- Sitemap and canonical concepts (implementation is broken — see Phase 1)
- Contact Form 7 endpoints, replaced by a documented static-friendly integration point
- Google Analytics 4 property `G-GV9FHYB4FT` (owner decision to keep)

### Obsolete — must be removed
- The entire duplicate legacy root WordPress site (14 indexable duplicate pages)
- WooCommerce shell (`/cart/`, `/checkout/`, `/my-account/`, `/shop/`, `/shop-3/`) — no products exist
- **Theme demo content still live and indexable**: 8 fake staff profiles, 6 fake auto-repair "portfolio" services, 5 empty taxonomy archives
- `hello-world/` default post, the `A WordPress Commenter` comment, the `Uncategorized` category
- `/en/bot/` — an empty page
- Three separate review plugins and their duplicated widgets
- Universal Analytics `UA-129455084-1` (property no longer collects data)
- jQuery, Bootstrap, WPBakery, Slider Revolution, Vegas, Typed.js, cubePortfolio, Owl Carousel, Font Awesome x2, Dashicons — none are needed for the content that exists
- GTranslate client-side machine translation

### Must be replaced
- Static hosting and build pipeline (Astro, static output)
- Metadata generation (currently duplicated and truncation-prone)
- Structured data (currently generic Yoast boilerplate that does not describe the business)
- Image pipeline (currently unoptimised PNG/JPEG at the wrong dimensions)
- Form handling (no backend can be reconstructed from public information)

## 7. Migration risks identified

| # | Risk | Severity | Mitigation |
|---|---|---|---|
| R1 | Two live indexable sites with near-duplicate content | **Critical** | Single canonical site; 301 every legacy URL (Phase 4) |
| R2 | Public fabricated staff and services from theme demo data | **Critical** | Do not migrate; redirect; documented in trust conflicts |
| R3 | Conflicting factual claims between pages (hours, addresses, tread depths, minimum order) | **Critical** | `CONTENT_TRUST_CONFLICTS.md`; owner verification where unresolvable |
| R4 | No reconstructable form backend | High | Ship an accessible form with a documented, swappable endpoint; mailto and WhatsApp fallbacks always present |
| R5 | Third-party brand logos (Michelin, Pirelli, ...) displayed on source | Medium | Migrate brand **names** as text; logo reinstatement is an owner decision |
| R6 | Undated promotional claim ("10% off today, limited time") | Medium | Migrate without the false-urgency framing; flag for owner |
| R7 | Terms PDF contains an unfilled template placeholder and a blank dispute-resolution selection | Medium | Link the original document; do not restate its defects as site copy |
| R8 | Google review avatars hotlinked from `googleusercontent.com` | Low | Do not hotlink; render initials |
| R9 | WhatsApp icon hotlinked from the unrelated domain `usedtiresquote.com` | Low | Self-host an inline SVG |
| R10 | Loss of ranking for `/en/*` paths if slugs change | High | Preserve `/en/`-era slugs where sensible; full redirect map |

## PHASE RESULT

**Status: PASS**

### Completed
Repository, toolchain, live-site stack, public endpoints, downloadable documents and a measured
performance baseline are all documented.

### Findings
Greenfield repo; nothing to preserve locally. The live site is a WordPress 6.7.7 install running a
commercial auto-service theme, duplicated across two installs, carrying unremoved theme demo
content and 8.79 MB of homepage payload.

### Changes Made
None to any live system. Created `_research/` (crawl workspace) and `docs/PHASE-0-ENVIRONMENT.md`.

### Audit Results
- Repository understood — PASS
- Baseline build understood — PASS (no local build exists; live baseline measured instead)
- Technical dependencies identified — PASS
- Migration risks documented — PASS (R1–R10)

### Remaining Risks
R1–R10 carried into later phases. None block Phase 1.

### Files Changed
- `docs/PHASE-0-ENVIRONMENT.md` (new)
- `_research/**` (crawl workspace, excluded from the shipped site)

### Exit Criteria
All four Phase 0 exit criteria met.

### Next Phase
Phase 1 — Full public website crawl and inventory.
