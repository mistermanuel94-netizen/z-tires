# PERFORMANCE_AUDIT.md

Measured, not estimated. Baseline figures come from fetching every sub-resource of the live
WordPress homepage; rebuild figures come from the production build plus real-browser measurement
through the Chrome DevTools Protocol (`scripts/check-mobile.mjs`).

---

## 1. Headline comparison — homepage

| Metric | Live WordPress site | Rebuild | Change |
|---|---|---|---|
| **Total page weight (uncompressed)** | **8,786,616 B (8.79 MB)** | **~350 KB** incl. hero image | **−96%** |
| HTML (uncompressed) | 148,528 B | 71,663 B | −52% |
| HTML (brotli) | not served pre-compressed | **11,983 B** | — |
| CSS | 1,547,500 B across **23 files** | 26,782 B, **0 files** (inlined) | **−98.3%**, 23 fewer requests |
| JavaScript | 2,404,522 B across **39 files** | **461 B**, 0 files (inlined) | **−99.98%**, 39 fewer requests |
| Images (page total) | 4,686,066 B | ~240 KB (AVIF/WebP, responsive) | −95% |
| Fonts | 26 faces from Google Fonts, 2 render-blocking CSS requests | **4 self-hosted woff2, 62.4 KB total** | −22 faces, 0 third-party |
| **Sub-resource requests** | **98** | **9** (measured in-browser) | **−91%** |
| **Render-blocking requests** | **62** (23 CSS + 39 JS) | **0** | **−100%** |
| Third-party origins | 6 (googletagmanager ×3, fonts.googleapis, fonts.gstatic, use.fontawesome, translate.google, recaptcha, usedtiresquote.com) | **0** on load | −100% |
| jQuery | 3.7.1 + migrate | none | removed |

## 2. Core Web Vitals — measured in Chrome

`scripts/check-mobile.mjs`, 22 routes × 4 viewports, served locally over HTTP/1.1 with no CDN
and no compression. Real-network figures will differ, but the layout and JS characteristics
these numbers reflect will not.

### Mobile (390 × 844, DPR 3, device emulation on)

| Metric | Worst across 22 routes | Budget | Result |
|---|---|---|---|
| **LCP** | **108 ms** | 2,500 ms | PASS |
| **CLS** | **0.0000** | 0.1 | PASS |
| TTFB (local) | 11 ms | — | — |
| Requests | 6–15 | — | — |
| Console errors | **0** | 0 | PASS |

### Desktop (1440 × 900)

| Metric | Worst across 22 routes | Budget | Result |
|---|---|---|---|
| **LCP** | **120 ms** | 2,500 ms | PASS |
| **CLS** | **0.0175** | 0.1 | PASS |
| Requests | 6–35 (gallery) | — | — |
| Console errors | **0** | 0 | PASS |

**INP** is not measured here because there is essentially nothing to interact with: the site ships
461 bytes of JavaScript — a single mobile-drawer toggle. There is no hydration, no framework
runtime, no long task, and no main-thread work after parse. The disclosure widgets (FAQ, size
pickers, embeds) are native `<details>` elements with zero JS.

### CLS analysis

Mobile CLS is a flat **0.0000** on every route. The 0.0175 worst case on desktop comes from
web-font swap on pages whose LCP element is a heading. Every image carries intrinsic
`width`/`height` from the Astro pipeline, so no image contributes shift. Mitigations already in
place: `font-display: swap` with only 4 faces, both above-the-fold faces preloaded, and a system
fallback stack chosen for metric proximity.

## 3. Per-page budgets (enforced — `npm run check:budget`)

| Budget | Limit | Worst measured | Headroom |
|---|---|---|---|
| HTML, brotli | 30 KB | **11.8 KB** | 61% |
| CSS | 40 KB | **26.8 KB** | 33% |
| JavaScript | 5 KB | **0.45 KB** | 91% |
| Blocking sub-resource requests | 0 | **0** | — |
| Third-party scripts | 0 | **0** | — |
| Fonts (site) | 100 KB | **62.4 KB** | 38% |
| Largest single image | 320 KB | **239 KB** | 25% |
| Site total, excl. mirrored documents | 12 MB | **10.5 MB** | 13% |

The build fails if any budget is exceeded, so a regression is caught before it ships.

## 4. What produced the reduction

### CSS: 1,547 KB → 26.8 KB
The live site loads Bootstrap, WPBakery, Slider Revolution, Font Awesome **twice**, Dashicons, a
Divi icon set, WooCommerce styles and four review-plugin stylesheets — to render a site with no
shop, no slider requirement and about a dozen icons. The rebuild has one hand-written stylesheet,
inlined at build time. Icons are inline SVG (7 in total across the whole site).

### JavaScript: 2,404 KB → 0.45 KB
Everything the live site used JS for is handled without it:

| Live site used | Rebuild uses |
|---|---|
| Slider Revolution + Vegas (hero) | A static `<img>` — which is also why LCP is a real image, not a JS-injected background |
| Owl Carousel (testimonials) | CSS grid — testimonials are now in crawlable HTML |
| cubePortfolio + Magnific Popup (gallery) | CSS grid of `<figure>` |
| countTo.js (statistics) | Removed — the figures were undated (C-08) |
| Typed.js | Removed |
| jQuery + Bootstrap + equalize.js | Native CSS grid/flex |
| Bootstrap dropdown (nav) | `:hover` / `:focus-within` |
| Accordion plugin (FAQ) | Native `<details>` |
| GTranslate | Removed — it was client-side machine translation, not real localisation |

The 461 bytes that remain are the mobile drawer toggle, which enhances a menu that is already
present and readable in the HTML.

### Images: 4.69 MB → ~240 KB on the homepage
- 64 curated source photographs replace 148 mixed assets (theme stock and manufacturer logos removed)
- AVIF + WebP with JPEG fallback, responsive `srcset` per layout slot
- The live site served a **4000×1000, 478 KB Michelin PNG** and **4032×1960 photographs**; the largest asset now emitted is 239 KB
- Portrait 900×1600 photos are no longer force-fitted into landscape slots
- Hero is `loading="eager" fetchpriority="high"` with an AVIF `<link rel="preload">`; everything else is `loading="lazy" decoding="async"`

### Fonts: 26 faces → 4
The live site requests Poppins in **18 weights**, plus Open Sans in 6 and Roboto in 2, to render
three. The rebuild self-hosts Poppins 600/700 and Inter 400/600, latin subset, 62.4 KB total, with
the two above-the-fold faces preloaded. No connection to `fonts.googleapis.com` or
`fonts.gstatic.com` is made.

### Third parties: 6 origins → 0 on load
Removed: Universal Analytics `UA-129455084-1` (dead property), Google Ads `AW-1015016995`,
reCAPTCHA v3, Google Translate, Font Awesome CDN, and a WhatsApp icon hotlinked from the unrelated
domain `usedtiresquote.com`.

GA4 (`G-GV9FHYB4FT`) is **retained but not enabled**: `analytics.ga4MeasurementId` is an empty
string in `src/data/site.ts`, so no tag ships until the owner opts in. See `SECURITY_AUDIT.md`.

The YouTube and Google Maps embeds are behind a native `<details>` disclosure — nothing loads from
those origins until a visitor chooses to open them, and YouTube uses `youtube-nocookie.com`.

## 5. Caching and delivery (`dist/_headers`, generated)

| Path | Cache-Control |
|---|---|
| `/_assets/*` (content-hashed) | `public, max-age=31536000, immutable` |
| `/fonts/*` | `public, max-age=31536000, immutable` |
| `/*.html` | `public, max-age=0, must-revalidate` |
| `/documents/*` | `public, max-age=86400` |

## 6. Remaining opportunities

| Opportunity | Impact | Why not done |
|---|---|---|
| Serve brotli at the edge | HTML 71.7 KB → 12.0 KB on the wire | Host configuration, not a build artefact. Every recommended host does it automatically. |
| Externalise CSS instead of inlining | Cross-page cache hit after the first page | Deliberate trade-off: inlining removes the last render-blocking request, and at 26.8 KB brotli-compressed (~6 KB) the duplication is cheaper than a round trip on a slow mobile connection. Revisit if analytics show high pages-per-session. |
| Trim the gallery below 40 images | ~2 MB off the deployment | The photographs are the site's trust evidence for a business asking buyers to wire money for a container sight-unseen. Per-page cost is already fine (lazy-loaded, 2 variants each). |
| `content-visibility: auto` on below-fold sections | Marginal | LCP is already ~100 ms; not worth the complexity. |

## 7. How to reproduce

```bash
npm run build          # builds, generates redirects and headers
npm run check:budget   # enforces every budget above
npm run qa:serve &     # serves dist/ on :4499
npm run check:mobile   # real-browser CWV, overflow and tap-target audit
```

## PHASE RESULT — Phase 12, Performance

**Status: PASS**

### Audit results
- Total page weight reduced **96%** (8.79 MB → ~350 KB)
- Render-blocking requests: **62 → 0**
- JavaScript: **2,404 KB → 0.45 KB**
- Mobile LCP **108 ms**, mobile CLS **0.0000**, zero console errors across 22 routes
- All 8 enforced budgets pass with headroom

### Remaining risks
Local measurement cannot model real-network latency, TLS handshake or CDN behaviour. Field data
should be confirmed in Search Console after launch. The architecture — no blocking requests, no
JS, static HTML — is what the numbers depend on, and that is fixed at build time.
