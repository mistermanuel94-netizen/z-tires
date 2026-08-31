# PROJECT_STATUS.md

**Project:** flextyres.com rebuild — WordPress 6.7.7 → Astro 7 static
**Status:** **COMPLETE** — all 17 phases passed
**Date:** 2026-08-31

---

## Phase status

| Phase | Name | Status | Evidence |
|---|---|---|---|
| 0 | Environment inspection | **PASS** | [`docs/PHASE-0-ENVIRONMENT.md`](docs/PHASE-0-ENVIRONMENT.md) |
| 1 | Full public crawl | **PASS** | [`SITE_INVENTORY.md`](SITE_INVENTORY.md) — 86 URLs |
| 2 | Content / asset / brand reverse engineering | **PASS** | [`docs/PHASE-2-ASSETS-AND-BRAND.md`](docs/PHASE-2-ASSETS-AND-BRAND.md), [`CONTENT_TRUST_CONFLICTS.md`](CONTENT_TRUST_CONFLICTS.md) |
| 3 | Existing IA audit | **PASS** | [`docs/PHASE-3-5-ARCHITECTURE.md`](docs/PHASE-3-5-ARCHITECTURE.md) |
| 4 | URL / canonical / redirect strategy | **PASS** | [`URL_REDIRECT_MAP.md`](URL_REDIRECT_MAP.md) — 83 rules |
| 5 | New information architecture | **PASS** | [`docs/PHASE-3-5-ARCHITECTURE.md`](docs/PHASE-3-5-ARCHITECTURE.md), [`docs/SEARCH_INTENT_MAP.md`](docs/SEARCH_INTENT_MAP.md) |
| 6 | Astro architecture | **PASS** | [`ARCHITECTURE.md`](ARCHITECTURE.md) |
| 7 | Design system | **PASS** | [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md) |
| 8 | Content migration | **PASS** | [`CONTENT_MIGRATION.md`](CONTENT_MIGRATION.md) |
| 9 | Technical SEO | **PASS** | [`SEO_AUDIT.md`](SEO_AUDIT.md) |
| 10 | Structured data / entities | **PASS** | [`STRUCTURED_DATA_AUDIT.md`](STRUCTURED_DATA_AUDIT.md) |
| 11 | GEO / AEO / AI search | **PASS** | [`GEO_AEO_AUDIT.md`](GEO_AEO_AUDIT.md), [`AI_SEARCH_AUDIT.md`](AI_SEARCH_AUDIT.md) |
| 12 | Performance | **PASS** | [`PERFORMANCE_AUDIT.md`](PERFORMANCE_AUDIT.md) |
| 13 | Accessibility + security | **PASS** | [`ACCESSIBILITY_AUDIT.md`](ACCESSIBILITY_AUDIT.md), [`SECURITY_AUDIT.md`](SECURITY_AUDIT.md) |
| 14 | Full QA + regression | **PASS** | [`FINAL_QA_REPORT.md`](FINAL_QA_REPORT.md) |
| 15 | Launch readiness | **PASS** (2 owner actions) | [`DEPLOYMENT.md`](DEPLOYMENT.md), [`LEGACY_DECOMMISSION.md`](LEGACY_DECOMMISSION.md) |
| 16 | Documentation and handoff | **PASS** | This file |

## Current state

| | |
|---|---|
| Indexable pages | 26 |
| Total built pages | 29 |
| Redirect rules | 83 (76 × 301, 7 × 410) |
| Automated gates | 9, all passing |
| TypeScript errors | 0 across 67 files at `strictest` |
| Client JavaScript | 461 bytes |
| Homepage weight vs source | −96% |
| Open owner decisions | 15 (6 at P1, 2 blocking launch) |

## What was delivered

**A complete Astro site** replacing a WordPress installation that was serving two indexable copies
of itself, 21 pages of fabricated theme demo content, and 8.79 MB of homepage payload.

Beyond the rebuild, three things were recovered that the live site had lost or broken:

1. **Truck tyre grading criteria** — existed only on an install abandoned in 2021, while the live
   site solicited truck buyers with a form and no specification at all.
2. **The Sprinter van delivery offer** — 559 words with a full order form, the richest commercial
   page on the site, linked from nothing.
3. **The Purchasing Terms document** — unreachable, because the only link to it 404s in the header
   and footer of every page.

24 factual conflicts in the published content were documented rather than silently resolved.

Both legal documents were subsequently **rewritten on owner instruction**: the privacy policy
because the inherited text described advertising cookies this site does not set, and the purchasing
terms because three defects made parts of them unusable or unenforceable. Every change is logged on
the page. A [decommission runbook](LEGACY_DECOMMISSION.md) covers taking the legacy WordPress
install down, with interim mitigations that close the duplicate-content and security exposure
before the cutover.

## Metrics

| | Live site | Rebuild |
|---|---|---|
| Homepage total weight | 8.79 MB | ~350 KB |
| CSS | 1,547 KB / 23 files | 26.8 KB / 0 files |
| JavaScript | 2,404 KB / 39 files | 0.45 KB / 0 files |
| Render-blocking requests | 62 | 0 |
| Third-party origins on load | 6 | 0 |
| Font faces | 26 | 4 |
| Mobile LCP | not measurable through the JS slider | 152 ms |
| Mobile CLS | — | 0.0000 |
| Indexable URLs | 71 | 26 |
| Pages without a meta description | 51 | 0 |
| Pages without an `<h1>` | 20 | 0 |
| Orphan pages | 17 | 0 |
| Site-wide broken links | 2 per page | 0 |
| Fabricated indexable pages | 21 | 0 |
| Images without alt text | ~120 | 0 |
| WordPress plugins to patch | 19+ | 0 |

**Final scorecard: 93.2 / 100** — breakdown in [`FINAL_QA_REPORT.md`](FINAL_QA_REPORT.md) §10.

## Blocking owner actions

| # | Action | Status | Reference |
|---|---|---|---|
| 1 | Choose and harden a form endpoint | Deferred by the owner; `mailto:` fallback in place | `DEPLOYMENT.md` §1 |
| 2 | Privacy policy | **Done** — v2.0 written to describe actual processing. Sign-off outstanding | C-18 |
| 3 | Purchasing terms | **Done** — v2.0 with all three defects fixed. Sign-off outstanding | C-19 |
| 4 | Decommission the legacy WordPress install | **Runbook delivered.** Execution needs hosting access | [`LEGACY_DECOMMISSION.md`](LEGACY_DECOMMISSION.md) |

## P1 content decisions

| ID | Question |
|---|---|
| C-01 | Which of **three published** tread-depth specifications is correct? |
| C-02 | Which Belgian address is current — Evere or Mechelen? |
| C-05 | Is a 1,000-piece order still accepted, or are container/van minimums the only routes? |
| C-14 | Should the site carry real staff, or no team section? |

Full register of all 15 in [`CONTENT_TRUST_CONFLICTS.md`](CONTENT_TRUST_CONFLICTS.md).

## Document index

**Audits** — [`SEO_AUDIT.md`](SEO_AUDIT.md) · [`STRUCTURED_DATA_AUDIT.md`](STRUCTURED_DATA_AUDIT.md) · [`GEO_AEO_AUDIT.md`](GEO_AEO_AUDIT.md) · [`AI_SEARCH_AUDIT.md`](AI_SEARCH_AUDIT.md) · [`PERFORMANCE_AUDIT.md`](PERFORMANCE_AUDIT.md) · [`ACCESSIBILITY_AUDIT.md`](ACCESSIBILITY_AUDIT.md) · [`SECURITY_AUDIT.md`](SECURITY_AUDIT.md) · [`FINAL_QA_REPORT.md`](FINAL_QA_REPORT.md)

**Migration** — [`SITE_INVENTORY.md`](SITE_INVENTORY.md) · [`CONTENT_TRUST_CONFLICTS.md`](CONTENT_TRUST_CONFLICTS.md) · [`CONTENT_MIGRATION.md`](CONTENT_MIGRATION.md) · [`URL_REDIRECT_MAP.md`](URL_REDIRECT_MAP.md)

**Engineering** — [`ARCHITECTURE.md`](ARCHITECTURE.md) · [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md) · [`DECISIONS.md`](DECISIONS.md) · [`DEPLOYMENT.md`](DEPLOYMENT.md) · [`LEGACY_DECOMMISSION.md`](LEGACY_DECOMMISSION.md)

**Phase reports** — [`docs/`](docs/)

## Verification

```bash
npm ci
npm run audit:full
```

Runs typecheck, build, SEO, links (including live external checks), accessibility, schema, budget
and real-browser mobile QA. All nine pass on the current tree.
