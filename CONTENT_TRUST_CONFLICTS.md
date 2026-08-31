# CONTENT_TRUST_CONFLICTS.md

Every factual inconsistency found across the public flextyres.com content, and exactly how the
rebuild handles it.

**Governing rule applied throughout:** where two public sources disagree, the rebuild either
(a) uses the version published on the **current, actively maintained install** (`/en/`, © 2011-2025)
when the other version is demonstrably stale, or (b) states the claim in the **least specific form
both sources support**, or (c) **omits the claim entirely**. The rebuild never averages, never
invents a reconciling value, and never strengthens a claim.

Legend — Severity: **CRITICAL** (misleads a buyer about what they are purchasing or where the
business is) · **HIGH** (materially affects a commercial decision) · **MEDIUM** (damages
credibility) · **LOW** (cosmetic inconsistency).

---

## C-01 — Car tyre quality grades: tread depth and grade letters disagree

| | |
|---|---|
| **Claim** | The tread-depth range and quality letter for each of the three car tyre grades |
| **Source A** | `https://flextyres.com/en/` (homepage, live install) |
| **Representation A** | High Quality: "Thread depth 4 mm – 8 mm / TIre quality: A / All brands"<br>Medium Quality: "Thread depth **3 mm – 5 mm** / TIre quality: **A and B** / All brands"<br>Low Quality: "Thread depth **2 mm – 3 mm** / TIre quality: **C** / All brands" |
| **Source B** | `https://flextyres.com/en/about-us/`, `https://flextyres.com/en/tripling-techniques/` (same install) |
| **Representation B** | High Quality: "Thread depth 4 mm – 8 mm / Tyre Quality A / All brands"<br>Medium Quality: "Thread depth **2,5 mm – 5 mm** / Tyre quality **A and B** / All brands"<br>Low Quality: "Thread depth **1 mm – 3 mm** / Tyre Quality **B** / All brands" |
| **Source C** | `https://flextyres.com/tyres-for-cars/` (legacy install) |
| **Representation C** | Identical to Source B |
| **Severity** | **CRITICAL** |
| **Risk** | Tread depth and grade letter are the *only* product specifications this business publishes. A buyer ordering "Low quality" cannot tell whether they receive 1 mm or 2 mm minimum tread, or grade B or grade C stock. This is the core of what is being sold. |
| **Safe to normalise?** | **NO** |
| **Chosen implementation** | The grade table is published with the ranges from **Sources B + C** (2 of 3 sources, appearing on three separate pages across both installs, and internally consistent — the ranges tile without gaps: 1–3 / 2,5–5 / 4–8). Immediately beneath the table the site states, in visible copy: *"Grades and tread depths are indicative. Confirm the exact grade, tread depth and mix for your order in writing before shipping."* The homepage's differing figures are **not** published anywhere. No `Product` schema asserts a tread depth. |
| **Owner verification required?** | **YES** |
| **Reason** | Three published variants exist for a specification that defines the product. FlexTyres must confirm the authoritative ranges and grade letters, after which the caveat can be tightened or removed. Until then the caveat is the honest position. |

---

## C-02 — Belgium office address: two different addresses in two different cities

| | |
|---|---|
| **Claim** | The location of the FlexTyres Belgium office |
| **Source A** | `https://flextyres.com/en/contact-us/` + the footer of **every** live page |
| **Representation A** | "Office Belgium: Avenue Jules Bordet 160 Map box 16, 1140 Evere, Belgium" |
| **Source B** | `https://flextyres.com/contact-us/` (legacy install, still indexable) |
| **Representation B** | "Office Belgium: Hoogstraat 28, 2800 Mechelen" |
| **Severity** | **CRITICAL** |
| **Risk** | Evere (Brussels-Capital Region) and Mechelen (Antwerp Province) are ~25 km apart. A buyer travelling to inspect stock — which the FAQ explicitly invites ("If you visit our warehouse you can choose the second hand tyres") — could go to the wrong city. Conflicting addresses also fragment local-search entity signals. |
| **Safe to normalise?** | **YES, with reservation** |
| **Chosen implementation** | Only the Evere address is published. It appears on the current install, in the global footer of every live page, and the legacy install has not been updated since 2021 (© 2011-2021). The Mechelen address is not published anywhere in the rebuild, and `/contact-us/` 301s to `/contact/`. The `PostalAddress` in structured data uses Evere. |
| **Owner verification required?** | **YES** |
| **Reason** | Address is a primary entity fact used by Google Business Profile, maps and AI answer systems. The stale page should also be removed at source. Note the literal string "Map box 16" appears in the published address and is most likely a corruption of "box 16"; the rebuild publishes "box 16" and flags this. |

---

## C-03 — Business hours: Saturday closing time differs

| | |
|---|---|
| **Claim** | Opening hours |
| **Source A** | Top bar and footer of **every** live page |
| **Representation A** | "Monday-Saturday, 8:00am-5:30pm GMT+1" and "8:00 - 17:30 / Monday to Saturday" |
| **Source B** | `https://flextyres.com/en/contact-us/` |
| **Representation B** | "Monday – Friday: 8:00 AM – 5:30 PM GMT+1" / "Saturday: 8:00 AM – **3:00 PM** GMT+1" |
| **Severity** | HIGH |
| **Risk** | A buyer arriving or calling at 16:00 on a Saturday would find the business closed. The global chrome contradicts the dedicated contact page on the same install. |
| **Safe to normalise?** | **YES** |
| **Chosen implementation** | The **more specific and more conservative** version (Source B) is used everywhere, including in `openingHoursSpecification`: Mon–Fri 08:00–17:30, Sat 08:00–15:00, Sun closed, timezone stated as CET (GMT+1). Source B is the page whose sole purpose is to state contact details, and choosing it cannot cause a wasted journey; choosing Source A could. |
| **Owner verification required?** | NO (implementation is safe) — but confirmation is welcome |
| **Reason** | Selecting the narrower window is the least misleading option regardless of which is correct. |

---

## C-04 — Warehouse locations: the USA warehouse appears on exactly one page

| | |
|---|---|
| **Claim** | Which warehouses FlexTyres operates |
| **Source A** | Global footer, global top bar, homepage — every live page |
| **Representation A** | "Evere, Belgium \| Frankfurt, Germany" — Office Belgium + Warehouse Germany only |
| **Source B** | `https://flextyres.com/en/contact-us/` **and** `https://flextyres.com/contact-us/` (both installs) |
| **Representation B** | Office Belgium + "WAREHOUSE GERMANY: Frankfurt, Germany" + "**WAREHOUSE USA: Hollywood, Florida**" |
| **Severity** | HIGH |
| **Risk** | A US buyer reading the contact page may expect domestic stock and domestic delivery. The site's own footer, appearing on 100 % of pages, contradicts this by listing only two locations. No page describes any US service, US shipping or US stock. |
| **Safe to normalise?** | **PARTIAL** |
| **Chosen implementation** | All three locations are listed on `/contact/` exactly as the source publishes them, because both installs agree that all three exist. The **Florida location is not promoted** anywhere else — not in the footer, not in the header, not in `areaServed`, and not as a `LocalBusiness` node — because no public content substantiates any operation there. Structured data models Evere as the organisation address and Frankfurt + Hollywood as plain text locations, with no fabricated hours, phone numbers or postal addresses. |
| **Owner verification required?** | **YES** |
| **Reason** | If the Florida warehouse is active it deserves a real page (stock, contact, hours) and would materially change the site's geography and schema. If it is not active it must be removed from the contact page. Neither can be decided from public information. |

---

## C-05 — Minimum order quantity: 1,000 pieces vs a full container

| | |
|---|---|
| **Claim** | The minimum quantity a buyer must purchase |
| **Source A** | `https://flextyres.com/en/faqs/` and `https://flextyres.com/frequently-asked-questions/` |
| **Representation A** | "How many tires do I have to take? — **The minimum quantity we sell are 1000 pieces**" |
| **Source B** | `https://flextyres.com/en/quote-car-tires/` |
| **Representation B** | "**We Sell Only by Container – Minimum Order: 20ft Container (+-1350 tires)** (*at least 20 different sizes)" |
| **Source C** | `https://flextyres.com/en/sprinter-delivery-180-tires/` |
| **Representation C** | "Minimum Order: Sprinter Van (**180 tires**)" — for Belgium, France and the Netherlands |
| **Severity** | **CRITICAL** |
| **Risk** | The three published minimums differ by a factor of 7.5×. A buyer budgeting for 1,000 tyres against the FAQ would be told at quotation stage that the real floor is ~1,350, or that they cannot buy at all outside van-delivery territory. |
| **Safe to normalise?** | **NO — but the conflict is reconcilable as three distinct purchase routes** |
| **Chosen implementation** | The rebuild stops presenting a single "minimum order" and instead publishes the three routes the source actually documents, each with its own stated minimum and its own stated coverage: <br>• **Sprinter van delivery** — 180 tyres — Belgium, France, Netherlands only<br>• **20 ft container** — approx. 1,350 tyres tripled, at least 20 different sizes — export<br>• **40 ft container** — approx. 2,800 tyres tripled — export<br>The FAQ answer is republished **verbatim** as the source wrote it, immediately followed by the route table so the two cannot be read in isolation. Truck tyres carry their own container figures (approx. 130 / 270). No single global "minimum order" number is asserted anywhere. |
| **Owner verification required?** | **YES** |
| **Reason** | The "1000 pieces" FAQ answer may simply be obsolete. FlexTyres should confirm whether a 1,000-piece order is still accepted; if not, the FAQ answer should be corrected at source and the rebuild updated. |

---

## C-06 — Stock quantity: 50,000 vs 100,000+

| | |
|---|---|
| **Claim** | Number of tyres held in stock |
| **Source A** | `https://flextyres.com/en/`, `/en/sprinter-delivery-180-tires/` |
| **Representation A** | "More than 100,000+ tires in stock." / "We cary all brands & sizes and have more than 100,000 tires in stock." |
| **Source B** | `https://flextyres.com/home/`, `https://flextyres.com/tyres-for-cars/` (legacy) |
| **Representation B** | "More than 50.000 tyres in stock." |
| **Severity** | MEDIUM |
| **Risk** | Two live pages advertise stock levels that differ 2×. Neither is dated. The XLSX order sheet itself is annotated "**NOTE: STOCK LIMITED.**", which contradicts the framing of both. |
| **Safe to normalise?** | **YES** |
| **Chosen implementation** | The current-install figure ("more than 100,000 tyres in stock") is used, attributed as a company statement rather than as a verified metric, and the source's own "Stock limited" note is surfaced next to the stock-list download rather than buried inside the spreadsheet. No stock figure is placed in structured data, and no `availability` property is emitted anywhere. |
| **Owner verification required?** | NO (safe) |
| **Reason** | The legacy figure is from a site last updated in 2021; the current install is authoritative. Keeping the number out of schema avoids asserting an unverifiable quantity as machine-readable fact. |

---

## C-07 — "Years of experience" is frozen and contradicts the copyright range

| | |
|---|---|
| **Claim** | How long FlexTyres has been trading |
| **Source A** | `https://flextyres.com/en/`, `/en/about-us/`, `/en/franchise-opportunity/`, `/en/sprinter-delivery-180-tires/` |
| **Representation A** | "**8+ YEARS OF EXPERIENCE**" and "a successful family business with **more than 8 years of experience** wholesaling used tyres" |
| **Source B** | Footer of every live page |
| **Representation B** | "© **2011**-2025 FlexTyres - All Rights Reserved." |
| **Source C** | Legacy install (unchanged since 2021) |
| **Representation C** | The **same** "more than 8 years" claim, alongside "©2011-2021" |
| **Severity** | MEDIUM |
| **Risk** | The identical "8+ years" string has been published across at least two site generations spanning 2021–2025, so it is provably stale. A 2011 founding date implies roughly 14 years, not 8. Freshness signals and E-E-A-T both suffer from a self-evidently unmaintained metric. |
| **Safe to normalise?** | **YES** |
| **Chosen implementation** | The counter is **removed**. The site instead states the fact both sources agree on and which does not decay: *"Trading since 2011."* The About page keeps the source's own narrative verbatim — "Started as a one-man operation, FlexTyres grew into a family business wholesaling used tyres" — with the frozen "8 years" figure dropped rather than silently updated to 14. `foundingDate` is **not** emitted in schema, because 2011 is inferred from a copyright range rather than stated as a founding year. |
| **Owner verification required?** | NO (safe) — confirmation of the founding year would allow `foundingDate` |
| **Reason** | Publishing a date range that both sources support is strictly more accurate than republishing a counter that is demonstrably four years out of date, and strictly more honest than recalculating it to "14+" on the site's behalf. |

---

## C-08 — Customer counts and export volume are hard-coded, undated statistics

| | |
|---|---|
| **Claim** | "79359 TIRES EXPORTED" and "325 HAPPY CUSTOMERS" |
| **Source A** | `https://flextyres.com/en/` (animated counters) |
| **Source B** | `https://flextyres.com/en/sprinter-delivery-180-tires/` |
| **Representation B** | "325 Happy Customers" — **the identical figure** |
| **Source C** | `https://flextyres.com/home/` (legacy) |
| **Representation C** | The same three counter labels — "Tyres exported / Happy customers / Years of experience" — rendered with **no values at all** |
| **Severity** | MEDIUM |
| **Risk** | 79,359 is presented with five-digit precision but carries no date, no period and no method. The same 325 appears on two pages years apart, so it is not a live figure. The legacy page renders the labels with blank values, showing the counters were always decorative. |
| **Safe to normalise?** | **PARTIAL** |
| **Chosen implementation** | The counters are **not** reproduced as animated statistics. The figures are published once, on the About page, explicitly framed as company-stated and undated: *"FlexTyres states it has exported 79,359 tyres and served 325 customers. These figures are published by the company and are not dated."* They appear in **no** structured data and in **no** headline. |
| **Owner verification required?** | **YES** |
| **Reason** | If FlexTyres can date these figures ("as of <date>") they become genuine, citable trust evidence and should be promoted. Undated, they cannot be strengthened. |

---

## C-09 — "We sell strictly to wholesalers" vs "strictly to retailers"

| | |
|---|---|
| **Claim** | Who FlexTyres sells to |
| **Source A** | `https://flextyres.com/en/about-us/` |
| **Representation A** | "EXCLUSIVITY — We sell strictly to **wholesalers** giving us the ability to offer you exceptional servive." |
| **Source B** | `https://flextyres.com/en/franchise-opportunity/` (same install) |
| **Representation B** | "EXCLUSIVITY — We sell strictly to **retailers** giving us the ability to offer you exceptional servive." |
| **Source C** | `https://flextyres.com/home/`, `/about-us/` (legacy) |
| **Representation C** | "Exclusiveness — We sell strictly to **retailers**…" |
| **Severity** | HIGH |
| **Risk** | This defines the audience of the entire business. "Wholesalers" and "retailers" are different tiers of the supply chain, and the word "strictly" makes each statement exclusionary — each version tells the other group it cannot buy. It also directly affects who the site should be written for. |
| **Safe to normalise?** | **YES** |
| **Chosen implementation** | The exclusionary framing is dropped, because the source contradicts itself on which group is excluded and the site cannot honestly exclude either. The rebuild states what **all** sources support and what the rest of the site demonstrates: *"FlexTyres sells to trade buyers only — wholesalers, retailers and exporters. We do not sell to consumers."* Consumer exclusion is safe: every published route (container minimums, van minimums, the 1,000-piece FAQ floor, the franchise programme) is a trade quantity. |
| **Owner verification required?** | **YES** |
| **Reason** | If FlexTyres genuinely restricts sales to one tier, the site must say so accurately. The neutral trade-only phrasing is correct under either reading but is less specific than the business may want. |

---

## C-10 — Quality inspection: guaranteed on every tyre, or only on request

| | |
|---|---|
| **Claim** | Whether every tyre is inspected |
| **Source A** | `https://flextyres.com/en/about-us/`, `/en/franchise-opportunity/` |
| **Representation A** | "QUALITY GUARANTEE — **Each tires is carefully inspected and tested** to provide you the best quality." |
| **Source B** | `https://flextyres.com/home/`, `/about-us/` (legacy) |
| **Representation B** | "Safety — **All tyres can be inspected and tested if you request that.**" |
| **Severity** | HIGH |
| **Risk** | These are materially different commercial promises. Source A is an unconditional guarantee on 100 % of goods; Source B makes inspection an opt-in service. A buyer relying on A who receives uninspected stock has a contractual grievance, and the Purchasing Terms give only a **three-day** rejection window in which to raise it. |
| **Safe to normalise?** | **YES — toward the weaker claim** |
| **Chosen implementation** | The rebuild uses the current install's process wording, which both sources support and which describes an action rather than promising an outcome: *"Our team performs quality checks before loading, prepares the paperwork, packs, loads and ships your tyres."* This sentence is FlexTyres' own, appearing verbatim on the homepage, Services and Stock pages. The words "guarantee" and "guaranteed" are **not** attached to inspection anywhere in the rebuild. The Sprinter page's separate replacement promise is reproduced only on that page, where it is published. |
| **Owner verification required?** | NO (safe — the weaker, source-supported claim is used) |
| **Reason** | Never strengthen a claim past what the source supports. Where two versions of a promise exist, publishing the weaker one cannot mislead. |

---

## C-11 — Geography: "wholesaler in Germany" vs a Belgian company

| | |
|---|---|
| **Claim** | Where FlexTyres is based |
| **Source A** | `https://flextyres.com/en/faqs/` and the legacy FAQ |
| **Representation A** | "As a **wholeseller for used tires in Germany** it is very important for us to know, which tyre sizes are interesting for you." |
| **Source B** | Footer, contact page, Purchasing Terms PDF |
| **Representation B** | Office in Belgium; phone is Belgian (+32); Terms state "governed in all respects by the **Laws of Belgium**" |
| **Severity** | MEDIUM |
| **Risk** | Contradictory country signals confuse local search, entity resolution and buyer expectations about VAT, incoterms and jurisdiction. |
| **Safe to normalise?** | **YES** |
| **Chosen implementation** | The FAQ answer is republished with the geographic clause removed rather than rewritten — the sentence becomes *"…it is very important for us to know which tyre sizes are interesting for you."* The site consistently describes FlexTyres as **a Belgian company with a warehouse in Frankfurt, Germany**, which is what the address block, the phone number and the governing-law clause all support. Structured data uses `addressCountry: BE`. |
| **Owner verification required?** | NO (safe) |
| **Reason** | Three independent sources including a signed legal document establish Belgium. Removing a stray clause is less invasive than rewriting the answer, and the German warehouse is preserved as a stated fact. |

---

## C-12 — Truck tyre grades exist only on the abandoned install

| | |
|---|---|
| **Claim** | Quality grading for **truck** tyres |
| **Source A** | `https://flextyres.com/tyres-for-trucks/` (legacy install, © 2011-2021) |
| **Representation A** | High: "Thread depth 5mm + / Can be reused / No damage / Only export to Europe"<br>Medium: "Thread depth 3mm – 5mm / For retread and reuse / Maximum 1 repared damage / For export (also Europe)"<br>Low: "Thread depth 0mm – 2,5mm / For retread / 2 to 3 repared damages / Only for export" |
| **Source B** | The entire live install |
| **Representation B** | **No truck grading published at all.** `/en/quote-truck-tires/` offers 15 truck sizes and container quantities with no quality criteria whatsoever. |
| **Severity** | HIGH |
| **Risk** | Two ways to get this wrong. Dropping it leaves truck buyers — an actively solicited segment with a dedicated quote form — with zero specification. Migrating it silently republishes 2021 criteria, including a geographic restriction ("Only export to Europe" / "Only for export") that may no longer hold, as current fact. |
| **Safe to normalise?** | **PARTIAL** |
| **Chosen implementation** | The truck grade table is migrated to `/tyres/truck-tyres/`, reproduced faithfully, and carries a visible provenance line: *"Truck grading criteria as last published by FlexTyres. Confirm current grading and export restrictions when you request a quote."* The grades are **not** merged with the car grades, which use different criteria entirely, and are **not** placed in structured data. |
| **Owner verification required?** | **YES** |
| **Reason** | This is genuine, useful, otherwise-unavailable specification, but it is four years old and contains export restrictions with legal weight. It is worth preserving and worth flagging. |

---

## C-13 — Tyre size lists differ between the two quote forms and the downloadable sheet

| | |
|---|---|
| **Claim** | Which tyre sizes FlexTyres carries |
| **Source A** | `https://flextyres.com/en/quote-car-tires/` | Rim diameters **14–22**. No 12" or 13". |
| **Source B** | `https://flextyres.com/en/sprinter-delivery-180-tires/` | Rim diameters **12–22**, including `155-70-12` and ten 13" sizes. |
| **Source C** | `https://flextyres.com/request-a-quote/` (legacy) | Rim diameters **13–22**, with 15"/16" entries absent from A (e.g. `205-75-15`, `215-85-16`) |
| **Source D** | `/EUSIZESFLEX.xlsx` and `/EUSIZESFLEX.pdf` | Rim diameters **12–22** plus a truck block; the fullest list; annotated "STOCK LIMITED" |
| **Severity** | MEDIUM |
| **Risk** | A buyer needing 13" stock is told "no" by the main car quote form and "yes" by the Sprinter form and by the official downloadable sheet. Neither list is dated; the spreadsheet was last modified 2021-08-29. |
| **Safe to normalise?** | **YES** |
| **Chosen implementation** | The **union** of Sources A, B, C and D is published once, as a single sorted, searchable size table on `/tyres/car-tyres/`, with the truck block on `/tyres/truck-tyres/`. Every quote form references that one table rather than carrying its own divergent copy, eliminating the discrepancy structurally. The table header states: *"Sizes listed are those FlexTyres publishes. Stock is limited and rotates — confirm availability when you request a quote."* No quantity or availability is asserted per size, and no `Offer` or `availability` appears in structured data. |
| **Owner verification required?** | NO (implementation is safe) |
| **Reason** | Publishing the union under an explicit "availability not guaranteed" caveat is the least misleading option: it never tells a buyer a size does not exist when the company's own order sheet lists it, and it never promises stock. |

---

## C-14 — Eight fabricated staff members are published as real FlexTyres people

| | |
|---|---|
| **Claim** | Who works at FlexTyres |
| **Source** | `https://flextyres.com/en/team/` and 8 child pages — `waylon-dalton`, `sophie-lana`, `james-hoult`, `oscar-helman`, each also duplicated with a `-2` suffix |
| **Representation** | Each page carries a person's name as its `<title>` and an `<h1>` reading literally **"Single Blog"**, a stock portrait of a mechanic in blue overalls, and 112 words of identical filler. All eight are indexable and appear in the Yoast sitemap. |
| **Conflicting source** | Every other page. About Us describes "a one man operation" that became "a family business". No named person appears anywhere else on the site except **"Hamid"**, who is thanked by name in four of the six customer testimonials. |
| **Severity** | **CRITICAL** |
| **Risk** | This is unremoved `autoser` theme demo data — the names are the theme's stock personas — published as FlexTyres personnel. It is fabricated information about people, currently indexable and citable by AI answer systems. Migrating it would be creating fake staff; leaving it live degrades E-E-A-T. |
| **Safe to normalise?** | **N/A — this is not a conflict to resolve, it is fabricated content to remove** |
| **Chosen implementation** | **Not migrated.** All nine URLs 301 to `/about/`. No `Person` entity, no team section, no `employee` property and no named staff appear anywhere in the rebuild. "Hamid" is **not** introduced as a staff member: he is named only inside the verbatim testimonial quotes where customers wrote his name, which is what the source publishes. |
| **Owner verification required?** | **YES** |
| **Reason** | If FlexTyres wants real people on the site — which would genuinely strengthen E-E-A-T for a trust-dependent B2B business — the owner must supply real names, roles and photographs. None can be derived from public information. The owner should also delete these pages at source. |

---

## C-15 — Six fabricated services are published as FlexTyres offerings

| | |
|---|---|
| **Claim** | What services FlexTyres provides |
| **Source** | `https://flextyres.com/en/portfolio/` and 6 child pages: `brake-fluid-exchange`, `checking-car-engine`, `electrical-system`, `oil-change`, `tune-ups-system`, `wheel-alignment`, plus 5 supporting taxonomy archives at `/en/categories/{brakes,electrical,engine,fluid,wheel}/` |
| **Representation** | Six indexable service pages, 253–255 words each, near-identical copy, presenting FlexTyres as a consumer auto-repair garage |
| **Conflicting source** | `https://flextyres.com/en/our-services/` — the real service list: **Doubling and Tripling, Transportation, Export Used Tires, Loading by Press** |
| **Severity** | **CRITICAL** |
| **Risk** | More theme demo data. FlexTyres is a used-tyre export wholesaler with a minimum order of 180–2,800 tyres; it does not change oil or align wheels. Eleven indexable URLs describe a business that does not exist, cannibalising the real Services page and poisoning entity understanding for both search engines and AI retrieval. |
| **Safe to normalise?** | **N/A — fabricated content, removed** |
| **Chosen implementation** | **Not migrated.** All 12 URLs 301 to `/services/`. The rebuild publishes only the four documented services, plus **Tyre Recycling** and the **Franchise Programme**, each of which has its own genuine source page. |
| **Owner verification required?** | NO |
| **Reason** | Unambiguous. No public source suggests FlexTyres performs vehicle servicing, and the pages are traceable to the `autoser` theme demo. The owner should delete them at source. |

---

## C-16 — An undated "limited time" promotional discount

| | |
|---|---|
| **Claim** | "GET 10% OFF TODAY — Limited Time Offer for All New Clients" |
| **Source** | `https://flextyres.com/en/sprinter-delivery-180-tires/` |
| **Severity** | MEDIUM |
| **Risk** | No start date, no end date, no terms. The page has been live long enough to be dropped from internal linking entirely (it is an orphan). A permanent "today only" discount is a dark pattern, and publishing it as an `Offer` with a discount would be inaccurate structured data. |
| **Safe to normalise?** | **PARTIAL** |
| **Chosen implementation** | The false urgency is removed. The page states what the source states without the countdown framing: *"FlexTyres publishes a 10% new-client discount on this delivery option. Confirm current terms when you request a quote."* No `Offer`, no `priceValidUntil`, no `discount` appears in structured data. |
| **Owner verification required?** | **YES** |
| **Reason** | If the discount is live and dated it can be published properly with real validity dates and marked up correctly. If it has expired it must be removed. |

---

## C-17 — "The number-one used tire company"

| | |
|---|---|
| **Claim** | "As the number-one used tire company, we fulfill all of your tire needs" |
| **Source** | `https://flextyres.com/en/sprinter-delivery-180-tires/` |
| **Related claims** | "our quality is unsurpassed" and "we provide the absolute best value" (homepage); "Why do we consider ourselves to be the best WHOLESALER OF USED TYRES?" (homepage) |
| **Severity** | MEDIUM |
| **Risk** | An unqualified market-leadership superlative with no supporting evidence, ranking, award or citation anywhere on the site. Comparative advertising claims of this kind are regulated in the EU. |
| **Safe to normalise?** | **YES** |
| **Chosen implementation** | Unsupported superlatives are not migrated. The homepage's own self-aware phrasing — "*Why do we **consider ourselves** to be the best…*" — is retained because it is transparently framed as opinion, and the sentence it introduces is the site's genuine and defensible value statement: *"We know that honesty and transparency, coupled with reliable and friendly customer service, is what really builds customer trust."* The bare assertion "the number-one used tire company" is dropped. |
| **Owner verification required?** | NO (safe) |
| **Reason** | The instruction not to strengthen claims applies equally to preserving claims that were never supported. Dropping an unevidenced superlative loses nothing a buyer can act on. |

---

## C-18 — Three privacy policies with two different texts

| | |
|---|---|
| **Claim** | The privacy policy in force |
| **Source A** | `https://flextyres.com/en/wpautoterms/privacy-policy/` — 774 words (live install) |
| **Source B** | `https://flextyres.com/wpautoterms/privacy-policy/` — 691 words (legacy install) |
| **Source C** | `https://flextyres.com/privacy-policy/` — **1,050 words**, a different Divi-era document, **sharing an identical `<title>` with Source B** |
| **Severity** | HIGH |
| **Risk** | Three indexable privacy policies, no effective dates, no indication which governs. For a business processing EU personal data through contact and quote forms, this is a compliance exposure, not merely an SEO defect. |
| **Safe to normalise?** | **NO — legal content must not be selected by an engineer** |
| **Chosen implementation** | The rebuild publishes **one** privacy policy at `/legal/privacy-policy/`, carrying the **current install's** text (Source A) verbatim, unedited. Sources B and C 301 to it. A visible note states: *"This policy is reproduced from the version published by FlexTyres. It is under review."* The form pages link to it. |
| **Owner verification required?** | **YES — BLOCKING for legal sign-off** |
| **Reason** | Selecting between three legal documents is the owner's decision, not the engineer's. The rebuild preserves the current-install version and changes not a word of it, but the owner must confirm which policy governs and have it dated and reviewed. |

---

## C-19 — The Purchasing Terms PDF contains unfilled template placeholders

| | |
|---|---|
| **Claim** | The purchasing terms binding a buyer |
| **Source** | `https://flextyres.com/en/Terms & Conditions.pdf` — "Last updated: October 1, 2012" |
| **Defect 1** | *"we will try to provide at least 30 **(change this)** days' notice prior to any new terms taking effect"* — an unedited template instruction, published in a live legal document |
| **Defect 2** | *"Parties agree to settle disputes under this agreement through (select one) — Negotiation  Mediation  Arbitration  Litigation"* — **nothing is selected**; the dispute-resolution mechanism is undefined |
| **Defect 3** | *"interest from the date of the invoice at a rate of 3% percent **per day**"* — 3 % per day compounds to over 1,000 % annually; almost certainly intended as per month, and unenforceable as written in most EU jurisdictions |
| **Defect 4** | The document is dated 2012 but the site it governs has been rebuilt at least twice since |
| **Defect 5** | **The only link to this document 404s on every page of the site** (unencoded `&` in the href) |
| **Severity** | HIGH |
| **Risk** | Buyers are directed to terms they cannot open; if they could, they would find an undefined dispute mechanism, a template placeholder and a punitive interest rate. |
| **Safe to normalise?** | **NO — the engineer must not edit a legal document** |
| **Chosen implementation** | The PDF is mirrored **byte-for-byte, unaltered**, at `/documents/flextyres-purchasing-terms.pdf`, and the broken link is fixed so it is reachable from the header, the footer and every quote page. A `/legal/purchasing-terms/` HTML landing page summarises only the **unambiguous, uncontested** commercial terms — net-30 payment, three-day inspection window, 10 % restocking fee, refunds up to 50 tyres, title passing at destination port, Belgian governing law, CISG applies — links to the authoritative PDF, and states its 2012 date plainly. **Defects 1, 2 and 3 are neither reproduced nor paraphrased in site copy.** |
| **Owner verification required?** | **YES — BLOCKING for legal sign-off** |
| **Reason** | Three substantive defects in a live commercial contract require legal review and reissue. The rebuild fixes the delivery problem — the 404 — but cannot and must not fix the document. |

---

## C-20 — Two different phone-number formats for the same line

| | |
|---|---|
| **Claim** | The contact telephone number |
| **Representation A** | `+32 489-331-332` — header, footer, contact page, homepage title tag (live install) |
| **Representation B** | `+32 (0) 489 33 13 32` — `/en/thank-you/` and the entire legacy install |
| **Representation C** | `+32 489 33 1332` — the header of the EUSIZESFLEX PDF |
| **Severity** | LOW |
| **Risk** | Same E.164 number (`+32489331332`, confirmed by the `tel:` and WhatsApp hrefs), three presentations. Inconsistent NAP data weakens local entity matching. |
| **Safe to normalise?** | **YES** |
| **Chosen implementation** | One canonical presentation site-wide — **+32 489 33 13 32** — with `tel:+32489331332` and `https://wa.me/32489331332` as the machine-readable forms, and `+32489331332` in `ContactPoint.telephone`. |
| **Owner verification required?** | NO |
| **Reason** | All three strings resolve to the same number; only the formatting differs. |

---

## C-21 — Review-gating funnel pages

| | |
|---|---|
| **Claim** | — |
| **Source** | `/en/good-reviews/`, `/en/bad-reviews/`, `/en/neutral-reviews/` |
| **Representation** | Three orphaned but indexable pages that sort reviewers by sentiment. The "good" page asks the reviewer to *"post the same review"* on public platforms; the "bad" page redirects the reviewer to a private contact form instead. |
| **Severity** | MEDIUM |
| **Risk** | This is review gating — soliciting public posting from satisfied customers while diverting dissatisfied ones to a private channel. It is prohibited by Google's review policies and would undermine the credibility of any `Review` markup published elsewhere on the site. |
| **Safe to normalise?** | **N/A — removed** |
| **Chosen implementation** | Not migrated. `/en/good-reviews/` 301s to `/about/`; the other two 301 to `/contact/`. The rebuild provides one feedback path for all customers, regardless of sentiment. |
| **Owner verification required?** | NO |
| **Reason** | Migrating a policy-violating funnel into a new site would import a known liability. The owner should be told these pages exist. |

---

## C-22 — Testimonials: real, but with no verifiable aggregate

| | |
|---|---|
| **Claim** | Six named customer testimonials with dates, published on the homepage |
| **Source** | `https://flextyres.com/en/` — server-rendered, not JavaScript-injected |
| **Representation** | Felix Uk (2019-02-20) · Joycelyn Rankin (2019-10-25) · Felix Branden (2021-09-08) · Kaci Spellman (2019-11-08) · Tiro Malope (2022-05-31) · Jason Huang (2021-10-05). Sourced from a Google Places review widget; a Google Business Profile exists (`maps.google.com/?cid=15292892446084407348`). |
| **Conflict** | The "See All Reviews" link is `https://search.google.com/local/reviews?placeid=` — **the place ID is empty**, so no reviewer can reach the source. No star rating, no review count and no aggregate score appears anywhere in the HTML. |
| **Severity** | MEDIUM |
| **Risk** | The testimonials themselves are legitimate public content. But with no reachable source and no published aggregate, any `AggregateRating` would be fabricated, and `Review` markup for reviews hosted on a third-party platform is outside Google's supported use for self-serving reviews. |
| **Safe to normalise?** | **PARTIAL** |
| **Chosen implementation** | All six testimonials are migrated **verbatim**, with their published names and dates, attributed as Google reviews. **No `Review` schema, no `AggregateRating`, no star rating and no review count are emitted** — none is supported by the source. Avatars are **not** hotlinked from `googleusercontent.com`; initials are rendered instead. The broken "See All Reviews" link is replaced with a working link to the Google Business Profile via the published CID. |
| **Owner verification required?** | **YES** |
| **Reason** | If FlexTyres supplies the Google Place ID, the reviews page can link directly to the live profile. Aggregate rating markup would still be inappropriate for third-party-hosted reviews. |

---

## C-23 — Facebook and LinkedIn presence cannot be verified from the site

| | |
|---|---|
| **Claim** | Social profiles |
| **Representation** | Facebook `https://www.facebook.com/flextyresco/` (specific, plausible); YouTube channel `UC-LghFtD0Q0jSahdEPo5JLw` (specific, verified — two videos are embedded on-site); LinkedIn **`https://www.linkedin.com/`** — the site root |
| **Severity** | LOW |
| **Risk** | A LinkedIn icon linking to LinkedIn's homepage implies a company page that the site does not identify. Putting it in `Organization.sameAs` would assert an entity relationship that does not exist. |
| **Safe to normalise?** | **YES** |
| **Chosen implementation** | Facebook and YouTube are published and included in `sameAs`. The LinkedIn link is **removed** — a social icon that goes nowhere useful is worse than no icon. |
| **Owner verification required?** | **YES** |
| **Reason** | If a LinkedIn company page exists, supplying the URL restores the link and adds a `sameAs` entry. |

---

## C-24 — Third-party brand logos displayed without a stated relationship

| | |
|---|---|
| **Claim** | Brand association |
| **Source A** | Homepage — logo strip: **Michelin, Pirelli, Dunlop, Continental, Bridgestone** |
| **Source B** | `/en/sprinter-delivery-180-tires/` — "Choose the tires you want from the best brands such as **Goodyear, Pirelli, Dunlop and Michelin**" |
| **Source C** | Quality grade tables — "**All brands**" |
| **Conflict** | Two different brand sets, and the logo strip carries no caption explaining the relationship. Continental and Bridgestone appear only as logos; Goodyear appears only as text. |
| **Severity** | MEDIUM |
| **Risk** | An uncaptioned manufacturer logo strip reads as an endorsement, partnership or authorised-dealer relationship. Nothing on the site claims any such relationship, and asserting one would be fabricating a partnership. |
| **Safe to normalise?** | **YES** |
| **Chosen implementation** | Brands are published as **text**, as the union of both lists, under wording that states the actual relationship the source supports: *"Stock includes tyres from all major manufacturers, including Michelin, Pirelli, Dunlop, Continental, Bridgestone and Goodyear. FlexTyres is an independent wholesaler and is not affiliated with these manufacturers."* Manufacturer logo images are **not** reproduced, and no `Brand` schema is emitted. |
| **Owner verification required?** | **YES** |
| **Reason** | Reinstating the logo strip is a trademark-usage decision for the owner. A named brand list is factually equivalent, accessible, faster (the source's Michelin logo alone is a 4000×1000 PNG at 478 KB), and carries no implied endorsement. |

---

## Owner decision register

Every item below **blocks nothing** in the build — each has a documented, least-misleading
implementation in place — but each represents a claim the owner alone can resolve.

| ID | Decision needed | Priority |
|---|---|---|
| C-01 | Confirm authoritative car tread-depth ranges and grade letters | **P1** |
| C-02 | Confirm the Belgium office address (and whether "Map box 16" should read "box 16") | **P1** |
| C-05 | Confirm whether a 1,000-piece order is still accepted, or whether container/van minimums are the only routes | **P1** |
| C-14 | Supply real staff details, or confirm the site carries no team section | **P1** |
| C-18 | Confirm which privacy policy governs; have it dated and legally reviewed | **P1 — legal** |
| C-19 | Reissue the Purchasing Terms PDF: fill the "(change this)" placeholder, select a dispute-resolution mechanism, confirm the 3 %/day interest rate | **P1 — legal** |
| C-04 | Confirm whether the Hollywood, Florida warehouse is operational | **P2** |
| C-09 | Confirm whether sales are restricted to wholesalers, retailers, or both | **P2** |
| C-12 | Confirm current truck grading criteria and export restrictions | **P2** |
| C-16 | Confirm whether the 10 % new-client discount is live, and supply validity dates | **P2** |
| C-08 | Date the "79,359 tyres exported" and "325 customers" figures, or retire them | **P3** |
| C-22 | Supply the Google Place ID | **P3** |
| C-23 | Supply the LinkedIn company page URL, if one exists | **P3** |
| C-24 | Decide whether manufacturer logos may be displayed | **P3** |
| C-07 | Confirm the founding year so `foundingDate` can be published | **P3** |

## Source-side defects the owner should fix on the live site

Independent of this rebuild:

1. The legacy root WordPress install is fully indexable and contradicts the live site — take it down.
2. Nine fabricated staff pages and twelve fabricated service pages are indexable — delete them.
3. `robots.txt` advertises the stale sitemap and omits the live one.
4. The Purchasing Terms link 404s on every page.
5. The three review-gating pages violate Google's review policies.
6. `hello-world/` and its "A WordPress Commenter" comment are indexable.
