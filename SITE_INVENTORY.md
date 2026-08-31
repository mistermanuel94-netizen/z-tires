# SITE_INVENTORY.md — Complete public URL inventory of flextyres.com

Crawl date: **2026-08-31**
Crawler: custom Node fetch crawler, desktop Chrome UA, manual redirect following, breadth-first
from every sitemap URL plus every internal link discovered.
Raw artefacts: `_research/crawl-results.json`, `_research/extract.json`, `_research/pages/*.html`.

**86 URLs reached. 71 returned HTML 200. 11 redirected. 1 returned 404. 3 were non-HTML assets.**

---

## 1. Discovery sources used

| Source | Result |
|---|---|
| `https://flextyres.com/` | 301 → `/en/` |
| `/robots.txt` | Declares `/sitemap.xml` and `/sitemap.rss` only (legacy install) |
| `/sitemap.xml` (All in One SEO) | 9 sub-sitemaps → 14 legacy pages, 1 post, 2 legal pages, 5 empty taxonomies |
| `/en/sitemap_index.xml` (Yoast) | 5 sub-sitemaps → 23 pages, 3 legal, 7 portfolio, 9 team, 5 categories |
| Header navigation | 2 menus (top bar + main), 12 distinct destinations |
| Footer navigation | "Company Links" block, 12 destinations |
| Internal links from every crawled page | Discovered `/author/flextyres/`, `/2018/12/`, `/feed/`, `/wp-login.php`, `/hello-world/?replytocom=1` |
| Language probes `/es/ /fr/ /nl/ /de/ /it/ /pt/ /ru/ /pl/ /ro/ /tr/ /ar/ /zh/` | Only `/es/` (403) and `/fr/` (301, misrouted) respond; **no real translated sites exist** |
| Linked documents | `/EUSIZESFLEX.xlsx`, `/EUSIZESFLEX.pdf`, `/en/Terms & Conditions.pdf` |

**No meaningful public URL was left undiscovered.** The two sitemap systems plus link-graph
traversal converged on the same set. WordPress REST endpoints were not used as a content source.

---

## 2. Site structure discovered — TWO parallel WordPress installs

| | Legacy install | Live install |
|---|---|---|
| Path | `https://flextyres.com/*` | `https://flextyres.com/en/*` |
| Theme | Divi | `autoser` |
| SEO plugin | All in One SEO | Yoast SEO 24.6 |
| Footer copyright | © 2011-**2021** | © 2011-**2025** |
| Stock claim | "More than 50.000 tyres in stock" | "More than 100,000+ tires in stock" |
| Belgium office | Hoogstraat 28, 2800 Mechelen | Avenue Jules Bordet 160 box 16, 1140 Evere |
| Indexable? | **Yes — no robots meta at all** | Yes |
| Canonical | Self-referential (does **not** point at `/en/`) | Self-referential |
| Referenced by `robots.txt` | Yes (only this one) | No |

Both installs serve near-identical business content at different URLs, both are indexable, and
neither canonicalises to the other. This is the single largest technical-SEO defect on the site.

---

## 3. Full URL inventory

Legend for **Class**: KEEP · IMPROVE · MERGE · REDIRECT · NOINDEX · REMOVE · REPLACE · VERIFY

### 3.1 Live install — genuine business pages

| # | URL | HTTP | Title (truncated) | Desc | Canonical | Robots | H1 | H2/H3 | Words | Imgs | Schema | Page type | Primary intent | Secondary intent | CTA | Parent | Proposed new URL | Class |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `/en/` | 200 | FlexTyres \| Used Tires Wholesale \| Request a FREE Quote Today! +32… (130 ch) | dup ×4 | self | index | **none** | 8 / 12 | 719 | 37 | WebPage, WebSite, Organization, BreadcrumbList | Homepage | Navigational + commercial | Brand | Request a free quote | — | `/` | IMPROVE |
| 2 | `/en/about-us/` | 200 | About Us \| FlexTyres \| Used Tires Wholesale | dup ×4 | self | index | **none** | 4 / 6 | 240 | 21 | WebPage… | Company | Commercial investigation | Trust | Quote | `/en/` | `/about/` | IMPROVE |
| 3 | `/en/our-services/` | 200 | Our Services \| FlexTyres… | **missing** | self | index | **none** | 5 / 8 | 285 | 22 | WebPage, ImageObject… | Service hub | Commercial investigation | Informational | Quote | `/en/` | `/services/` | IMPROVE |
| 4 | `/en/our-stock-new/` | 200 | Our Stock \| FlexTyres… | **missing** | self | index | **none** | 1 / 0 | 121 | 15 | WebPage… | Product hub | Commercial investigation | Transactional | Quote | `/en/` | `/stock/` | REPLACE (thin: 1 heading + 1 video) |
| 5 | `/en/faqs/` | 200 | FAQs \| FlexTyres… | **missing** | self | index | **none** | 7 / 0 | 357 | 24 | WebPage… (**no FAQPage**) | FAQ | Question-based | Commercial | Quote | `/en/` | `/faqs/` | IMPROVE |
| 6 | `/en/franchise-opportunity/` | 200 | Franchise Opportunity \| FlexTyres… | **missing** | self | index | **none** | 3 / 4 | 167 | 18 | WebPage… | Business dev | Commercial investigation | B2B | More info | `/en/about-us/` | `/franchise/` | IMPROVE |
| 7 | `/en/tripling-techniques/` | 200 | Tripling Techniques \| FlexTyres… | **missing** | self | index | **none** | 4 / 6 | 237 | 20 | WebPage… | Service detail | Informational | Commercial | Quote | `/en/our-services/` | `/services/doubling-and-tripling/` | IMPROVE |
| 8 | `/en/tire-recycling/` | 200 | Tire Recycling \| FlexTyres… | **missing** | self | index | **none** | 2 / 0 | 120 | 15 | WebPage… | Product | Commercial investigation | Sustainability | Quote | `/en/` | `/tyre-recycling/` | IMPROVE |
| 9 | `/en/sprinter-delivery-180-tires/` | 200 | Sprinter Delivery 180 Tires \| FlexTyres… (62 ch) | **missing** | self | index | **2 H1s** | 9 / 11 | 559 | 29 | WebPage, ImageObject… | Offer + form | Transactional | Local (BE/FR/NL) | Quote | **orphan** | `/offers/sprinter-van-delivery/` | IMPROVE (richest page on the site, **orphaned**) |
| 10 | `/en/contact-us/` | 200 | Contact Us \| FlexTyres… | dup ×4 | self | index | **none** | 2 / 5 | 175 | 15 | WebPage… (**no ContactPage / LocalBusiness**) | Contact | Navigational | Local | Form / phone / WhatsApp | `/en/` | `/contact/` | IMPROVE |
| 11 | `/en/request-a-free-quote/` | 200 | Request A Free Quote \| FlexTyres… | **missing** | self | index | **none** | 2 / 2 | 135 | 15 | WebPage… | Quote chooser | Transactional | — | Car / truck split | `/en/` | `/request-a-quote/` | IMPROVE |
| 12 | `/en/quote-car-tires/` | 200 | Quote Car Tires \| FlexTyres… | **missing** | self | index | **none** | 3 / 1 | 184 | 18 | WebPage… | Quote form | Transactional | Product-specific | Submit | `/en/request-a-free-quote/` | `/request-a-quote/car-tyres/` | IMPROVE |
| 13 | `/en/quote-truck-tires/` | 200 | Quote Truck Tires \| FlexTyres… | **missing** | self | index | **none** | 3 / 1 | 168 | 18 | WebPage… | Quote form | Transactional | Product-specific | Submit | `/en/request-a-free-quote/` | `/request-a-quote/truck-tyres/` | IMPROVE |
| 14 | `/en/thank-you/` | 200 | Thank You \| FlexTyres… | **missing** | self | **index** | **none** | 1 / 0 | 145 | 15 | WebPage… | Utility | — | — | — | — | `/thank-you/` | **NOINDEX** |
| 15 | `/en/wpautoterms/terms-and-conditions/` | 200 | Terms and Conditions \| FlexTyres… | **missing** | self | index | "Single Blog" (wrong) | 4 / 0 | 688 | 15 | WebPage… | Legal | Navigational | — | — | — | `/legal/terms-and-conditions/` | IMPROVE |
| 16 | `/en/wpautoterms/privacy-policy/` | 200 | Privacy Policy \| FlexTyres… | **missing** | self | index | "Single Blog" (wrong) | 5 / 0 | 774 | 15 | WebPage… | Legal | Navigational | — | — | — | `/legal/privacy-policy/` | IMPROVE |

### 3.2 Live install — pages that must not survive

| # | URL | HTTP | Words | Problem | Class |
|---|---|---|---|---|---|
| 17 | `/en/bot/` | 200 | 95 | Empty page, title "Bot", indexable, **orphan** | REMOVE → 301 `/` |
| 18 | `/en/cart/` | 200 | 96 | WooCommerce shell, no products, indexable, orphan | REMOVE → 301 `/request-a-quote/` |
| 19 | `/en/checkout/` | 200 | 96 | WooCommerce shell, indexable, orphan | REMOVE → 301 `/request-a-quote/` |
| 20 | `/en/my-account/` | 200 | 98 | WooCommerce shell, **in main nav**, indexable | REMOVE → 301 `/contact/` |
| 21 | `/en/shop/` | 200 | 95 | WooCommerce shell, duplicate title with #22 | REMOVE → 301 `/stock/` |
| 22 | `/en/shop-3/` | 200 | 95 | Duplicate of #21, orphan | REMOVE → 301 `/stock/` |
| 23 | `/en/good-reviews/` | 200 | 159 | Review-gating funnel page, orphan, indexable | REMOVE → 301 `/about/` |
| 24 | `/en/bad-reviews/` | 200 | 152 | Review-gating funnel page, orphan, indexable | REMOVE → 301 `/contact/` |
| 25 | `/en/neutral-reviews/` | 200 | 134 | Review-gating funnel page, orphan, indexable | REMOVE → 301 `/contact/` |
| 26–31 | `/en/portfolio/{brake-fluid-exchange, checking-car-engine, electrical-system, oil-change, tune-ups-system, wheel-alignment}/` | 200 | 253–255 each | **Theme demo content.** Auto-repair services FlexTyres does not offer. Near-identical copy across all six. Indexable. | REMOVE → 301 `/services/` |
| 32 | `/en/portfolio/` | 200 | 160 | Archive of the above | REMOVE → 301 `/services/` |
| 33–40 | `/en/team/{waylon-dalton, sophie-lana, james-hoult, oscar-helman}{,-2}/` | 200 | 112 each | **Theme demo content — eight fabricated staff profiles**, each duplicated. All H1 reads "Single Blog". Indexable. | REMOVE → 301 `/about/` |
| 41 | `/en/team/` | 200 | 176 | Archive of the fabricated staff | REMOVE → 301 `/about/` |
| 42–46 | `/en/categories/{brakes, electrical, engine, fluid, wheel}/` | 200 | 119–131 | Empty taxonomy archives for the demo portfolio | REMOVE → 301 `/services/` |
| 47 | `/en/wpautoterms/` | 200 | 231 | Plugin archive page, no independent value | NOINDEX → 301 `/legal/` |

### 3.3 Legacy root install — every page is a duplicate or a dead end

| # | URL | HTTP | Words | Duplicate of | Unique content worth rescuing | Class |
|---|---|---|---|---|---|---|
| 48 | `/` | 301 | — | → `/en/` | — | KEEP redirect |
| 49 | `/home/` | 200 | 289 | `/en/` | "50.000 tyres" (stale) | REDIRECT → `/` |
| 50 | `/about-us/` | 200 | 183 | `/en/about-us/` | **Export destination list** (Senegal, Ghana, Congo-Kinshasa, South-Africa, Belgium, France, Portugal, Spain, Morocco, Florida, California, Russia) | MERGE → `/about/` |
| 51 | `/tyres-for-cars/` | 200 | 223 | `/en/tripling-techniques/` + car grades | — | MERGE → `/tyres/car-tyres/` |
| 52 | `/tyres-for-trucks/` | 200 | 173 | — | **Truck-specific quality grades** (retread / damage / export rules) — exists nowhere on the live install | MERGE → `/tyres/truck-tyres/` |
| 53 | `/recycling/` | 200 | 92 | `/en/tire-recycling/` | — | REDIRECT → `/tyre-recycling/` |
| 54 | `/our-stock/` | 200 | 18 | `/en/our-stock-new/` | 45 warehouse photos (gallery) | MERGE → `/gallery/` |
| 55 | `/image-gallery/` | 200 | 87 | — | 12 warehouse photos, **orphan** | MERGE → `/gallery/` |
| 56 | `/frequently-asked-questions/` | 200 | 329 | `/en/faqs/` (identical Q&A, "tyres" spelling) | — | REDIRECT → `/faqs/` |
| 57 | `/request-a-quote/` | 200 | 458 | `/en/quote-car-tires/` | **13-inch and additional 14"/15"/16" sizes** absent from the live form | MERGE → `/request-a-quote/car-tyres/` |
| 58 | `/contact-us/` | 200 | 152 | `/en/contact-us/` | **Conflicting Belgium address** (Mechelen) | REDIRECT → `/contact/` + VERIFY |
| 59 | `/special-offers/` | 200 | 72 | — | **Empty page** — no offers, no H1 | REMOVE → 301 `/offers/` |
| 60 | `/thank-you/` | 200 | 63 | `/en/thank-you/` | — | REDIRECT → `/thank-you/` (noindex) |
| 61 | `/privacy-policy/` | 200 | 1050 | `/wpautoterms/privacy-policy/` — **same title** | Longer Divi-era text | REDIRECT → `/legal/privacy-policy/` + VERIFY |
| 62 | `/wpautoterms/privacy-policy/` | 200 | 691 | `/en/wpautoterms/privacy-policy/` | — | REDIRECT → `/legal/privacy-policy/` |
| 63 | `/wpautoterms/terms-and-conditions/` | 200 | 603 | `/en/wpautoterms/terms-and-conditions/` | — | REDIRECT → `/legal/terms-and-conditions/` |
| 64 | `/wpautoterms/` | 200 | 124 | `/en/wpautoterms/` | — | REDIRECT → `/legal/` |
| 65 | `/hello-world/` | 200 | 134 | — | WordPress default post + "A WordPress Commenter" comment | REMOVE → 410 |
| 66 | `/hello-world/?replytocom=1` | 200 | 138 | #65 | — | REMOVE |
| 67 | `/category/uncategorized/` | 200 | 68 | — | Archive of #65 only | REMOVE → 410 |
| 68 | `/author/flextyres/` | 200 | 68 | #67 | Already `noindex` | REMOVE → 410 |
| 69 | `/2018/12/` | 200 | 68 | #67 | **Indexable** date archive | REMOVE → 410 |

### 3.4 Redirects already present on the live site

| # | URL | Status | Target | Assessment |
|---|---|---|---|---|
| 70 | `/` | 301 | `/en/` | Homepage is one hop from the apex — costs crawl budget and confuses canonicalisation |
| 71 | `/en` | 301 | `/en/` | Trailing-slash normalisation, correct |
| 72 | `/en/our-stock/` | 301 | `/en/our-stock-new/` | **Linked from the footer** → every page ships a redirecting internal link |
| 73 | `/image-gallery` | 301 | `/image-gallery/` | Correct |
| 74 | `/request-a-quote` | 301 | `/request-a-quote/` | Correct |
| 75 | `/en/author/flextyres/` | 301 | `/en` | **Redirect chain**: `/en/author/flextyres/` → `/en` → `/en/` |
| 76–79 | `/layout_category/sections/`, `/layout_type/section/`, `/layout_type/row/`, `/module_width/regular/` | 301 | `/` | Divi Library taxonomies leaked into the public sitemap; each then chains `/` → `/en/` |
| 80–81 | `/scope/global/`, `/scope/not_global/` | 301 | `/` | Same — chains to `/en/` |

### 3.5 Non-HTML public assets

| # | URL | Type | Size | Role | Class |
|---|---|---|---|---|---|
| 82 | `/EUSIZESFLEX.xlsx` | XLSX | 108 KB | Complete car + truck size order sheet, last modified 2021-08-29 | KEEP (mirror) |
| 83 | `/EUSIZESFLEX.pdf` | PDF | 613 KB | Same sheet, print form | KEEP (mirror) |
| 84 | `/en/Terms & Conditions.pdf` | PDF | 170 KB | Purchasing terms, "Last updated: October 1, 2012" | KEEP (mirror, rename — see below) |
| 85 | `/feed/`, `/comments/feed/` | RSS | — | Legacy WordPress feeds carrying only `hello-world` | REMOVE |
| 86 | `/wp-login.php` | HTML | — | WordPress login | Disappears with the platform |

---

## 4. Defects found

### 4.1 Broken links and 404s

| Defect | Location | Detail |
|---|---|---|
| **404 in the primary navigation** | Header submenu *and* footer, on **every page of the live site** | "Purchasing Terms & Conditions" → `https://flextyres.com/en/Terms & Conditions.pdf`. The unencoded `&` truncates the href at `/en/Terms%20&`, producing a hard 404. The PDF itself exists and is reachable, but no visitor can get to it by clicking. |
| **Dead `#` link** | Footer "Company Links", every page | "Our Offers" → `#` |
| **Generic external link** | Header social icons, every page | LinkedIn → `https://www.linkedin.com/` (site root, not a company page) |
| **Broken review link** | Homepage "See All Reviews" | `https://search.google.com/local/reviews?placeid=` — the `placeid` parameter is empty |
| **Redirecting internal link** | Footer "Our Stock", every page | → `/en/our-stock/` → 301 → `/en/our-stock-new/` |
| **Cross-domain hotlink** | Header WhatsApp button, every page | Image served from `https://usedtiresquote.com/wp-content/uploads/2023/07/WA-300x104.png` — an unrelated third-party domain |

### 4.2 Metadata defects

- **51 of 71** HTML-200 pages have **no meta description at all**.
- One meta description is shared verbatim by **four** URLs: `/`, `/en/`, `/en/about-us/`, `/en/contact-us/`.
- The homepage title is **130 characters** — the tail ("Wholesale Used Tires by Container | Used Car Tires") is dead weight and includes a phone number.
- Duplicate titles: `/en/shop/` = `/en/shop-3/`; four pairs of team pages; `/privacy-policy/` = `/wpautoterms/privacy-policy/`.
- `hello-world/` still carries the description *"Welcome to WordPress. This is your first post. Edit or delete it, then start writing!"* — indexable.

### 4.3 Heading defects

- **20 pages have no `<h1>` at all**, including the homepage, About, Contact, Services, Stock, FAQs, both quote forms and Franchise.
- `/en/sprinter-delivery-180-tires/` has **two** `<h1>` elements.
- Every `/en/team/*` and `/en/wpautoterms/*` page has the literal H1 **"Single Blog"**.
- Headings across the theme are used for visual sizing, not document structure.

### 4.4 Indexability and canonical defects

- Legacy root pages emit **no robots meta at all** and canonicalise to themselves — the duplicate site is fully indexable.
- `robots.txt` advertises only the **stale** sitemap; the live Yoast sitemap is undeclared.
- `/en/thank-you/` (form confirmation) is `index, follow`.
- WooCommerce `cart`, `checkout`, `my-account` are `index, follow`.
- The legacy sitemap lists Divi Library taxonomy URLs that all 301 to `/`, which then 301s to `/en/` — every one is a two-hop chain fed straight to crawlers.

### 4.5 Content cannibalisation

| Competing set | Intent collision |
|---|---|
| `/en/faqs/` vs `/frequently-asked-questions/` | Identical Q&A, both indexable |
| `/en/about-us/` vs `/about-us/` | Same company story, both indexable |
| `/en/our-stock-new/` vs `/our-stock/` vs `/image-gallery/` | Three pages, one purpose (show the stock), all thin |
| `/en/tire-recycling/` vs `/recycling/` | Identical copy |
| `/en/tripling-techniques/` vs `/tyres-for-cars/` | Both own "tripling" plus car quality grades |
| `/en/our-services/` vs `/en/portfolio/*` | Real services vs fabricated services |
| `/privacy-policy/` vs `/wpautoterms/privacy-policy/` vs `/en/wpautoterms/privacy-policy/` | Three privacy policies, two different texts |
| `/en/request-a-free-quote/` vs `/request-a-quote/` vs `/en/quote-car-tires/` | Three entry points to one action |

### 4.6 Orphan pages (reachable, indexable, linked from nothing)

`/en/sprinter-delivery-180-tires/` · `/en/bot/` · `/en/cart/` · `/en/checkout/` · `/en/shop-3/` ·
`/en/good-reviews/` · `/en/bad-reviews/` · `/en/neutral-reviews/` · `/en/categories/fluid/` ·
`/en/categories/wheel/` · `/en/thank-you/` · `/home/` · `/image-gallery/` · `/privacy-policy/` ·
`/special-offers/` · `/thank-you/` · `/wpautoterms/`

The most commercially valuable page on the entire site — the Sprinter van delivery offer, 559 words
with a complete order form — is an orphan.

### 4.7 Thin pages (under 150 words of unique body copy)

`/our-stock/` (18) · `/thank-you/` (63) · `/special-offers/` (72) · `/image-gallery/` (87) ·
`/recycling/` (92) · `/en/bot/` (95) · `/en/our-stock-new/` (121) · `/en/tire-recycling/` (120) ·
plus all 5 WooCommerce shells and all 5 empty category archives.

### 4.8 Image defects

- **148 unique images** across the site. The overwhelming majority carry `alt=""` — including
  every warehouse photograph, every brand logo and every gallery image.
- Six header/footer images carry a **missing** `alt` attribute entirely.
- Portrait warehouse photos are served at **900×1600** and **777×1600** into small containers.
- Two 1024×683 gallery images are reused across 6 pages.
- Google reviewer avatars are hotlinked from `lh3.googleusercontent.com`.
- Filenames are non-descriptive: `WhatsApp-Image-2020-10-04-at-10.43.59-PM-copy-1.jpg`,
  `index7-1-400x284.jpg`, `work-5-640x640-2.jpg`.
- Theme stock imagery (`member-*`, `work-*`, `technicial-3.png`, `service*.jpg`, `gallery-*-full-*`)
  is mixed indistinguishably with genuine FlexTyres photography.

### 4.9 Structured data defects

Every page emits the same Yoast graph: `WebPage` + `WebSite` + `Organization` + `BreadcrumbList`.

- `Organization` carries no address, no telephone, no email, no opening hours, no `contactPoint`,
  no `areaServed` — despite all of that being visible on the page.
- The FAQ page emits **no `FAQPage`**.
- The contact page emits **no `ContactPage`**, no `PostalAddress`, no `LocalBusiness`.
- The six published testimonials emit **no `Review`** markup.
- Product/offer pages emit no `Product`, `Offer` or `ItemList`.
- `ImageObject` nodes point at theme demo imagery on the portfolio and team pages.

---

## 5. Language / internationalisation finding

The site presents a five-flag language switcher (English, Spanish, Dutch, French, German). It is the
**GTranslate plugin running client-side Google machine translation**. There are:

- no translated URLs (`/es/` → 403, `/fr/` → 301 to an unrelated English page, all others 404),
- no `hreflang` annotations anywhere,
- no translated content in any HTML response.

**Consequence for the rebuild:** there is no translated content to migrate. Creating language
directories would mean fabricating translations. The rebuild ships a single English site with
correct `lang="en"`, and no `hreflang`. Documented as a deliberate decision in `DECISIONS.md`.

---

## 6. Classification summary

| Class | Count | URLs |
|---|---|---|
| KEEP (as-is path, content improved) | 3 | `/EUSIZESFLEX.xlsx`, `/EUSIZESFLEX.pdf`, Terms PDF |
| IMPROVE | 16 | All genuine live business pages |
| MERGE | 6 | `/about-us/`, `/tyres-for-cars/`, `/tyres-for-trucks/`, `/our-stock/`, `/image-gallery/`, `/request-a-quote/` |
| REDIRECT | 12 | Remaining legacy duplicates + existing redirects |
| NOINDEX | 2 | `/en/thank-you/`, `/legal/` index |
| REMOVE | 36 | Theme demo (21), WooCommerce (5), review funnels (3), WP defaults (4), empty pages (3) |
| REPLACE | 1 | `/en/our-stock-new/` |
| VERIFY (owner) | 3 | Belgium address, business hours, tread-depth grades |

---

## 7. Phase 1 audit gate

| Check | Result |
|---|---|
| Every sitemap URL fetched | PASS — 77 seeds, all resolved |
| Link-graph traversal to exhaustion | PASS — 9 additional URLs discovered beyond the sitemaps |
| Language variants probed | PASS — 12 locales tested, none exist |
| Public documents located and downloaded | PASS — 3 documents |
| Status, canonical, robots, headings, word count, images, schema recorded per URL | PASS |
| Orphans, duplicates, thin pages, cannibalisation, chains, broken links identified | PASS |
| Undiscovered meaningful URLs | **None.** Only `wp-admin`, `wp-json` and `wp-login` internals remain, which are platform artefacts that disappear with the migration. |
