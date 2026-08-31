# FINAL_QA_REPORT.md

**Project:** flextyres.com rebuild — WordPress → Astro
**Date:** 2026-08-31
**Status:** **PASS** — production-ready, with 4 blocking owner actions listed in §7

---

## 1. Automated gate results

Every gate exits non-zero on failure and runs in `npm run audit:full`.

| Gate | Scope | Result |
|---|---|---|
| `npm run typecheck` | 65 files, `astro/tsconfigs/strictest` | **0 errors, 0 warnings, 0 hints** |
| `npm run build` | Content schemas, metadata validation, redirect integrity, CSP validity | **29 pages, no errors** |
| `npm run check:seo` | Titles, descriptions, canonicals, robots, OG, headings, alt, image dimensions, JSON-LD, orphans | **PASS** — 29 pages, 26 sitemap URLs |
| `npm run check:links` | Broken links, redirect-source links, dead anchors, fragments, `noopener` | **PASS** — 2,080 internal links |
| `npm run check:links:external` | Live HTTP check | **PASS** — 4/4 return 200 |
| `npm run check:a11y` | Landmarks, labels, headings, ids, tables, 19 contrast pairs | **PASS** — 0 errors, 0 warnings |
| `npm run check:schema` | Graph validity, `@id` resolution, entity consistency, schema-to-content match | **PASS** |
| `npm run check:budget` | 8 performance budgets | **PASS** |
| `npm run check:mobile` | Real Chrome, 22 routes × 4 viewports | **PASS** |

## 2. Regression testing against the source site

| Check | Result |
|---|---|
| Every source URL has a destination | **86/86** — 75 × 301, 7 × 410, 2 unchanged, 2 non-HTML mirrored |
| Redirect chains | **0** (source had 8) |
| Redirect loops | **0** |
| 301 targets verified present in `dist/` | **75/75** |
| Genuine content assets lost | **0** |
| Content rescued from the abandoned legacy install | **3** significant assets |
| Verbatim quotations altered | **0** |
| Testimonial text, names or dates changed | **0** |
| Legal documents edited | **0** |
| Downloadable documents byte-identical to source | **3/3** |

Redirect behaviour verified against a running build:

```
301  /en/                → /
301  /en/about-us/       → /about/
410  /hello-world/
404  /nope/
200  /robots.txt
200  /documents/flextyres-purchasing-terms.pdf   ← 404s on the live site
```

## 3. Desktop and mobile QA

Real Chrome via the DevTools Protocol, 22 routes × 4 viewports (320 / 390 / 768 / 1440).

| Check | Result |
|---|---|
| Horizontal overflow | **0 px across all 88 combinations** |
| Tap targets below 44×44 | **0** |
| Console errors | **0** |
| JavaScript errors | **0** |
| Broken images | **0** |
| Layout breakage | **0** |

### Core Web Vitals (local, uncached)

| | Mobile (390, DPR 3) | Desktop (1440) |
|---|---|---|
| Worst LCP | **96–128 ms** | **120 ms** |
| Worst CLS | **0.0000** | **0.0175** |
| Requests per page | 6–15 | 6–35 |
| Blocking sub-resources | **0** | **0** |

Local measurement excludes network latency and TLS. What it does establish is the architecture:
zero render-blocking requests, zero third-party scripts, zero hydration, and intrinsic dimensions
on every image.

## 4. Measured improvement over the live site

| Metric | Live WordPress | Rebuild | Change |
|---|---|---|---|
| Homepage total weight | 8,786,616 B | ~350,000 B | **−96%** |
| CSS | 1,547 KB / 23 files | 26.8 KB / 0 files | **−98.3%** |
| JavaScript | 2,404 KB / 39 files | **0.45 KB** / 0 files | **−99.98%** |
| Sub-resource requests | 98 | 9 | **−91%** |
| Render-blocking requests | 62 | **0** | **−100%** |
| Third-party origins on load | 6 | **0** | **−100%** |
| Font faces | 26 | 4 | −85% |
| Indexable duplicate sites | 2 | 1 | — |
| Indexable URLs | 71 | 26 | −63% |
| Pages with no meta description | 51 | **0** | — |
| Pages with no `<h1>` | 20 | **0** | — |
| Orphan pages | 17 | **0** | — |
| Broken links in site chrome | 2 on every page | **0** | — |
| Fabricated indexable pages | 21 | **0** | — |
| Images with no alt text | ~120 | **0** | — |
| WordPress plugins to patch | 19+ | **0** | — |

## 5. Defects found and fixed during QA

Each was found by an automated gate and fixed in the site, not by weakening the check.

| # | Defect | Found by | Fix |
|---|---|---|---|
| 1 | `/how-to-order/` emitted `FAQPage` schema for 5 questions **not rendered on the page** | `check-schema` | Rendered them visibly with the shared `FAQList` component |
| 2 | White-on-green buttons at **3.32:1** — below WCAG AA | `check-a11y` | Added `--c-accent-solid` at the green-700 step (5.19:1), keeping the brand ramp |
| 3 | `/contact/` overflowed **23 px** at a 320 px viewport | `check-mobile` | `.facts` collapses to one column below 30em; `overflow-wrap: anywhere` on values |
| 4 | Tap targets at 40–41 px on size labels, disclosures and the header phone link | `check-mobile` | Raised to a 44 px minimum |
| 5 | Hero overlay painted **beneath** the hero image, so the darkening had no effect | Visual QA | Explicit z-index separation (`::before` is a generated first child) |
| 6 | Header logo rendered too small to read | Visual QA | Height-constrained to 3.25/3.75rem; header bar raised to 5rem |
| 7 | Markdown table on the Sprinter page had no `<caption>` or `<th scope>` | `check-a11y` | Authored as accessible HTML in the Markdown |
| 8 | Homepage meta description was 163 chars | `check-seo` (build-time throw) | Rewritten to 155 |
| 9 | The 404 declared a canonical and `og:url`, asserting itself as a real document | `check-seo` | `isErrorPage` flag suppresses both; schema reduced to Organization + WebSite |
| 10 | Type errors on optional `Location` properties under `exactOptionalPropertyTypes` | `typecheck` | Explicit `Location` interface with optional fields |

## 6. Content quality control

| Check | Result |
|---|---|
| Placeholder / lorem ipsum | **0** |
| Repeated paragraphs across pages | **0** — shared strings come from one module |
| Conflicting contact details, hours or addresses | **0** — structurally impossible (`src/data/site.ts`) |
| Fabricated testimonials, staff, certifications, awards, partnerships | **0** |
| Invented specifications, prices, stock levels or shipping claims | **0** |
| Manufactured dates | **0** — only the two genuine published dates appear |
| Unsupported superlatives | **0** |
| Development or debug text | **0** |
| Spelling consistency (British English, quotations preserved) | Verified |
| Business name consistency | Verified |

## 7. Blocking owner actions

The build is deployable, but these should be resolved before or immediately at launch.

| # | Action | Why it blocks | Reference |
|---|---|---|---|
| **1** | **Choose a form endpoint** | Forms currently open the visitor's mail client. Functional, and phone/WhatsApp/email are always present, but a real endpoint is expected | `DEPLOYMENT.md` §1, D-10 |
| **2** | **Legal review of the privacy policy** | Three different policies are published on the live site; which governs is not an engineering decision | C-18 |
| **3** | **Reissue the Purchasing Terms PDF** | The live document contains "30 **(change this)** days", no dispute-resolution mechanism selected, and 3% interest **per day** | C-19 |
| **4** | **Decommission the legacy root WordPress install** | While it stays online it is a duplicate-content problem and an attack surface with a public login | `SEO_AUDIT.md`, `SECURITY_AUDIT.md` |

## 8. Non-blocking owner decisions

15 open items in `CONTENT_TRUST_CONFLICTS.md`, 6 at P1. Each ships today with a documented,
least-misleading implementation and, where relevant, a visible caveat.

Highest value: **C-01** (three published versions of the tread-depth grades), **C-02** (two Belgian
addresses in different cities), **C-05** (three different minimum-order quantities). Resolving
these lets the caveats be removed and the claims stated flatly — which helps buyers, search
engines and answer systems equally.

## 9. Outstanding manual testing

Not claimed as verified:

- Screen-reader walkthrough (NVDA/JAWS/VoiceOver) of the quote forms and mobile drawer
- Voice-control operation
- Real-device testing on low-end Android
- Cognitive-load review of the 348-checkbox size picker

**Recommended before launch:** one NVDA pass over `/`, `/request-a-quote/car-tyres/` and
`/contact/`.

## 10. Final scorecard

Scored against audit evidence. Nothing is scored 100 — every category has a real gap, and each is
named.

| Category | Score | Justification |
|---|---|---|
| **Technical SEO** | **94** | Unique validated metadata on all 26 pages, 0 orphans, 0 chains, correct sitemap and robots, self-referential canonicals, 82 verified redirects. **−6:** every ranking URL moves, and re-indexing cannot be verified pre-launch. |
| **Information Architecture** | **93** | Max depth 2, 6 previously unserved intents now served, cannibalisation resolved, every page justified by source content. **−7:** the product tier is only three pages deep because the source publishes nothing more granular. |
| **Content Quality** | **88** | 100% of genuine content migrated, 3 assets rescued from the abandoned install, 8 unsupported claims removed, verbatim quotations preserved. **−12:** the source's own contradictions force hedging on tread depths, minimum order and truck grading until the owner resolves them. |
| **Internal Linking** | **96** | 2,080 links, 0 broken, 0 pointing at a redirect, 0 orphans, build-enforced. **−4:** no editorial content exists to link from, so the graph is entirely commercial. |
| **Structured Data** | **95** | 10 types, one byte-identical Organization across 29 pages, every FAQ/HowTo/breadcrumb claim verified visible, 22 unsupported properties blocklisted. **−5:** no Product or Offer markup — correct today, but a genuine commercial gap. |
| **Entity Clarity** | **94** | One entity, one data module, address/phone/hours/contactPoint/knowsAbout all present, sameAs verified live. **−6:** no `foundingDate`, no Place ID, no LinkedIn — none can be invented. |
| **GEO** | **90** | Answer-first blocks, semantic tables, consistent entity, honest hedging, 0 prohibited techniques. **−10:** unresolved factual conflicts cap what can be stated flatly. |
| **AEO** | **92** | Direct answer above the fold on every commercial page, 3 FAQPage schemas, HowTo, comparison tables, definitions. **−8:** two common buyer questions (price, per-size availability) are correctly unanswerable. |
| **AI Search Readiness** | **93** | 100% of content in the initial HTML, nothing blocked, stable URLs, hedged claims kept out of schema. **−7:** no technique guarantees citation; extraction confidence is capped by source contradictions. |
| **Performance** | **97** | −96% page weight, 0 render-blocking requests, 0.45 KB JS, LCP ~120 ms, CLS 0.0000 mobile, 8 enforced budgets. **−3:** local measurement only; 10.5 MB of gallery variants in the deployment. |
| **Accessibility** | **90** | 19/19 contrast pairs at AA, 0 overflow, 0 undersized targets, 0 structural violations, full keyboard operation, works without JS. **−10:** no screen-reader testing performed. |
| **Mobile UX** | **95** | 0 overflow across 88 route/viewport combinations, 44px targets, fluid type, native disclosures. **−5:** the 348-checkbox picker is dense on a small screen even inside disclosures. |
| **Conversion UX** | **89** | Quote CTA on every page, phone/WhatsApp/email in header, footer and CTA band, two product-specific forms, the orphaned Sprinter offer recovered. **−11:** no working backend endpoint yet; forms fall back to `mailto:`. |
| **Security** | **93** | Hash-pinned CSP, 8 headers, 0 secrets, 0 third-party requests, 0 cookies, 0 npm vulnerabilities, entire WordPress surface removed. **−7:** `style-src 'unsafe-inline'` accepted; the legacy install is still live. |
| **Maintainability** | **95** | One source of truth for business facts, schema-validated collections, strictest TypeScript at 0 errors, 8 audit gates, documented decisions. **−5:** custom audit scripts are project-specific and need maintaining alongside the site. |

### **Overall: 92.9 / 100**

## 11. Sign-off

**The build is production-ready.** All nine automated gates pass, the ten defects found during QA
are fixed, and no genuine content was lost.

Two things are true at once and both belong in this report:

1. Engineering quality is high and independently verified — 96% lighter, 0 broken links,
   0 accessibility violations, 0 fabricated content.
2. **The factual foundation still has unresolved contradictions that only FlexTyres can settle.**
   A tyre wholesaler publishing three different tread-depth specifications and two head-office
   addresses in different cities is a commercial risk, not a technical one. The rebuild surfaces
   every one of them, implements the least misleading option, and marks the uncertainty visibly
   rather than papering over it.

The most valuable next step is not more engineering. It is a 30-minute conversation with FlexTyres
about the six P1 items in `CONTENT_TRUST_CONFLICTS.md`.
