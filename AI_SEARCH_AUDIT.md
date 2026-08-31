# AI_SEARCH_AUDIT.md

Readiness for retrieval-based answer systems — Google AI Overviews and AI Mode, Bing Copilot,
ChatGPT Search, Perplexity and similar.

This document is deliberately narrow. `GEO_AEO_AUDIT.md` covers content strategy; this covers
**machine access**: can a retrieval system fetch the page, parse it, extract a fact, and attribute
it correctly.

---

## 1. Access

| Requirement | Status |
|---|---|
| Crawlable without JavaScript | **Yes** — static HTML, 461 B of JS total, none of it rendering content |
| Blocked by robots.txt | **Nothing** — no CSS, JS, image, font or document path is disallowed |
| Blocked AI crawlers | **None.** See §6 — this is an owner decision, currently left open |
| Sitemap discoverable | `robots.txt` → `sitemap-index.xml`, 26 canonical URLs |
| Response time | 6–15 requests per page, worst LCP 120 ms — cheap to crawl repeatedly |
| Redirect hops to content | 0 from any canonical URL; max 1 from any of the 75 legacy URLs |
| Stable URLs | Flat, descriptive, trailing-slash normalised, max depth 2 |
| Content behind interaction | None. `<details>` elements keep their content in the DOM whether open or closed |
| Content behind a paywall or login | None |

The live site fails several of these in ways that matter for retrieval: its hero, testimonials and
gallery only exist after Slider Revolution, Owl Carousel and cubePortfolio execute, and its
`robots.txt` advertises the wrong sitemap.

## 2. Parseability

| Signal | Implementation |
|---|---|
| One `<h1>` naming the page subject | 29/29 pages |
| Answer in the first paragraph | `AnswerBlock` on every commercial and informational page |
| Specifications as tables | 9 semantic tables with `<caption>` and `<th scope>` |
| Definitions as `<dl>` | Contact details, key terms, company figures |
| Process as ordered lists | `/how-to-order/`, service pages |
| Q&A as real question headings | `<h3>` inside `<summary>`, not styled divs |
| Quotations attributed | `<blockquote>` with the source named in surrounding prose |
| Numbers machine-readable | `font-variant-numeric: tabular-nums`; figures in `<strong>` within the answer block |
| Dates | `<time datetime="…">` on testimonials and legal pages |

## 3. Attribution and entity resolution

An answer engine citing this site needs to know **who** it is citing.

- One `Organization` node, **byte-identical on all 29 pages** (fingerprint-verified in the build).
- Address, telephone, email, opening hours, `contactPoint`, `areaServed` and `knowsAbout` all
  present — all absent from the live site's markup despite being visible in its footer.
- `sameAs` → Facebook, YouTube, Google Business Profile. Every one resolves; verified live (4/4
  return 200).
- `knowsAbout` states the seven topics the site actually covers, so a retrieval system can judge
  topical fit without inferring it from keyword density.
- Every page's `WebPage` node carries `about` → the Organization and `isPartOf` → the WebSite, so
  a fact extracted from any page resolves to the same entity.

**Enforced:** the build fails if the `Organization` node differs between any two pages.

## 4. Extraction confidence

The site is explicit about how certain each fact is, because a retrieval system that surfaces a
contradicted claim harms the business more than one that surfaces a hedged claim.

| Fact type | How it is presented |
|---|---|
| Uncontested and verifiable | Stated flatly — 348 sizes, container capacities, service descriptions, published terms |
| Company-stated, undated | Attributed and marked — "FlexTyres states it holds more than 100,000 tyres"; "These figures are published by FlexTyres and are not dated" |
| Contradicted at source | Published with the conflict visible — the FAQ's 1,000-piece minimum appears verbatim next to the route table showing 180 / 1,350 / 2,800 |
| Time-sensitive | Carries provenance — "Truck grading criteria as last published by FlexTyres. Confirm current grading and export restrictions when you request a quote" |
| Unsupported | Not published at all — superlatives, the frozen "8+ years", the undated discount urgency |

No structured data is emitted for any hedged or contradicted claim. Grades, stock levels, minimum
orders and the 10% discount appear in **prose only**, never in JSON-LD, so a machine consuming the
structured data never receives an unverified number as fact.

## 5. What a retrieval system can answer from this site

Verified by reading the built HTML, not asserted:

| Buyer question | Answerable from | Confidence |
|---|---|---|
| Who sells used tyres wholesale in Belgium? | `/`, `/about/`, Organization schema | High |
| What tread depth is a "medium quality" used car tyre? | `/tyres/quality-grades/` | High, with a stated caveat |
| What is the minimum order for used tyres? | `/how-to-order/` | High — all three published routes given |
| How many tyres fit in a 20 ft container? | `/tyres/car-tyres/`, `/how-to-order/` | High |
| Does anyone deliver used tyres to the Netherlands? | `/offers/sprinter-van-delivery/`, `/export-markets/` | High |
| What is tyre tripling and why does it matter? | `/services/doubling-and-tripling/` | High |
| How are used truck tyres graded for retread? | `/tyres/truck-tyres/` | High, with provenance |
| What are the payment terms for a tyre container? | `/legal/purchasing-terms/` | High — net 30, 3-day inspection |
| Which countries does FlexTyres export to? | `/export-markets/` | High — 12 named |
| What does a used tyre container cost? | — | **Not answerable.** No price is published anywhere, and the site says so. |
| Is stock of a specific size available? | — | **Not answerable.** Explicitly stated as requiring a quote. |

The last two are correct outcomes. A site that appeared to answer them would be fabricating.

## 6. AI crawler policy — open owner decision

No AI crawler is currently blocked. `robots.txt` allows everything.

This is a genuine business trade-off, not a default:

| Blocking AI crawlers | Allowing them |
|---|---|
| Content is not used for model training | Content is eligible for AI answer surfaces that increasingly mediate B2B supplier discovery |
| No influence over how the brand is described | The site's own factual, hedged framing is what gets retrieved |
| — | Buyers researching "used tyre wholesaler Europe" in an assistant can find FlexTyres |

Several of these agents serve both training and live retrieval, and the operators do not always
separate them cleanly. For a business whose buyers are international traders doing supplier
research, the retrieval upside is substantial.

**Recommendation:** leave open. If FlexTyres decides otherwise, targeted `User-agent` blocks belong
in `src/pages/robots.txt.ts`. Verify the current agent names against each operator's own published
documentation at the time of the change — these lists move, and third-party summaries go stale.

## 7. Prohibited techniques — confirmed absent

| Technique | Status |
|---|---|
| Hidden text or links | **None.** The only off-screen element is the form honeypot, `aria-hidden` and `tabindex="-1"` |
| Text hidden from users but served to crawlers | **None.** Identical HTML for every user agent — the site is static |
| AI-directed instructions in content or metadata | **None** |
| Prompt injection | **None** |
| Fabricated citations or references | **None** |
| Keyword stuffing | **None** — enforced in alt text; prose reads as prose |
| Cloaking | **Impossible** — static files, no server logic |
| Doorway or near-duplicate pages | **None** — 26 pages, each with distinct content and intent |
| Auto-generated low-value content | **None** — every page traces to public source material |
| Manipulative internal linking | **None** — descriptive anchors, no exact-match repetition |

The `check-seo.mjs` gate fails the build on keyword-stuffed alt text and on any JSON-LD property
that is not supported by the public source.

## 8. Measurement

There is no reliable public API for "did an AI answer cite us". Practical proxies:

1. **Search Console** — impressions on question-shaped queries; AI Overview impressions where reported.
2. **Referral traffic** from `chatgpt.com`, `perplexity.ai`, `copilot.microsoft.com` — small but
   directly attributable, and worth a segment if analytics is enabled.
3. **Manual spot checks** — ask several assistants the questions in §5 and record whether the
   answer matches this site's published position. Repeat quarterly.
4. **Brand-mention monitoring** for FlexTyres described with facts that appear only here (the
   grade tables, the container capacities).

## PHASE RESULT — Phases 27–28, AI Search / Retrieval Readiness

**Status: PASS**

### Audit results
- 100% of content in the initial HTML response; no JS required to read anything
- Nothing blocked in robots.txt; sitemap correctly declared
- One byte-identical `Organization` entity across 29 pages, build-enforced
- Hedged and contradicted claims kept out of structured data entirely
- 9 of 11 realistic buyer questions answerable; the 2 that are not are correctly not answerable
- 0 prohibited techniques

### Remaining risks
No technique guarantees AI citation. The site's factual contradictions (C-01, C-05, C-09, C-12)
cap extraction confidence until FlexTyres resolves them. The AI-crawler policy is deliberately
left as an owner decision.
