# FlexTyres

Static Astro rebuild of [flextyres.com](https://flextyres.com) — a Belgian wholesaler of used car
and truck tyres.

```bash
npm ci
npm run dev            # http://localhost:4321
npm run build          # → dist/
npm run audit          # all quality gates
```

---

## What this is

A complete replacement for a WordPress 6.7.7 site that was serving two indexable copies of itself,
21 pages of unremoved theme demo content, and 8.79 MB of homepage payload.

| | Live site | This build |
|---|---|---|
| Homepage weight | 8.79 MB | ~350 KB |
| JavaScript | 2,404 KB across 39 files | **461 bytes** |
| CSS | 1,547 KB across 23 files | 26.8 KB, inlined |
| Render-blocking requests | 62 | **0** |
| Mobile LCP | — | **~100 ms** |
| Mobile CLS | — | **0.0000** |
| Indexable pages | 71 (incl. 21 fabricated) | 26 |
| Pages with no meta description | 51 | 0 |
| Orphan pages | 17 | 0 |

Full numbers in [`FINAL_QA_REPORT.md`](FINAL_QA_REPORT.md).

## Stack

Astro 7 · TypeScript (`strictest`) · hand-written CSS · content collections with Zod schemas ·
Sharp image pipeline · no UI framework · no runtime.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Build + generate redirects + generate security headers |
| `npm run preview` | Preview the build |
| `npm run typecheck` | `astro check` |
| `npm run audit` | typecheck → build → SEO → links → a11y → schema → budget |
| `npm run audit:full` | The above, plus live external-link checks and real-browser mobile QA |
| `npm run qa:serve` | Serve `dist/` on :4499 with production redirects and headers applied |
| `npm run qa:shoot` | Screenshot key routes via CDP at desktop and mobile |

### Individual gates

`check:seo` · `check:links` · `check:links:external` · `check:a11y` · `check:schema` ·
`check:budget` · `check:mobile`

Every one exits non-zero on failure. Three real defects were caught this way and fixed rather than
suppressed — see [`DECISIONS.md`](DECISIONS.md) D-15.

## Project rules

1. **One source of truth for business facts.** Every phone number, address, opening hour and
   company figure lives in `src/data/site.ts`. *If a fact is not in that file, no page may assert
   it.* This is what makes it structurally impossible for two pages to disagree — the defect that
   left the live site publishing two different Belgian addresses in different cities.
2. **No JavaScript unless HTML and CSS genuinely cannot do it.** Budget: 5 KB/page. Current: 0.45 KB.
3. **No schema property the public source does not support.** 22 are blocklisted and fail the build.
4. **No orphan pages, no internal link to a redirect.** Both fail the build.
5. **Published data is not silently corrected.** Where the source contradicts itself, the conflict
   is documented and the least misleading option is implemented with a visible caveat.

## Where things are

```
src/data/site.ts        every business fact
src/data/tyres.ts       grades, order routes, caveats
src/data/sizes.ts       348 car sizes + 16 truck sizes
src/data/redirects.ts   82 redirect rules
src/content/            services, offers, FAQs, markets, testimonials
src/lib/seo.ts          metadata validation (throws at build time)
src/lib/schema.ts       JSON-LD generators
scripts/                build helpers and audit gates
docs/                   phase reports
_research/              crawl evidence (git-ignored)
```

Detail in [`ARCHITECTURE.md`](ARCHITECTURE.md).

## Common tasks

| Task | How |
|---|---|
| Change a phone number, address or opening hour | Edit `src/data/site.ts` — propagates everywhere, including schema |
| Add a service | Add a Markdown file to `src/content/services/` |
| Add an FAQ | Add a record to `src/content/faqs/faqs.json` |
| Add a page | Create the `.astro` file and link it from a hub — the orphan check fails the build otherwise |
| Add a redirect | Edit `src/data/redirects.ts` — validated and regenerated for all four host configs |

## Before deploying

Four owner actions are outstanding. See [`DEPLOYMENT.md`](DEPLOYMENT.md):

1. Choose a form endpoint (forms currently fall back to `mailto:`)
2. Legal review — three different privacy policies are published on the live site
3. Reissue the Purchasing Terms PDF — it contains an unfilled template placeholder
4. Decommission the legacy root WordPress install

## Documentation

**Start here:** [`PROJECT_STATUS.md`](PROJECT_STATUS.md) · [`FINAL_QA_REPORT.md`](FINAL_QA_REPORT.md)

**Content governance:** [`CONTENT_TRUST_CONFLICTS.md`](CONTENT_TRUST_CONFLICTS.md) — 24 documented
factual conflicts in the published source, and how each is handled. Read this before changing any
factual copy.

**Audits:** [`SEO_AUDIT.md`](SEO_AUDIT.md) · [`STRUCTURED_DATA_AUDIT.md`](STRUCTURED_DATA_AUDIT.md) ·
[`GEO_AEO_AUDIT.md`](GEO_AEO_AUDIT.md) · [`AI_SEARCH_AUDIT.md`](AI_SEARCH_AUDIT.md) ·
[`PERFORMANCE_AUDIT.md`](PERFORMANCE_AUDIT.md) · [`ACCESSIBILITY_AUDIT.md`](ACCESSIBILITY_AUDIT.md) ·
[`SECURITY_AUDIT.md`](SECURITY_AUDIT.md)

**Engineering:** [`ARCHITECTURE.md`](ARCHITECTURE.md) · [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md) ·
[`DECISIONS.md`](DECISIONS.md) · [`DEPLOYMENT.md`](DEPLOYMENT.md)

**Migration:** [`SITE_INVENTORY.md`](SITE_INVENTORY.md) · [`CONTENT_MIGRATION.md`](CONTENT_MIGRATION.md) ·
[`URL_REDIRECT_MAP.md`](URL_REDIRECT_MAP.md)
