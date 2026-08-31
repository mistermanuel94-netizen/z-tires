# SEO_AUDIT.md

Every check below is enforced by `scripts/check-seo.mjs` and `scripts/check-links.mjs`, which run
in `npm run audit` and fail the build on violation. Figures are from the production build.

---

## 1. Before / after

| Check | Live site | Rebuild |
|---|---|---|
| Indexable duplicate sites | **2** (root + `/en/`) | 1 |
| Indexable URLs | 71 | **26** |
| Pages with no meta description | **51 of 71** | 0 |
| Pages sharing one description | **4** | 0 |
| Duplicate titles | **8 pages in 4 pairs** | 0 |
| Longest title | **130 chars** | 62 chars |
| Pages with no `<h1>` | **20** | 0 |
| Pages with multiple `<h1>` | 1 | 0 |
| Pages with H1 "Single Blog" | **10** | 0 |
| Orphan pages | **17** | 0 |
| Broken links in site chrome | **2** (404 PDF, `#`) on every page | 0 |
| Internal links pointing at a redirect | on every page | 0 |
| Redirect chains fed to crawlers | **8** | 0 |
| Sitemap declared in robots.txt | stale one only | correct one |
| `noindex` on the thank-you page | no | yes |
| Fabricated indexable pages | **21** | 0 |

## 2. Crawlability and indexation

| Item | Implementation |
|---|---|
| Protocol | HTTPS only; `upgrade-insecure-requests` in CSP; HSTS `max-age=63072000; includeSubDomains; preload` |
| Canonical host | Single origin, `https://flextyres.com` |
| Trailing slashes | `trailingSlash: 'always'`, enforced in the build and by the host config |
| Homepage | Served at the apex. The live site's `/` → `/en/` hop is removed, so the most-linked URL costs zero redirects |
| robots.txt | Generated at `src/pages/robots.txt.ts`. Fully permissive; declares `sitemap-index.xml`. No CSS, JS, image, font or document path is blocked |
| `noindex` pages | `/thank-you/`, `/legal/` — via meta robots, **not** `Disallow`, so crawlers can read the directive |
| Sitemap | `@astrojs/sitemap`, 26 URLs, canonical and indexable only; utility pages and the 404 excluded; priority tiered by depth |
| 404 | Custom page, `noindex`, **no canonical and no `og:url`** (an error page is not a document at a URL); links to 8 real destinations |
| 410 | 7 URLs — WordPress defaults and dead feeds, which have no equivalent and would be soft-misdirected by a 301 |

**Enforced:** every page that is `noindex` must be absent from the sitemap, and every indexable
page must be present. Build fails otherwise.

## 3. Metadata

All 26 indexable pages carry a unique title and description, generated through
`src/lib/seo.ts`, which throws at build time on a duplicate or an out-of-range length.

| Rule | Limit | Result |
|---|---|---|
| Title length | 15–62 chars incl. brand suffix | 26/26 pass |
| Title uniqueness | site-wide | 26/26 unique |
| Description length | 70–158 chars | 26/26 pass |
| Description uniqueness | site-wide | 26/26 unique |
| Canonical | self-referential, absolute | 26/26 correct |
| `og:url` = canonical | — | 26/26 match |
| OG title/description/image/type/site_name/locale | required | 29/29 pages |
| `twitter:card` = `summary_large_image` | required | 29/29 pages |
| `lang="en"` on `<html>` | required | 29/29 pages |

### Title strategy applied
Titles lead with the topic, not the brand, and drop the live site's phone-number-in-title
pattern:

| Page | Title (62 max) |
|---|---|
| `/` | `FlexTyres \| Wholesale Used Car & Truck Tyres` |
| `/tyres/car-tyres/` | `Used Car Tyres Wholesale \| FlexTyres` |
| `/tyres/truck-tyres/` | `Used Truck Tyres Wholesale \| FlexTyres` |
| `/tyres/quality-grades/` | `Used Tyre Quality Grades Explained \| FlexTyres` |
| `/how-to-order/` | `How to Order Used Tyres \| FlexTyres` |
| `/export-markets/` | `Export Markets & Destinations \| FlexTyres` |

## 4. Heading architecture

Exactly one `<h1>` per page, enforced. Heading order is validated for skipped levels — 0 skips
across 29 pages. Headings describe content rather than carry styling: the FAQ component renders
each question as a real `<h3>` inside `<summary>`, and section headings are wired to their
sections via `aria-labelledby`.

## 5. Internal linking

**2,080 internal links across 29 pages. Zero broken. Zero pointing at a redirect source.**

Every page links to its parent hub (breadcrumb), its siblings (hub grid), its related commercial
page, and one quote CTA. `RelatedLinks` blocks carry descriptive anchors with a supporting hint
rather than repeated exact-match text.

**Orphan check is enforced**: any indexable page with zero inbound internal links fails the build.
The live site's most valuable page — the 559-word Sprinter offer with a full order form — was an
orphan; it now sits under `/offers/` and is linked from the homepage, `/tyres/car-tyres/`,
`/how-to-order/`, `/export-markets/` and the footer.

Cross-links deliberately built:
- `/tyres/car-tyres/` ↔ `/tyres/quality-grades/` ↔ `/services/doubling-and-tripling/`
- `/tyres/truck-tyres/` ↔ `/tyres/quality-grades/` ↔ `/services/export-and-customs/`
- Each of the 10 FAQ answers links to the page that expands it
- Every service page links to `/how-to-order/` and to its declared related services, validated at build time against the collection

## 6. Cannibalisation resolved

| Old collision | Resolution |
|---|---|
| `/en/faqs/` + `/frequently-asked-questions/` | Merged → `/faqs/` |
| `/en/about-us/` + `/about-us/` | Merged → `/about/`; the legacy export-destination list rescued into `/export-markets/` |
| `/en/our-stock-new/` + `/our-stock/` + `/image-gallery/` | Split by intent: product substance → `/tyres/`, photography → `/gallery/` |
| `/en/tire-recycling/` + `/recycling/` | Merged → `/tyre-recycling/` |
| `/en/tripling-techniques/` + `/tyres-for-cars/` | Split: process → `/services/doubling-and-tripling/`; grades and sizes → `/tyres/car-tyres/` |
| `/en/our-services/` + 12 `/en/portfolio/*` | Fabricated set removed; 1 hub + 4 real detail pages |
| 3 privacy policies | 1 at `/legal/privacy-policy/`; 2 redirect |
| 3 quote entry points | 1 hub + 2 product-specific forms with genuinely different schemas |

## 7. Redirects

**83 rules, 100% single-hop, validated at build time.**

| Type | Count |
|---|---|
| 301 | 76 |
| 410 | 7 |
| Chains | **0** — enforced: a 301 whose target is itself a redirect source fails the build |
| Loops | **0** — enforced |
| Duplicate sources | **0** — enforced |
| 301 targets verified to exist in `dist/` | **76 / 76** |

Emitted for four hosts from one source of truth (`src/data/redirects.ts`): Netlify/Cloudflare
`_redirects`, `vercel.json`, Apache `.htaccess`, nginx `conf`. Full table in
[`URL_REDIRECT_MAP.md`](URL_REDIRECT_MAP.md).

## 8. Images

| Check | Result |
|---|---|
| `alt` attribute present | 100% (enforced — build fails on a missing attribute) |
| Informative images with descriptive alt | 100%, hand-written per image |
| Decorative images | `alt=""` deliberately, never by omission |
| `width` + `height` on every `<img>` | 100% (enforced) |
| Keyword-stuffed alt | 0 (enforced — flags any word repeated >2× ) |
| Descriptive filenames | 64/64 renamed (`warehouse-tyre-stacks.jpg`, not `index7-1-400x284.jpg`) |
| Modern formats | AVIF + WebP with fallback |

## 9. International

The live site presents a five-flag switcher powered by GTranslate — **client-side Google machine
translation**. There are no translated URLs (`/es/` → 403, `/fr/` → 301 to an unrelated English
page, all others 404), no `hreflang`, and no translated content in any HTML response.

**Decision:** ship a single English site with correct `lang="en"` and **no `hreflang`**. Creating
language directories would mean fabricating translations, which the source-of-truth policy
forbids. Recorded as D-07 in [`DECISIONS.md`](DECISIONS.md).

## 10. Enforced gates

```
check-seo: audited 29 pages, 26 sitemap URLs — PASS
check-links: 29 pages, 2080 internal links, 4 unique external links — PASS
check-links --external: 4/4 external links return 200 — PASS
```

## PHASE RESULT — Phase 9, Technical SEO

**Status: PASS**

### Findings
The live site's core SEO problem is not on-page tuning, it is that **two complete websites are
indexable at once**, 21 of the indexed pages describe a business that does not exist, and the
single most valuable commercial page is unreachable. Metadata is largely absent (51 of 71 pages)
and the primary navigation contains a link that 404s on every page.

### Changes made
Single canonical site, 26 indexable pages each with unique validated metadata, one H1 each,
2,080 verified internal links, 82 single-hop redirects, correct sitemap and robots.

### Remaining risks
Moving from `/en/*` to root-level paths relocates every ranking URL. Mitigated by single-hop 301s
from all 76 legacy URLs, preserved slugs where the existing slug was good, and a sitemap listing
only the new canonical set. Expect 4–8 weeks of re-indexing. Submit both the sitemap and a change
of address in Search Console at launch.

The duplicate-site problem is only fully resolved when the legacy WordPress install comes down.
[`LEGACY_DECOMMISSION.md`](LEGACY_DECOMMISSION.md) sets out the sequence, and includes interim
cross-install canonicals and `noindex` directives that can be applied to the live WordPress today
to consolidate the duplicates before the cutover.
