# STRUCTURED_DATA_AUDIT.md

Every claim in the JSON-LD is backed by content visible on the page that emits it, and by a public
flextyres.com source. Enforced by `scripts/check-schema.mjs` in `npm run audit`.

---

## 1. Before / after

| | Live site | Rebuild |
|---|---|---|
| Generator | Yoast SEO 24.6 boilerplate | Hand-written generators in `src/lib/schema.ts` |
| Types emitted | 4 (`WebPage`, `WebSite`, `Organization`, `BreadcrumbList`) — identical on every page | 10, page-appropriate |
| `Organization` address | **absent** | present |
| `Organization` telephone | **absent** | present |
| `Organization` email | **absent** | present |
| `Organization` opening hours | **absent** | present |
| `Organization` contactPoint | **absent** | present |
| `FAQPage` on the FAQ page | **absent** | present, 10 questions |
| `ContactPage` on the contact page | **absent** | present |
| `PostalAddress` | **absent** | present |
| `Service` nodes | **absent** | 4 |
| `HowTo` for the ordering process | **absent** | present, 6 steps |
| `ImageObject` pointing at theme demo photos | **present** on 13 pages | none |
| Broken `@id` references | — | 0 (enforced) |

## 2. Types emitted

```
  29 x Organization      every page — one consistent entity
  29 x WebSite           every page
  28 x BreadcrumbList    every page except the 404
  27 x WebPage           every page except the 404, /about/ and /contact/ (which use subtypes)
   5 x ItemList          hub pages, describing the list actually rendered
   4 x Service           one per service detail page
   3 x FAQPage           /faqs/, /how-to-order/, /tyres/quality-grades/
   1 x AboutPage         /about/
   1 x ContactPage       /contact/
   1 x HowTo             /how-to-order/
```

## 3. Deliberately absent

These are the properties a template would emit and this site does not, because the public source
does not support them. **`scripts/check-schema.mjs` fails the build if any of them appears.**

| Property | Why it is not emitted |
|---|---|
| `aggregateRating`, `ratingValue`, `reviewCount`, `ratingCount` | No aggregate rating is published anywhere on the source site. The "See All Reviews" link has an empty `placeid` parameter, so the reviews are not even reachable. Inventing a score would be fabrication. |
| `review` | The six testimonials are genuine and are migrated verbatim, but they are third-party (Google) reviews of the site's own business. Self-serving review markup for reviews hosted elsewhere is outside Google's supported use. |
| `offers`, `price`, `priceCurrency`, `lowPrice`, `highPrice` | FlexTyres publishes no prices at all. Its own answer: "It depends upon the quantity and quality of the tires." |
| `availability` | The company's own order sheet is annotated "STOCK LIMITED". No per-size availability is published. |
| `foundingDate` | 2011 is inferred from a copyright range, not stated as a founding year. Inference is not fact. |
| `employee`, `founder`, `numberOfEmployees` | The only named people on the source site are eight fabricated theme-demo personas (C-14). No real staff are published. |
| `award`, `hasCredential` | None published. |
| `vatID`, `taxID`, `duns`, `globalLocationNumber` | None published. |
| `Product` | Used tyres are sold as graded bulk lots by the container, not as identifiable SKUs. Without price, availability, GTIN or a per-unit offer, `Product` would be an empty shell. `Service` and `ItemList` describe what is genuinely on the page. |
| `LocalBusiness` | See below. |

### Why `Organization` and not `LocalBusiness`

`LocalBusiness` asserts a place a customer can visit to transact. FlexTyres publishes **one**
street address — an office in Evere — plus two warehouses named only by city, with no per-location
hours, no per-location phone and no walk-in retail offer. The minimum order is 180 tyres. Modelling
this as `LocalBusiness` would invite storefront treatment the source does not support.

`Organization` carries everything that *is* published: address, telephone, email,
`contactPoint`, `openingHoursSpecification`, `sameAs`, `knowsAbout` and the two secondary
locations as plain `Place` nodes with no invented hours or phone numbers.

## 4. Entity architecture

One stable identity, referenced from every page:

| `@id` | Node | Purpose |
|---|---|---|
| `https://flextyres.com/#organization` | `Organization` | The single FlexTyres entity |
| `https://flextyres.com/#website` | `WebSite` | The site, `publisher` → Organization |
| `https://flextyres.com/#logo` | `ImageObject` | Referenced by `Organization.logo` and `.image` |
| `<page-url>#webpage` | `WebPage` | `isPartOf` → WebSite, `about` → Organization |
| `<page-url>#breadcrumb` | `BreadcrumbList` | Referenced by `WebPage.breadcrumb` |
| `<page-url>#service` | `Service` | `provider` → Organization |
| `<page-url>#faq` / `#howto` / `#list` | Page-specific | |

**The `Organization` node is byte-identical on all 29 pages** — enforced by fingerprint comparison
in the audit. On the live site the same entity is described four different ways across two
installs with conflicting addresses.

`sameAs` contains only profiles that resolve to a real FlexTyres presence: Facebook, YouTube and
the Google Business Profile (via the CID published on the source homepage). LinkedIn is excluded
because the source links to `linkedin.com` itself, not to a company page (C-23).

## 5. Validation performed

`scripts/check-schema.mjs` asserts, per page:

| Check | Result |
|---|---|
| JSON-LD parses | 29/29 |
| Exactly one graph per page | 29/29 |
| `@context` is `https://schema.org` | 29/29 |
| Every node has an `@type` | pass |
| Every `{"@id": …}` reference resolves inside the graph, including nested nodes | pass |
| Every `flextyres.com` URL in the graph exists in `dist/` | pass |
| `Organization` present, with address, telephone and opening hours | 29/29 |
| `Organization` identical across all pages | pass |
| `BreadcrumbList` items appear in the **visible** breadcrumb trail | pass |
| Every breadcrumb `item` URL exists | pass |
| **Every `FAQPage` question and answer is visible in the page HTML** | pass |
| **Every `HowTo` step name is visible in the page HTML** | pass |
| `WebPage.url` matches the page's own route | pass |
| The 404 declares no `WebPage` node | pass |
| No forbidden property (22 checked) | pass |

### A real defect this caught

The first implementation of `/how-to-order/` emitted a `FAQPage` with five questions that were
**not rendered on the page** — the page showed process steps and a terms table instead. That is
exactly the schema-to-content mismatch that gets structured data ignored or penalised. The audit
failed the build; the fix was to render the questions visibly using the shared `FAQList`
component, not to weaken the check.

## 6. Per-page inventory

| Page | Nodes |
|---|---|
| `/` | Organization, WebSite, WebPage, BreadcrumbList, ItemList (services) |
| `/tyres/` | + ItemList (4 ranges) |
| `/tyres/car-tyres/` | Organization, WebSite, WebPage, BreadcrumbList |
| `/tyres/truck-tyres/` | Organization, WebSite, WebPage, BreadcrumbList |
| `/tyres/quality-grades/` | + **FAQPage** (4 grading questions) |
| `/tyre-recycling/` | Organization, WebSite, WebPage, BreadcrumbList |
| `/services/` | + ItemList (4 services) |
| `/services/<slug>/` ×4 | + **Service** (`provider` → Organization) |
| `/how-to-order/` | + **FAQPage** (5 questions) + **HowTo** (6 steps) |
| `/export-markets/` | Organization, WebSite, WebPage, BreadcrumbList |
| `/offers/` | + ItemList |
| `/offers/sprinter-van-delivery/` | WebPage — **no Offer node**, see C-16 |
| `/franchise/` | Organization, WebSite, WebPage, BreadcrumbList |
| `/gallery/` | Organization, WebSite, WebPage, BreadcrumbList |
| `/faqs/` | + **FAQPage** (10 questions) |
| `/about/` | + **AboutPage** (`mainEntity` → Organization) |
| `/contact/` | + **ContactPage** |
| `/request-a-quote/` | + ItemList (2 forms) |
| `/legal/*` | WebPage with `datePublished` — the real published date, never manufactured |
| `/404.html` | Organization + WebSite only |

## 7. Dates

`datePublished` is emitted only on the three legal pages, carrying the dates the source documents
actually state: **2012-10-01** for the purchasing terms and **2020-10-01** for the website terms
and privacy policy. `dateModified` is not emitted anywhere, because no page has a genuine,
verifiable modification date. No date is manufactured to appear fresher.

## PHASE RESULT — Phase 10, Structured Data / Entity Architecture

**Status: PASS**

### Findings
The live site emits generic plugin boilerplate that describes no business: an `Organization` with
no address, phone, email or hours, on a site whose footer carries all four on every page. The FAQ
page emits no `FAQPage`; the contact page emits no `ContactPage`. Thirteen pages emit
`ImageObject` nodes pointing at theme demo photography.

### Changes made
10 schema types, one consistent `Organization` entity across all 29 pages, and a validator that
fails the build on any unsupported property, unresolved reference, or claim not visible on the page.

### Remaining risks
`Product` and `Offer` markup would help commercial visibility but cannot be added honestly until
FlexTyres publishes price or availability data. If the owner resolves C-16 (the undated 10%
discount) with real validity dates, an `Offer` node becomes appropriate on the Sprinter page.
