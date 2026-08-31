# PHASES 3–5 — IA Audit, URL Strategy, New Architecture

---

# PHASE 3 — Existing Information Architecture Audit

## 3.1 The navigation as published

**Top bar:** locations · phone · hours
**Main nav:** HOME · OUR STOCK ▾ · ABOUT US ▾ · CONTACT · MY ACCOUNT · REQUEST A FREE QUOTE

| Nav item | Destination | Problem |
|---|---|---|
| OUR STOCK ▾ → Gallery | `/en/our-stock-new/` | |
| OUR STOCK ▾ → Car Tires | `/en/our-stock-new/` | **Same destination** |
| OUR STOCK ▾ → Truck Tires | `/en/our-stock-new/` | **Same destination** |
| OUR STOCK ▾ → Videos | YouTube | Leaves the site |
| ABOUT US ▾ → About Us | `/en/about-us/` | |
| ABOUT US ▾ → Our Services | `/en/our-services/` | Services filed under "About" |
| ABOUT US ▾ → Tripling Techniques | `/en/tripling-techniques/` | A service, filed under About |
| ABOUT US ▾ → Tire Recycling | `/en/tire-recycling/` | A product line, filed under About |
| ABOUT US ▾ → Franchise Opportunity | `/en/franchise-opportunity/` | |
| ABOUT US ▾ → Purchasing Terms | `Terms & Conditions.pdf` | **404 — unencoded `&`** |
| ABOUT US ▾ → FAQs | `/en/faqs/` | |
| MY ACCOUNT | `/en/my-account/` | Empty WooCommerce page in the primary nav |

**Footer "Company Links":** About Us · My Account · Services · Our Stock · Our Offers · FAQs ·
Gallery · YouTube · Contact Us · Franchising · Purchasing Terms · Gallery

- "Gallery" appears **twice**, pointing at two different URLs
- "Our Offers" → `#`
- "Our Stock" → `/en/our-stock/` → 301 → `/en/our-stock-new/`
- "Purchasing Terms" → the same 404

## 3.2 Structural failures

| # | Failure | Consequence |
|---|---|---|
| F1 | Three nav labels resolve to one URL | A buyer looking for truck tyres and a buyer looking for car tyres land on the identical 121-word page |
| F2 | "About Us" is a dumping ground | Services, a service detail, a product line, a franchise programme and the FAQ all hang off a company-story menu |
| F3 | No product tier exists | The site sells tyres but has no page for *car tyres* or *truck tyres*. Truck buyers get a quote form and nothing else on the live install |
| F4 | Services have no hub-and-spoke | Four services are described on one page. Only one (tripling) has a detail page, and it is filed under About |
| F5 | Conversion path is fragmented | `/en/request-a-free-quote/` → chooser → `/en/quote-car-tires/` or `/en/quote-truck-tires/`. Three URLs, three indexable pages, one action |
| F6 | The best page is unreachable | `/en/sprinter-delivery-180-tires/` (559 words, full order form, a genuinely differentiated offer) is linked from nothing |
| F7 | Geography is invisible | 12 export destinations exist only on the abandoned legacy About page. The live site says "worldwide" and embeds a map with no text |
| F8 | Empty commerce in the primary nav | "MY ACCOUNT" occupies prime navigation real estate and leads to a WooCommerce stub |
| F9 | Legal content is unreachable and inconsistent | The Purchasing Terms link 404s everywhere; three privacy policies exist |
| F10 | 21 fabricated pages sit inside the crawlable graph | Team and portfolio archives are linked from the theme's own templates |

## 3.3 Intent mapping of the current site

| Intent | Served by | Quality |
|---|---|---|
| Navigational ("flextyres") | `/en/` | Adequate |
| Commercial investigation ("used tyres wholesale") | `/en/` only | Weak — one page carries everything |
| Product-specific ("used car tyres in bulk") | Nothing | **Absent** |
| Product-specific ("used truck tyres export") | A quote form | **Absent** |
| Question-based ("minimum order used tyres") | `/en/faqs/` | Adequate but contradicted elsewhere |
| Commercial ("tyre container loading service") | Buried on `/en/our-services/` | Weak |
| Local ("used tyre wholesaler Belgium") | Footer text | **Absent as a page** |
| Transactional ("request tyre quote") | 3 URLs | Fragmented |
| Informational ("what is tyre tripling") | `/en/tripling-techniques/` | Good |
| B2B ("used tyre franchise") | `/en/franchise-opportunity/` | Thin (167 words) |

**Six of ten intents are unserved or barely served.** Meanwhile 36 URLs serve no intent at all.

---

# PHASE 4 — URL, Canonical and Redirect Strategy

## 4.1 Principles applied

1. **The apex is canonical.** `https://flextyres.com/` serves the homepage directly. The current
   `/` → `/en/` hop is removed: there is one language, so a language prefix is pure overhead and
   costs the most-linked URL on the site an extra hop.
2. **Slugs are preserved wherever the existing slug is good.** `about-us` → `about` and
   `contact-us` → `contact` are the only cosmetic changes, and both are made because they also
   deduplicate against the legacy install's identical slugs, which must 301 somewhere anyway.
3. **British "tyres" in new paths, US "tires" preserved in redirects.** The brand is FlexTyres, the
   company is Belgian, the legacy install used "tyres". New product paths use `tyres`; every
   `tires` URL 301s.
4. **Trailing slashes always.** One form, enforced at build and at the edge.
5. **No chains, no loops.** Every legacy URL points at its **final** destination in one hop.
6. **Every internal link targets the final canonical URL.** Enforced by a build-time link checker.
7. **410 for fabricated content**, not 301. Theme demo staff and services have no equivalent page;
   a 301 to `/about/` would be a soft misdirection. Where a *related* real page exists
   (portfolio → services) a 301 is used; where the content was purely fictional and has no
   counterpart (`hello-world`, date archives, author archive) 410 is correct.

## 4.2 Redirect map

See [`URL_REDIRECT_MAP.md`](../URL_REDIRECT_MAP.md) — 84 rules, all single-hop.

---

# PHASE 5 — New Information Architecture

## 5.1 The ten questions the architecture must answer

| Question | Answered by |
|---|---|
| WHO is FlexTyres? | `/about/` |
| WHAT does it sell? | `/tyres/` → `/tyres/car-tyres/`, `/tyres/truck-tyres/`, `/tyre-recycling/` |
| WHICH grades and types? | `/tyres/quality-grades/` |
| WHO does it sell to? | `/about/` + every product page's "Who this is for" |
| WHERE does it operate? | `/export-markets/` + `/contact/` |
| WHAT services? | `/services/` → 4 detail pages |
| HOW does procurement work? | `/how-to-order/` |
| HOW is quality assessed? | `/tyres/quality-grades/` |
| HOW does shipping/export work? | `/services/export-and-customs/` + `/services/container-loading/` |
| HOW do I get a price? | `/request-a-quote/` → 2 forms |

## 5.2 The new tree

```
/                                    Home
├── /tyres/                          Tyre range (hub)
│   ├── /tyres/car-tyres/            Car tyres — grades, sizes 12"–22", containers
│   ├── /tyres/truck-tyres/          Truck tyres — grades, sizes, containers
│   └── /tyres/quality-grades/       How grading works (car + truck, side by side)
├── /tyre-recycling/                 Chips and bales
├── /services/                       Services (hub)
│   ├── /services/doubling-and-tripling/
│   ├── /services/container-loading/
│   ├── /services/transportation/
│   └── /services/export-and-customs/
├── /how-to-order/                   Process, minimums, what to send us
├── /export-markets/                 Where we ship, with the published destination list
├── /offers/                         Current offers (hub)
│   └── /offers/sprinter-van-delivery/
├── /franchise/                      Franchise programme
├── /gallery/                        Warehouse and loading photography
├── /faqs/                           FAQs
├── /about/                          Company, trust evidence, testimonials
├── /contact/                        NAP, hours, locations, form
├── /request-a-quote/                Quote hub
│   ├── /request-a-quote/car-tyres/
│   └── /request-a-quote/truck-tyres/
├── /thank-you/                      noindex
├── /legal/                          noindex hub
│   ├── /legal/purchasing-terms/
│   ├── /legal/terms-and-conditions/
│   └── /legal/privacy-policy/
└── /404
```

**23 indexable pages.** Maximum depth 2. Every page has independent value and a distinct intent.

## 5.3 Why each new page exists (no page is created for keywords alone)

| New page | Source content that justifies it | Intent it serves |
|---|---|---|
| `/tyres/car-tyres/` | Car grades (3 sources) + 200+ published sizes + container capacities + tripling | Product-specific commercial — **currently unserved** |
| `/tyres/truck-tyres/` | Truck grades (legacy, unique) + 15 published sizes + truck container capacities | Product-specific commercial — **currently unserved** |
| `/tyres/quality-grades/` | Both grade tables + the "all brands" statement + the inspection process | Commercial investigation / AEO — the most-asked buyer question |
| `/services/*` (4) | Four services with distinct published descriptions; tripling already has a detail page | Service-specific commercial — **currently one page for four services** |
| `/how-to-order/` | FAQ "How do I make an order?" + the three minimum-order routes + 24-hour response + what the buyer must supply | Transactional — resolves conflict C-05 structurally |
| `/export-markets/` | 12 published destinations + "worldwide importer and exporter" + the Google MyMaps embed + Sprinter's BE/FR/NL coverage | Local + commercial — **currently absent**, rescues legacy-only content |
| `/offers/sprinter-van-delivery/` | The orphaned 559-word page | Transactional — **de-orphans the best page on the site** |
| `/gallery/` | 45 + 12 + 14 genuine photographs across three abandoned pages | Trust evidence — consolidates three thin pages into one |
| `/legal/purchasing-terms/` | The Terms PDF, currently unreachable | Navigational — **fixes a site-wide 404** |

**No page is created without source content.** There are no location pages, no
"used tyres in <country>" variants, no size-permutation pages, no brand pages. Every one of those
would require inventing facts.

## 5.4 Cannibalisation resolved

| Old collision | Resolution |
|---|---|
| `/en/faqs/` + `/frequently-asked-questions/` | Merge → `/faqs/` |
| `/en/about-us/` + `/about-us/` | Merge → `/about/`, rescuing the legacy export-destination list into `/export-markets/` |
| `/en/our-stock-new/` + `/our-stock/` + `/image-gallery/` | Merge → `/gallery/` (photos) + `/tyres/` (product substance) |
| `/en/tire-recycling/` + `/recycling/` | Merge → `/tyre-recycling/` |
| `/en/tripling-techniques/` + `/tyres-for-cars/` | Split by intent: process → `/services/doubling-and-tripling/`; grades and sizes → `/tyres/car-tyres/` |
| `/en/our-services/` + `/en/portfolio/*` | Fabricated set removed; real services get a hub plus 4 detail pages |
| 3 privacy policies | One at `/legal/privacy-policy/`; two 301 |
| 3 quote entry points | Hub at `/request-a-quote/` + 2 form pages, each targeting a genuinely different product and form schema |

## 5.5 Internal linking model

Every page links to: its **parent hub** (breadcrumb), its **siblings** (hub grid),
its **related commercial page**, and **one quote CTA**. Additionally:

- `/tyres/car-tyres/` ↔ `/tyres/quality-grades/` ↔ `/services/doubling-and-tripling/`
- `/tyres/truck-tyres/` ↔ `/tyres/quality-grades/` ↔ `/services/container-loading/`
- `/how-to-order/` ← linked from every product page, every service page, and the FAQ
- `/export-markets/` ← linked from `/about/`, `/services/export-and-customs/`, `/services/transportation/`
- `/faqs/` ← linked from every commercial page; each FAQ answer links to the page that expands it
- `/gallery/` ← linked from `/about/`, `/tyres/`, and every service page

**No orphans.** A build-time check fails the build if any page in the sitemap has zero inbound
internal links.

## PHASE RESULT (Phases 3–5)

**Status: PASS**

### Completed
Existing IA mapped and audited (10 structural failures, F1–F10); intent coverage measured
(6 of 10 intents unserved); URL strategy defined; 84-rule redirect map produced; new 23-page
architecture designed with a documented source justification for every page.

### Findings
The existing IA has no product tier at all — a tyre wholesaler with no car-tyre page and no
truck-tyre page. Three navigation labels resolve to one thin URL. The richest commercial page is
an orphan. 36 of 71 indexable URLs serve no intent.

### Changes Made
`docs/PHASE-3-5-ARCHITECTURE.md`, `URL_REDIRECT_MAP.md`.

### Audit Results
- Every old URL has a destination — PASS (84/84)
- No redirect chains — PASS (all single-hop)
- No loops — PASS
- Every new page justified by source content — PASS (23/23)
- No fabricated location/keyword pages — PASS

### Remaining Risks
Changing `/en/*` to root-level paths moves every ranking URL. Mitigated by single-hop 301s from
every old URL, preserved slugs, and a sitemap that lists only the new canonical set.

### Exit Criteria
Met.

### Next Phase
Phase 6 — Astro architecture.
