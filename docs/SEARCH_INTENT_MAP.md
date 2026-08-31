# SEARCH_INTENT_MAP.md

Every indexable page mapped to the intent it serves, the buyer question it answers, and its role in
the conversion path. No page exists without a distinct purpose — that is the test that stopped
keyword-variant pages from being created.

---

## Map

| # | URL | Primary intent | Secondary | The question it answers | Conversion role |
|---|---|---|---|---|---|
| 1 | `/` | Navigational | Commercial investigation | "Who is FlexTyres and what do they sell?" | Entry — routes to product or quote |
| 2 | `/tyres/` | Commercial investigation | Navigational | "What tyres can I buy here?" | Hub — routes to the three product pages |
| 3 | `/tyres/car-tyres/` | **Product-specific commercial** | Transactional | "What used car tyres, in what grades, sizes and quantities?" | Primary product → car quote |
| 4 | `/tyres/truck-tyres/` | **Product-specific commercial** | Transactional | "What used truck tyres, and how are they graded for retread?" | Primary product → truck quote |
| 5 | `/tyres/quality-grades/` | **Informational** | Commercial investigation | "What does 'medium quality' actually mean?" | Trust — the most-asked pre-purchase question |
| 6 | `/tyre-recycling/` | Product-specific commercial | Informational | "Can I buy tyre chips or bales?" | Secondary product → contact |
| 7 | `/services/` | Commercial investigation | Navigational | "What does FlexTyres do beyond selling tyres?" | Hub |
| 8 | `/services/doubling-and-tripling/` | Informational | Service-specific | "What is tyre tripling and why does it matter to my container?" | Explains the capacity figures |
| 9 | `/services/container-loading/` | Service-specific | Informational | "How is my container actually filled?" | Trust in the logistics |
| 10 | `/services/transportation/` | Service-specific | Commercial | "Can FlexTyres get the tyres to me?" | Removes a logistics objection |
| 11 | `/services/export-and-customs/` | Service-specific | Informational | "Who handles the customs paperwork?" | Removes the biggest export objection |
| 12 | `/how-to-order/` | **Transactional / process** | Question-based | "How do I buy, what's the minimum, what are the terms?" | **Central conversion page** |
| 13 | `/export-markets/` | **Local / geographic** | Commercial investigation | "Do they ship to my country?" | Qualifies international buyers |
| 14 | `/offers/` | Commercial investigation | Navigational | "Is there anything other than a full container?" | Hub |
| 15 | `/offers/sprinter-van-delivery/` | **Transactional** | Local (BE/FR/NL) | "Can I buy less than a container?" | Lowest-barrier entry — 180 tyres |
| 16 | `/franchise/` | **B2B / business development** | Commercial investigation | "Can I open a FlexTyres tyre centre?" | Separate audience → contact |
| 17 | `/gallery/` | Trust / evidence | Informational | "Is this a real operation?" | Trust for buyers who cannot visit |
| 18 | `/faqs/` | **Question-based** | Commercial | The 10 questions buyers actually ask | Objection handling |
| 19 | `/about/` | Navigational | Trust | "Who am I dealing with?" | Trust — history, figures, testimonials |
| 20 | `/contact/` | Navigational | Local | "How do I reach them, and where are they?" | Direct conversion — phone, WhatsApp, email |
| 21 | `/request-a-quote/` | **Transactional** | Navigational | "How do I get a price?" | Quote hub |
| 22 | `/request-a-quote/car-tyres/` | **Transactional** | Product-specific | Car inquiry with 348 selectable sizes | **Primary conversion** |
| 23 | `/request-a-quote/truck-tyres/` | **Transactional** | Product-specific | Truck inquiry with 16 selectable sizes | **Primary conversion** |
| 24 | `/legal/purchasing-terms/` | Informational | Trust | "What terms am I agreeing to?" | Due diligence — payment, inspection window |
| 25 | `/legal/terms-and-conditions/` | Informational | — | Website terms | Compliance |
| 26 | `/legal/privacy-policy/` | Informational | — | Data handling | Compliance — linked from every form |

Non-indexed: `/thank-you/` (post-submission), `/legal/` (hub), `/404` (recovery).

## Intent coverage: before and after

| Intent | Live site | Rebuild |
|---|---|---|
| Navigational | 1 page | 4 |
| Commercial investigation | 1 page (homepage) | 7 |
| **Product-specific** | **0** | **4** |
| **Service-specific** | 0 (one combined page) | **5** |
| **Informational** | 1 | **6** |
| Question-based | 1 (contradicted elsewhere) | 2 |
| **Transactional / process** | 3 fragmented URLs | **5** |
| **Local / geographic** | **0** | **2** |
| **B2B development** | 1 thin page (167 words) | **1 substantial** |
| Trust / evidence | 3 thin pages | 3 consolidated |

**Six intents that were unserved or served only by a form now have a dedicated page.** Meanwhile
36 of the live site's 71 indexable URLs served no intent at all and are gone.

## Conversion paths

```
Cold search ("used tyres wholesale")
  → /  → /tyres/  → /tyres/car-tyres/  → /request-a-quote/car-tyres/

Specification search ("used tyre tread depth grades")
  → /tyres/quality-grades/  → /tyres/car-tyres/  → quote

Process search ("how to import used tyres by container")
  → /how-to-order/  → /request-a-quote/

Geographic search ("used tyre supplier ships to Ghana")
  → /export-markets/  → /services/export-and-customs/  → quote

Small-volume buyer (Benelux)
  → /offers/sprinter-van-delivery/  → inline form on the same page

Due diligence (already quoted, checking credibility)
  → /about/  → /gallery/  → /legal/purchasing-terms/

Truck specialist
  → /tyres/truck-tyres/  → /tyres/quality-grades/  → /request-a-quote/truck-tyres/

Franchise enquiry
  → /franchise/  → /contact/
```

Every path is at most 4 steps, and phone, WhatsApp and email are present in the header, footer and
CTA band of every page, so any path can short-circuit to direct contact at any point.

## Cannibalisation control

Pages that could compete were separated by intent rather than by keyword:

| Pair | How they are kept distinct |
|---|---|
| `/tyres/car-tyres/` vs `/tyres/quality-grades/` | Product page = what you can buy (sizes, quantities). Grades page = how grading works, across both car and truck. |
| `/how-to-order/` vs `/request-a-quote/` | Process and terms vs the form itself. |
| `/services/doubling-and-tripling/` vs `/services/container-loading/` | Reducing the space each tyre occupies vs removing the space between them. |
| `/export-markets/` vs `/services/export-and-customs/` | Where (geography) vs how (documentation). |
| `/faqs/` vs `/how-to-order/` | Broad objection handling vs the ordering process specifically. Overlapping questions link to each other rather than repeating. |
| `/about/` vs `/gallery/` | Company narrative and figures vs photographic evidence. |

## Pages deliberately not created

Each would have required inventing facts:

| Not created | Why |
|---|---|
| Location pages ("Used tyres Ghana", "…Senegal") | FlexTyres publishes a destination list, not local operations. Twelve near-identical pages would be doorway pages. |
| Size pages ("205/55R16 used tyres") | 348 near-duplicate pages with no unique content. Sizes belong in one searchable table. |
| Brand pages ("Used Michelin tyres wholesale") | The source says "all brands" for every grade. There is no per-brand stock, pricing or specification. |
| Blog / articles | No editorial content exists on the source site. Writing some would be inventing expertise. |
| Team page | The only named people on the source are eight fabricated theme personas (C-14). |
| Individual testimonial pages | Six reviews; they belong together on `/about/`. |
