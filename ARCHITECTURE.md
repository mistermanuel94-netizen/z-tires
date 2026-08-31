# ARCHITECTURE.md

How the FlexTyres site is put together and where to change things.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Astro 7.2.9, `output: 'static'` |
| Language | TypeScript, `astro/tsconfigs/strictest` |
| Styling | Hand-written CSS with custom properties. No framework, no preprocessor |
| Content | Astro content collections with Zod schemas |
| Images | Astro's built-in Sharp pipeline (AVIF/WebP/JPEG, responsive `srcset`) |
| Client JS | 461 bytes — one mobile drawer toggle |
| Package manager | npm |
| Node | ≥ 22.12 (developed on 24.16) |

## Directory layout

```
src/
  assets/images/          64 curated photographs, processed by Astro at build
  components/
    seo/SEOHead.astro     metadata, OG/Twitter, JSON-LD injection, font preloads
    layout/               Header, Footer, Breadcrumbs
    blocks/               PageHeader, AnswerBlock, CTABand, GradeTable, SizeTable,
                          QuoteForm, FAQList, Testimonials, RelatedLinks
  content/
    services/*.md         4 service pages (Markdown prose)
    offers/*.md           1 offer page
    faqs/faqs.json        10 Q&A records
    markets/markets.json  12 export destinations
    testimonials/*.json   6 verbatim customer reviews
  content.config.ts       Zod schemas for all five collections
  data/
    site.ts               SINGLE SOURCE OF TRUTH for every business fact
    tyres.ts              grades, order routes, caveats, recycling products
    sizes.ts              348 car sizes + 16 truck sizes (generated from source data)
    nav.ts                main, footer and legal navigation
    redirects.ts          82 redirect rules
  layouts/BaseLayout.astro
  lib/
    seo.ts                title/description validation, canonical construction
    schema.ts             JSON-LD generators
  pages/                  26 indexable routes + 404 + robots.txt
  styles/
    tokens.css            design tokens
    base.css              reset, typography, layout primitives
    components.css        shared component styles

scripts/                  build helpers and audit gates
public/                   fonts, documents, favicon, OG image, manifest
docs/                     phase reports
_research/                crawl evidence (git-ignored, retained locally)
```

## The data-flow rule

```
src/data/site.ts  ──►  every page, every component, every schema generator
```

**If a business fact is not in `site.ts`, no page may assert it.** Phone numbers, addresses,
opening hours, email, social profiles, document links, brand names and company figures all come
from there. This is what makes it structurally impossible for two pages to disagree — the defect
that produced two different Belgian addresses on the live site.

`tyres.ts` and `sizes.ts` do the same for product data, and each carries the
`CONTENT_TRUST_CONFLICTS.md` reference explaining which published variant was chosen and why.

## Content collections

| Collection | Loader | Why this shape |
|---|---|---|
| `services` | `glob` (Markdown) | Prose a person edits; needs headings, links, quotations |
| `offers` | `glob` (Markdown) | Same |
| `faqs` | `file` (JSON) | 10 records that must stay structurally identical; `category` drives grouping |
| `markets` | `file` (JSON) | 12 records with region grouping and a `publishedAs` field preserving the source's original spelling |
| `testimonials` | `file` (JSON) | Verbatim quotations — a schema prevents accidental editing |

Schemas enforce more than types. `services` requires a `description` of 70–160 characters (so it
can be a meta description) and a `summary` of 40–240 (so it can be the answer block). The
`services/[slug].astro` route validates every `related` slug against the collection and **throws at
build time** if one does not resolve, so a broken internal link cannot ship.

## Rendering model

Every route is prerendered to static HTML. There is no adapter, no server, no runtime.

```
astro build
  ├─ validate content collections against Zod schemas
  ├─ render 29 HTML pages
  ├─ validate every title and description (length + uniqueness) — throws on violation
  ├─ optimise images to AVIF/WebP with responsive variants
  ├─ inline CSS into each page
  ├─ generate sitemap-index.xml + sitemap-0.xml
  ├─ scripts/generate-redirects.mjs  → _redirects, vercel.json, .htaccess, nginx conf
  └─ scripts/generate-headers.mjs    → _headers, headers.nginx.conf (CSP derived from the build)
```

## SEO pipeline

`src/lib/seo.ts` is a build-time guard, not a helper. It throws if a title exceeds 62 characters,
a description falls outside 70–158, or either duplicates another page's. Because it runs during
rendering, a metadata regression fails the build rather than shipping.

`src/lib/schema.ts` composes JSON-LD graphs. `graph(...nodes)` always prepends the `Organization`
and `WebSite` nodes, so every page resolves the same entity. Individual generators
(`webPage`, `breadcrumbList`, `faqPage`, `service`, `itemList`, `contactPage`) take only the
properties the source supports — there is no code path that can emit a price, rating or
availability.

## Design system

Tokens in `src/styles/tokens.css`: a 5-step green ramp anchored on the site's declared accent
`#86b43a`, a 9-step neutral ramp anchored on the logo charcoal `#343435`, an 8-point spacing scale,
3 radii, 2 shadows, 4 breakpoints. Full documentation in [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md).

Components are Astro-only, with scoped `<style>` blocks. Shared patterns (buttons, cards, tables,
forms, answer blocks) live in `components.css` so Astro can inline one stylesheet rather than many.

## Build gates

| Command | Enforces |
|---|---|
| `npm run typecheck` | 0 TS errors at `strictest` |
| `npm run build` | Content schemas, title/description validity, redirect integrity, CSP validity |
| `npm run check:seo` | Titles, descriptions, canonicals, robots, OG, headings, alt text, image dimensions, JSON-LD, orphans |
| `npm run check:links` | Broken links, redirect-source links, dead `#`, fragments, `noopener` |
| `npm run check:a11y` | Landmarks, labels, headings, duplicate ids, tables, contrast (19 pairs) |
| `npm run check:schema` | Graph validity, `@id` resolution, entity consistency, schema-to-content match |
| `npm run check:budget` | 8 performance budgets |
| `npm run check:mobile` | Real-browser overflow, tap targets, CWV, console errors × 4 viewports |
| `npm run audit` | All of the above except mobile |
| `npm run audit:full` | Everything, including external links and mobile |

## Adding content

**A new service:** drop a Markdown file in `src/content/services/`. The route, schema, hub card,
homepage card and related-links wiring all derive from the collection. `related` slugs are
validated at build.

**A new FAQ:** add a record to `src/content/faqs/faqs.json`. It appears on `/faqs/` under its
category and in the `FAQPage` schema automatically.

**A new page:** create the `.astro` file, add it to `src/data/nav.ts` (or link it from a hub — the
orphan check will fail the build otherwise), and give it a unique title and description.

**Changing a business fact:** edit `src/data/site.ts`. It propagates everywhere, including schema.

## Deliberate constraints

1. **No JavaScript unless HTML and CSS genuinely cannot do it.** Budget: 5 KB/page, currently 0.45.
2. **No third-party script on load.** Budget: 0.
3. **No render-blocking sub-resource.** Budget: 0.
4. **No fact outside `src/data/*`.**
5. **No schema property the public source does not support** — 22 are blocklisted and fail the build.
6. **No orphan pages** — fails the build.
7. **No internal link to a redirect** — fails the build.
