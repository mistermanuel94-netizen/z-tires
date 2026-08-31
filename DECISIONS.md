# DECISIONS.md

Engineering decisions that a future maintainer would otherwise have to reverse-engineer or would
reasonably want to challenge. Content and factual decisions live in
[`CONTENT_TRUST_CONFLICTS.md`](CONTENT_TRUST_CONFLICTS.md).

---

## D-01 — Astro, static output, no adapter

**Decision:** Astro 7.2.9, `output: 'static'`, no SSR adapter, no UI framework.

**Why:** every page is content the business publishes once. There is no per-request data, no
personalisation, no authentication and no cart. Static output removes the entire server attack
surface, makes the site trivially cacheable, and is what allows 0 render-blocking requests.

**Rejected:** SSR (nothing needs it); React/Vue/Svelte islands (nothing on the site is stateful
beyond a menu toggle — adding a framework runtime would cost more than the feature).

---

## D-02 — The apex serves the homepage; `/en/` is retired

**Decision:** `https://flextyres.com/` serves the homepage directly. All 30+ `/en/*` URLs 301 to
root-level equivalents.

**Why:** there is one language. A language prefix with no siblings is pure overhead: it costs the
most-linked URL on the site an extra redirect hop and splits the entity across two path spaces.
The live site's `/` → `/en/` redirect is on the critical path of every visit that starts at the
apex — which is most of them.

**Cost:** every ranking URL moves. Mitigated by 75 single-hop 301s and preserved slugs. Expect 4–8
weeks of re-indexing.

---

## D-03 — British "tyres" in new paths, US "tires" preserved in redirects

**Decision:** new URLs use `tyres`; every legacy `tires` URL 301s.

**Why:** the brand is FlexTyres, the company is Belgian, and the legacy install used "tyres"
throughout. The `/en/` install mixed both (`tire-recycling` but `tyres-for-cars`). One spelling in
paths; content uses "tyres" except inside verbatim quotations, where the source's own spelling is
preserved.

---

## D-04 — 410 for fabricated content, 301 for content with a real successor

**Decision:** WordPress defaults (`hello-world`, category/date/author archives, RSS feeds) return
**410 Gone**. Theme demo staff and service pages **301** to `/about/` and `/services/`.

**Why:** a 301 asserts "this became that". For the default post and its archives, nothing became
anything — 410 is accurate and de-indexes faster. For the fabricated staff and portfolio pages, a
real page covering that topic *area* exists, so a 301 is defensible even though the specific
content was fiction.

---

## D-05 — CSS inlined, not externalised

**Decision:** `inlineStylesheets: 'always'` — 26.8 KB of CSS inlined into every page.

**Why:** it removes the last render-blocking request. Brotli-compressed, the whole page is ~12 KB;
the CSS portion is roughly 6 KB on the wire. On a slow mobile connection, one round trip costs more
than 6 KB of duplication.

**Trade-off:** no cross-page CSS caching. Worth revisiting if analytics ever show high
pages-per-session. Recorded in `PERFORMANCE_AUDIT.md` §7.

---

## D-06 — 461 bytes of JavaScript, and a rule for adding more

**Decision:** the only client-side script is the mobile drawer toggle. Every other interactive
pattern uses native HTML or CSS.

**The rule for any future addition:** can HTML do it? Can CSS do it? Can Astro do it at build time?
If yes to any, the dependency does not ship. The budget check fails the build above 5 KB per page.

**What this replaced:** jQuery, Bootstrap, Slider Revolution, Owl Carousel, FlexSlider, Vegas,
Typed.js, cubePortfolio, Magnific Popup, equalize.js — 2,404 KB.

---

## D-07 — Single English site, no `hreflang`

**Decision:** one language, `lang="en"`, no `hreflang`, no language directories.

**Why:** the live site's five-flag switcher is the GTranslate plugin doing **client-side Google
machine translation**. Probing all 12 plausible locales found `/es/` → 403, `/fr/` → 301 to an
unrelated English page, everything else 404. There is no translated content to migrate. Creating
language directories would mean fabricating translations, which the source-of-truth policy forbids.

**If FlexTyres later commissions real translations:** add locale directories, `hreflang` including
`x-default`, and translate `src/data/site.ts` strings. The architecture supports it; the content
does not exist today.

---

## D-08 — `Organization`, not `LocalBusiness`

**Decision:** the organisation is modelled as `Organization` with `Place` nodes for the secondary
warehouses.

**Why:** `LocalBusiness` asserts a place a customer visits to transact. FlexTyres publishes one
street address (an office), two warehouses named only by city, no per-location hours or phone, and
a 180-tyre minimum order. `LocalBusiness` would invite storefront treatment the source does not
support. `Organization` carries every published fact without over-claiming. Detail in
`STRUCTURED_DATA_AUDIT.md` §3.

---

## D-09 — No `Product` or `Offer` markup

**Decision:** none emitted anywhere; `Service` and `ItemList` used instead.

**Why:** used tyres are sold as graded bulk lots by the container, not as identifiable SKUs.
FlexTyres publishes no price, no availability, no GTIN and no per-unit offer — its own answer is
"It depends upon the quantity and quality of the tires", and its order sheet says "STOCK LIMITED".
A `Product` node would be an empty shell, and `availability` or `price` would be invented.

**Revisit when:** C-16 is resolved with real validity dates, at which point an `Offer` on the
Sprinter page becomes appropriate.

---

## D-10 — Forms degrade to `mailto:`, no invented backend

**Decision:** `formEndpoint` is an empty string. Forms post to `mailto:` and say so, with phone,
WhatsApp and email offered alongside.

**Why:** the live backend is Contact Form 7 inside WordPress and cannot be reconstructed from
public information. The alternatives were to invent an endpoint (dishonest, and it would silently
fail) or ship a dead form (worse). A working `mailto:` fallback plus three redundant contact routes
means the commercial path never depends on the form.

**Owner action:** choose an endpoint before launch. Options in `DEPLOYMENT.md`.

---

## D-11 — Published data is not silently corrected

**Decision:** the tyre size list is the **union** of all four published sources, reproduced as
published — including `217/70R15`, which appears in both the official stock sheet and the quote
form and is almost certainly a typo for `215/70R15` (also listed).

**Why:** dropping it would tell a buyer a size does not exist when the company's own order sheet
lists it. Correcting it would be editing the client's published product data on a guess. The size
table carries a visible caveat that sizes are as published and availability requires a quote, which
covers both cases honestly. Same principle applies to `Rusia` → published as written, displayed as
"Russia" with the original spelling shown.

---

## D-12 — CSP allows `style-src 'unsafe-inline'`, but hashes scripts

**Decision:** `script-src` pins the one inline script by SHA-256. `style-src` permits
`'unsafe-inline'`.

**Why:** Astro inlines the stylesheet and emits scoped component styles as `<style>` elements.
Hashing them would work but would invalidate on every content edit, which turns a security control
into a maintenance trap that gets disabled. The residual risk — CSS-based exfiltration — requires
an attacker who is already injecting markup, and the site has no user-generated content, no
comments, no search reflection and no third-party script.

Scripts get no such concession: `'unsafe-inline'` is absent, and any injected script is blocked.

---

## D-13 — Brand green cannot carry white text, so a darker token was added

**Decision:** `--c-accent-solid: #55771f` (green-700) for solid buttons, while `--c-accent`
(`#86b43a`) remains the brand accent for borders, rules and non-text marks.

**Why:** the declared brand green gives white text 2.1:1 and the 600 step 3.32:1 — both fail
WCAG AA. The contrast audit failed the build. Weakening the check was not an option; abandoning the
brand colour was not necessary. The 700 step is the lightest green in the brand ramp that clears
4.5:1 (it measures 5.19:1) and is unmistakably the same colour family.

---

## D-14 — Every business fact lives in one module

**Decision:** `src/data/site.ts` is the single source of truth for phone, email, addresses, hours,
locations, social profiles, documents, brands and company figures. No page hard-codes any of them.

**Why:** the live site publishes **two different Belgian addresses in different cities** and three
different phone formats, because each was typed separately into a page builder. Centralising makes
that class of drift structurally impossible: a page cannot state a different address than another
page, because there is only one address.

The module's header comment states the rule directly: *if a fact is not in this file, no page may
assert it.*

---

## D-15 — Audits are build gates, not reports

**Decision:** SEO, links, accessibility, schema, budget and mobile checks all exit non-zero and
fail `npm run audit`.

**Why:** a report that has to be read is a report that stops being read. Three real defects were
caught this way and would otherwise have shipped:

1. `/how-to-order/` emitted `FAQPage` schema for questions that were **not rendered on the page**.
2. `/contact/` overflowed horizontally by 23px at a 320px viewport.
3. White-on-green buttons failed WCAG AA at 3.32:1.

In each case the fix was to the site, not to the check.

---

## D-16 — 40 gallery images kept despite the deployment size

**Decision:** `/gallery/` carries 40 photographs; the site total is 10.5 MB of image variants.

**Why:** this business asks international buyers to wire money for a shipping container of goods
they cannot inspect. Photographs of the actual warehouse, the actual tripling machines and the
actual container loading are the site's primary trust evidence — they are doing conversion work,
not decoration. Per-page cost is already controlled: 2 responsive variants each, quality 64,
lazy-loaded, ~35 requests on the gallery page and none anywhere else.

---

## D-17 — Manufacturer logos replaced with a text list

**Decision:** the Michelin/Pirelli/Dunlop/Continental/Bridgestone logo strip is not reproduced.
Brands appear as text with an explicit non-affiliation statement.

**Why:** an uncaptioned manufacturer logo strip reads as an endorsement or dealer relationship, and
nothing on the source site claims one. The text list is factually equivalent, accessible, and
faster — the source's Michelin PNG alone is 4000×1000 at 478 KB. Reinstating the logos is a
trademark decision for the owner (C-24).

---

## D-18 — TypeScript at `strictest`, with `exactOptionalPropertyTypes`

**Decision:** `astro/tsconfigs/strictest`. `npm run typecheck` reports 0 errors, 0 warnings,
0 hints across 58 files.

**Why:** the content collections carry the business data. A schema mismatch caught at build time is
a page that never ships wrong. Strict optional-property handling in particular forced explicit
`| undefined` on every optional prop, which surfaced a real inconsistency in how `Location` objects
were typed.

---

## D-19 — Screenshots and responsive QA go through the DevTools Protocol

**Decision:** `scripts/check-mobile.mjs` and `scripts/shoot.mjs` drive Chrome over CDP with
`Emulation.setDeviceMetricsOverride`.

**Why:** Chrome's `--headless --screenshot --window-size` flag does not reliably apply the window
size to the **layout** viewport in new headless mode. It produced mobile captures that looked
badly clipped while the page was in fact laying out correctly — a false positive that would have
sent someone chasing a bug that did not exist. CDP emulation matches what the responsive
measurements report, so images and metrics agree.
