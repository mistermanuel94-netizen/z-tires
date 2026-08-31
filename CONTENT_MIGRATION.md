# CONTENT_MIGRATION.md

What was carried across from the public flextyres.com, what was rescued from the abandoned legacy
install, what was rewritten, and what was deliberately left behind.

---

## 1. Summary

| | Count |
|---|---|
| Source URLs crawled | 86 |
| Source URLs with HTML content | 71 |
| Content assets migrated | 100% of genuine business content |
| Pages published | 26 indexable |
| Fabricated pages **not** migrated | 21 |
| WordPress artefacts not migrated | 9 |
| Content rescued from the abandoned legacy install | 3 significant assets |

## 2. Content rescued from the legacy install

The `/en/` install is the live one. A naive `/en/`-only migration would have silently destroyed
these, because they exist **only** on the root install that was last updated in 2021.

| Asset | Where it was | Where it is now | Why it matters |
|---|---|---|---|
| **Truck tyre quality grades** | `/tyres-for-trucks/` | `/tyres/truck-tyres/`, `/tyres/quality-grades/` | The live install solicits truck buyers with a dedicated quote form and publishes **no grading criteria at all**. This is the only specification truck buyers have. |
| **Export destination list** (12 countries) | `/about-us/` | `/export-markets/` | The live install says only "worldwide" and embeds a map with no text. This is the only concrete geography FlexTyres has ever published. |
| **13-inch and additional 15″/16″ sizes** | `/request-a-quote/` | `/tyres/car-tyres/` | The live car quote form starts at 14″. The legacy form and the official stock sheet both list 13″. |

Each is published with visible provenance — for example *"Truck grading criteria as last published
by FlexTyres. Confirm current grading and export restrictions when you request a quote."*

## 3. Page-by-page migration

| Source | Destination | Treatment |
|---|---|---|
| `/en/` | `/` | **Restructured.** Hero, quality grades, services, purchase routes, tripling, export, testimonials, Sprinter offer. Counters and progress bars dropped (C-08). Static hero replaces the JS slider. |
| `/en/about-us/` + `/about-us/` | `/about/` | **Merged.** Origin story verbatim minus the stale year count (C-07). Figures attributed and marked undated. Export list moved to its own page. |
| `/en/our-services/` | `/services/` + 4 detail pages | **Expanded.** One page describing four services became a hub plus a detail page each, with "who is it for", "how it works", "what you should provide" and "what is publicly known about limitations". |
| `/en/tripling-techniques/` | `/services/doubling-and-tripling/` | **Moved and expanded.** Both published methods kept verbatim; the connection to container capacity made explicit. |
| `/en/our-stock-new/` (121 words) | `/tyres/` + `/tyres/car-tyres/` + `/tyres/truck-tyres/` | **Replaced.** A thin page with one heading and a video became a real product tier: grades, 348 sizes, container quantities, downloadable stock sheet. |
| `/en/faqs/` + `/frequently-asked-questions/` | `/faqs/` | **Merged and extended.** 7 source Q&As reproduced; 3 added from facts published elsewhere (response time, location, shipping destinations). Categorised; `FAQPage` schema. |
| `/en/tire-recycling/` + `/recycling/` | `/tyre-recycling/` | **Merged and expanded.** Source content is 2 lines; expanded with audience, ordering route and an explicit list of what is *not* published. |
| `/en/franchise-opportunity/` | `/franchise/` | **Improved.** 4-item package preserved exactly. Added a "what is not published" section listing 8 questions a buyer must ask, since no franchise terms are published. |
| `/en/sprinter-delivery-180-tires/` | `/offers/sprinter-van-delivery/` | **De-orphaned.** The richest page on the source site was linked from nothing. Specification in a semantic table; false urgency removed (C-16). |
| `/en/contact-us/` + `/contact-us/` | `/contact/` | **Merged.** Evere address (C-02), narrower Saturday hours (C-03), all three locations, `ContactPage` schema. |
| `/en/request-a-free-quote/` + 2 forms | `/request-a-quote/` + 2 forms | **Rebuilt.** Native HTML, unified size list, labels, autocomplete, honeypot. |
| `/en/wpautoterms/*` | `/legal/*` | **Verbatim.** Not one word edited. Marked "under review" (C-18). |
| `/en/Terms & Conditions.pdf` | `/documents/…` + `/legal/purchasing-terms/` | **Rescued.** The document was unreachable — the only link 404s on every page. Mirrored byte-for-byte, plus an HTML summary of the 17 unambiguous commercial terms. |
| `/our-stock/`, `/image-gallery/` | `/gallery/` | **Consolidated.** Three thin pages of photographs became one organised gallery of 40, grouped and captioned. |
| — | `/how-to-order/` | **New.** Assembled from the FAQ, both quote forms, the Sprinter page and the terms PDF. Resolves the minimum-order contradiction structurally (C-05). |
| — | `/export-markets/` | **New.** Built from the rescued destination list plus per-route coverage. |
| — | `/tyres/quality-grades/` | **New.** Car and truck grading side by side, with the inspection window and the caveat. |

## 4. Not migrated

### Fabricated content (21 pages)

| What | Count | Evidence |
|---|---|---|
| Staff profiles | 8 + archive | `autoser` theme demo personas. Every H1 reads "Single Blog". No named person appears anywhere else on the site except "Hamid" inside customer testimonials. |
| Auto-repair services | 6 + archive | Brake fluid exchange, oil change, wheel alignment… FlexTyres is a tyre exporter with a 180-tyre minimum. |
| Empty taxonomy archives | 5 | Supporting the fabricated portfolio |

Full analysis in `CONTENT_TRUST_CONFLICTS.md` C-14 and C-15.

### Platform artefacts (9)

WooCommerce shells (cart, checkout, my-account, shop, shop-3 — no products ever existed), the
`hello-world` default post with its "A WordPress Commenter" comment, the `Uncategorized` category,
the author archive, the December 2018 date archive, and two RSS feeds carrying only the default
post.

### Review-gating funnel (3)

`/en/good-reviews/`, `/en/bad-reviews/`, `/en/neutral-reviews/` sorted reviewers by sentiment,
asking happy customers to post publicly while diverting unhappy ones to a private form. This is
prohibited by Google's review policies. Not migrated (C-21).

### Claims (8)

Removed rather than propagated: the frozen "8+ years", "the number-one used tire company",
"our quality is unsurpassed", "the absolute best value", animated undated counters, decorative
"100%" progress bars, the undated "10% off today" urgency, and the exclusionary
"we sell strictly to wholesalers/retailers" framing that the source contradicts itself on.

Each is documented with its reasoning in `CONTENT_TRUST_CONFLICTS.md`.

### Assets

~35 theme stock photographs of mechanics in blue overalls (a consumer auto-repair garage, not a
tyre wholesaler), 5 manufacturer logo PNGs (C-24), plugin chrome, GTranslate flags, and 8
cross-domain hotlinked images including Google reviewer avatars and a WhatsApp icon served from
the unrelated domain `usedtiresquote.com`.

## 5. Content preserved verbatim

Where FlexTyres' own words are clear, they are quoted rather than paraphrased:

- *"We will pack up to three used tyres in one. This way we are able to double the amount of used tyres fitting into a container."*
- *"Our professionals will perform thorough quality checks, prepare all the paperwork, pack, load and ship your tires."*
- *"If you wish we and our partners will help you handle the customs formalities and clearance."*
- *"We know that honesty and transparency, coupled with reliable and friendly customer service, is what really builds customer trust."*
- *"Started as a one man operation…"* (with the stale year count removed)
- All 7 original FAQ answers
- All 6 customer testimonials — **exact text, exact names, exact dates**, including original spelling and punctuation
- Both legal documents, unedited
- Both quotations from the purchasing terms on the export page

## 6. Where the migration adds rather than reproduces

New material is written only where it organises published facts or states an honest limitation. It
never introduces a fact.

| Addition | Basis |
|---|---|
| "Who this is for" on product and service pages | Derived from published minimums and the trade-only positioning |
| "What is publicly known about limitations" on every service page | Explicitly flags what FlexTyres does **not** publish |
| Purchase-route tables | Reorganises three published minimums into a comparable form |
| Grade caveats | Required by the unresolved conflicts C-01 and C-12 |
| Franchise "what is not published" | 8 questions a buyer should ask, since no terms are published |
| Recycling "not published" note | Chip sizes, contamination limits, calorific values — none published |
| Alt text for 64 images | Describes what is visibly in each frame |
| Brand non-affiliation statement | Prevents the implied endorsement the logo strip created |

## 7. Verification

| Check | Result |
|---|---|
| Placeholder or lorem ipsum text | **0** |
| Repeated paragraphs across pages | **0** — shared strings come from `src/data/site.ts` |
| Conflicting contact details | **0** — impossible by construction |
| Conflicting business hours | **0** |
| Conflicting addresses | **0** |
| Fabricated testimonials, staff, certifications, awards, partnerships | **0** |
| Invented specifications, prices, stock levels or shipping claims | **0** |
| Manufactured dates | **0** — only the two real published dates appear |
| Unsupported superlatives | **0** |
| Development or placeholder text | **0** |

## PHASE RESULT — Phase 8, Content Migration

**Status: PASS**

### Findings
Roughly a quarter of the source site's indexable pages describe a business that does not exist. Its
single most valuable commercial page was an orphan, and its most useful product specification —
truck tyre grading — existed only on an install abandoned in 2021.

### Changes made
100% of genuine business content migrated; 3 assets rescued from the legacy install; 21 fabricated
pages excluded; 8 unsupported claims removed; every verbatim quotation preserved exactly.

### Remaining risks
15 owner decisions remain open in `CONTENT_TRUST_CONFLICTS.md`, 6 at P1. Each currently ships with
a documented, least-misleading implementation and, where relevant, a visible caveat.
