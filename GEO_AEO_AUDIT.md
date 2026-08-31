# GEO_AEO_AUDIT.md

Generative Engine Optimization and Answer Engine Optimization.

**Position taken:** there is no trick here. Retrieval and answer systems reward the same things a
well-briefed human buyer rewards — a direct answer near the top, facts stated plainly, claims that
survive checking, and structure that makes the relationship between entities obvious. Everything
below would still be worth doing if no AI system existed. Nothing below is written for machines at
the expense of readers.

**Explicitly not done:** hidden text, AI-only instructions, prompt injection, fabricated citations,
keyword stuffing, unnatural repetition, doorway pages, mass near-duplicate location pages, or any
claim that a tactic guarantees inclusion in an AI answer. No such guarantee exists.

---

## 1. Answer-first structure

Every commercial and informational page opens with an `AnswerBlock` immediately after the `<h1>`,
before any prose: a single self-contained paragraph that answers the question the page exists to
answer, with the load-bearing figures in `<strong>`.

| Page | The question | The answer given in the first block |
|---|---|---|
| `/` | What does FlexTyres sell? | Belgian wholesaler; graded used car and truck tyres; trade buyers; container and van |
| `/tyres/car-tyres/` | What car tyres, in what grades and quantities? | 3 grades with exact tread ranges, 348 sizes 12″–22″, 180-tyre van minimum or a 20 ft container ≈1,350 |
| `/tyres/truck-tyres/` | How are truck tyres graded? | 3 tiers by tread, repaired damages and reuse/retread fitness; 130 or 270 per container |
| `/tyres/quality-grades/` | What do the grades mean? | Car and truck criteria side by side, in full |
| `/how-to-order/` | How do I buy, and what is the minimum? | 6-step process, three minimums by route, 24-hour response |
| `/export-markets/` | Where does FlexTyres ship? | 12 named destinations; van delivery limited to BE/FR/NL |
| `/services/*` | What is this service and how does it work? | One-sentence summary in frontmatter, rendered above the body |
| `/faqs/` | The three most-asked | Minimum order, price, response time — before the accordion |
| `/legal/purchasing-terms/` | What terms bind me? | Net 30, 3-day inspection, 10% restocking, 50-tyre refund cap, Belgian law |

These blocks are plain HTML paragraphs in the initial response. No JavaScript, no hydration, no
lazy loading.

## 2. Facts are extractable, not buried in prose

| Content | Format |
|---|---|
| Car and truck quality grades | Semantic `<table>` with `<caption>`, `<th scope>` — tread depth and criteria per grade |
| Purchase routes and minimums | `<table>`: route, quantity, coverage, conditions |
| Published tyre sizes | Grouped by rim diameter, each group labelled with its count |
| Key commercial terms | 17-row `<table>` mapping term to what the document says |
| Contact details, hours, locations | `<dl>` with explicit `<dt>`/`<dd>` pairs |
| Sprinter offer specification | 9-row `<table>` with `<caption>` |
| Ordering process | Numbered `<ol>` with a heading and body per step |
| Export destinations | Grouped by region, with the original published spelling preserved where it differed |

The live site rendered its quality grades as three styled `<div>` columns and its testimonials
inside a JavaScript carousel. Both are now real semantic markup.

## 3. Entity clarity

A retrieval system asking "who is this" gets one consistent answer from every page:

- **One `Organization` node, byte-identical across all 29 pages**, carrying address, telephone,
  email, opening hours, `contactPoint`, `areaServed` and `knowsAbout`.
- `sameAs` lists only profiles that resolve to a real FlexTyres presence.
- The company is described the same way in prose everywhere: *a Belgian wholesaler of used car and
  truck tyres, selling to trade buyers, with an office in Evere and a warehouse in Frankfurt.*
- Every business fact on the site is imported from one module, `src/data/site.ts`. A page
  physically cannot state a different phone number, address or opening hour than any other page.

That last point is the substantive difference from the live site, where the same entity is
described four ways across two installs, with **two different Belgian addresses in different
cities**.

## 4. The ten questions an answer engine needs

| Question | Where it is answered unambiguously |
|---|---|
| WHAT is this page about? | `<h1>` + `AnswerBlock`, first 40 words |
| WHO is the organisation? | `Organization` schema on every page; `/about/` |
| WHAT is sold? | `/tyres/` hub and three product pages, with real specifications |
| WHO is it for? | Explicit "Who this is for" section on every product and service page |
| WHERE does it apply? | `/export-markets/` — 12 named destinations, plus per-route coverage columns |
| HOW does it work? | `/how-to-order/` — 6 steps with `HowTo` schema |
| WHAT evidence exists? | `/gallery/` (40 photographs), 6 attributed testimonials, 2 downloadable company documents |
| WHAT are the limitations? | A dedicated "What is publicly known about limitations" section on every service page; caveats on every grade and size table |
| WHAT can I do next? | One quote CTA per page, plus phone, WhatsApp and email in the header, footer and CTA band |
| HOW current is this? | Legal pages carry their real published dates; stale metrics were removed rather than refreshed |

## 5. Honesty as a retrieval strategy

The most consequential GEO decisions on this project were subtractions. An answer engine that
surfaces a claim which turns out to be wrong damages the business more than a missing claim does.

| Removed or qualified | Why |
|---|---|
| "8+ years of experience" | Provably stale — the same string was published across two site generations spanning 2021–2025. Replaced with "Trading since 2011", which both sources support and which does not decay. |
| "The number-one used tire company" | Unsupported superlative with no ranking, award or citation anywhere. |
| Animated counters (79,359 tyres / 325 customers) | Undated. Now stated once on `/about/`, explicitly attributed and explicitly undated. |
| "GET 10% OFF TODAY — Limited Time" | No start date, no end date, on a page that had been orphaned. Now stated without the false urgency, with "confirm current terms". |
| "Each tyre is carefully inspected" | Contradicted elsewhere by "All tyres can be inspected if you request that". The weaker, source-supported process description is used instead. |
| "We sell strictly to wholesalers" / "…to retailers" | The source contradicts itself on which group is excluded. Replaced with "trade buyers only — wholesalers, retailers and exporters", true under either reading. |
| A single "minimum order" figure | Three different figures are published. Replaced with a route table showing all three, each with its own coverage. |
| Manufacturer logo strip | Uncaptioned logos imply an endorsement the source never claims. Replaced with a brand list and an explicit non-affiliation statement. |

Where a conflict could not be resolved from public sources, the page **says so in visible copy** —
for example the grade tables carry *"Grades and tread depths are indicative. Confirm the exact
grade, tread depth and mix for your order in writing before shipping."* A retrieval system reading
that gets an accurate picture of the certainty available, which is the correct outcome.

## 6. Retrieval readiness

| Requirement | Status |
|---|---|
| Critical facts in the initial HTML response | 100% — nothing is JS-rendered |
| JavaScript required to read any content | None (461 B, a menu toggle) |
| Content behind interaction | The FAQ uses `<details>`, but the first items render `open` and the text is in the DOM either way |
| Blocked resources | None — robots.txt blocks nothing |
| Stable URLs | Flat, descriptive, max depth 2, trailing-slash normalised |
| Crawl efficiency | 26 indexable URLs, 0 orphans, 0 redirect chains, 0 blocking sub-resources |
| Page speed for crawler budget | Worst LCP 120 ms, 6–15 requests per page |
| Machine-readable structure | 10 schema types; every FAQ, HowTo and breadcrumb claim verified visible on the page |

## 7. Topical clusters

Built only where public content justifies the page. No location pages, no size-permutation pages,
no brand pages — each would require inventing facts.

```
Used tyres  ─┬─ car tyres ──── grades · sizes · containers · tripling
             ├─ truck tyres ── grades · sizes · containers · export limits
             ├─ quality grades ─ car and truck criteria, inspection window
             └─ recycling ──── chips · bales

Services    ─┬─ doubling & tripling ─── why container capacity doubles
             ├─ container loading ───── how the quantity figures arise
             ├─ transportation ──────── warehouse to destination
             └─ export & customs ────── documentation, buyer obligations

Buying      ─┬─ how to order ── process · minimums · terms · FAQ
             ├─ request a quote ── car form · truck form
             ├─ export markets ─── where, and van-delivery coverage
             └─ offers ─────────── Sprinter van delivery

Company     ─┬─ about ──── history · figures · locations · testimonials
             ├─ gallery ── 40 photographs as trust evidence
             ├─ franchise
             └─ legal ──── purchasing terms · website terms · privacy
```

Every cluster member links to its hub, its siblings and the conversion path. Each of the 10 FAQ
answers links to the page that expands it.

## 8. Search intent coverage

| Intent | Live site | Rebuild |
|---|---|---|
| Navigational ("flextyres") | `/en/` | `/` |
| Commercial ("used tyres wholesale") | homepage only | `/`, `/tyres/` |
| **Product ("used car tyres bulk")** | **unserved** | `/tyres/car-tyres/` |
| **Product ("used truck tyres export")** | **unserved** — a form only | `/tyres/truck-tyres/` |
| **Informational ("used tyre grades")** | **unserved** | `/tyres/quality-grades/` |
| Question ("minimum order used tyres") | FAQ, contradicted elsewhere | `/faqs/`, `/how-to-order/` — conflict surfaced |
| **Process ("how to import used tyres")** | **unserved** | `/how-to-order/` |
| Service ("container loading tyres") | buried in one page | 4 service pages |
| **Local/geographic ("used tyre exporter Belgium")** | **unserved** | `/export-markets/`, `/contact/` |
| Transactional ("used tyre quote") | 3 fragmented URLs | `/request-a-quote/` + 2 forms |
| Informational ("tyre recycling chips bales") | thin | `/tyre-recycling/` |
| B2B ("used tyre franchise") | 167 words | `/franchise/`, with an explicit "what is not published" section |

**Six intents that were unserved or served only by a form now have a real page.**

## 9. Honest limitations

- No GEO or AEO technique guarantees inclusion in an AI answer. These systems are opaque, change
  without notice, and weight source authority in ways no on-site change controls.
- This site's strongest asset for retrieval is the **specificity** of what FlexTyres publishes —
  exact tread ranges, 348 named sizes, container capacities, a real purchasing-terms document. Its
  weakest is that several of those facts are internally contradicted at source. The 15 owner
  decisions in `CONTENT_TRUST_CONFLICTS.md` are therefore GEO work as much as governance work:
  resolving C-01 (tread depths) and C-05 (minimum order) would let the caveats be removed and the
  claims stated flatly.
- Publishing dated, verifiable figures — the founding year, dated export volumes, a real Place ID —
  would materially strengthen entity confidence. None can be invented here.

## PHASE RESULT — Phases 11, 25–27, 57: GEO / AEO / AI Search

**Status: PASS**

### Audit results
- Answer-first block on every commercial and informational page, in the initial HTML
- All specifications in semantic tables, not styled divs
- One identical `Organization` entity across 29 pages, sourced from one module
- 100% of content readable without JavaScript
- 6 previously unserved search intents now have a page
- 8 unsupported or stale claims removed rather than propagated
- 0 hidden text, 0 AI-directed instructions, 0 fabricated citations

### Remaining risks
The site's factual foundation still contains contradictions that only FlexTyres can resolve. Until
C-01, C-02 and C-05 are answered, several key facts must remain hedged — which is the correct and
honest state, but is weaker for retrieval than a resolved fact would be.
