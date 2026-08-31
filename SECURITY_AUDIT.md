# SECURITY_AUDIT.md

Threat surface of a static marketing site: header hygiene, third-party code, form handling and
secret exposure. Headers are generated from what the build actually loads
(`scripts/generate-headers.mjs`) and validated against `dist/` before being written.

---

## 1. Attack surface removed

| Live site | Rebuild |
|---|---|
| WordPress 6.7.7 core, a commercial theme and **19+ plugins** | No CMS, no database, no server-side execution |
| Public admin login at `/wp-login.php` | None |
| `xmlrpc.php` advertised via a `pingback` link on every page | None |
| WordPress REST API exposed at `/wp-json/` | None |
| Comment system (with a live default comment) | None |
| WooCommerce with cart, checkout and account endpoints | None |
| jQuery 3.7.1 + jquery-migrate | None |
| 2,404 KB of third-party JavaScript from 6 origins | **461 B of first-party JS** |
| Slider Revolution 6.2.23 — a plugin family with a documented history of critical RCE and LFI advisories | None |
| Cross-domain image hotlink from `usedtiresquote.com` | None |

Every plugin removed is a dependency that no longer needs patching. A static build has no runtime
to compromise.

## 2. Security headers (`dist/_headers`, `dist/headers.nginx.conf`)

| Header | Value |
|---|---|
| `Content-Security-Policy` | see below |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `X-Frame-Options` | `DENY` |
| `Cross-Origin-Opener-Policy` | `same-origin` |
| `Cross-Origin-Resource-Policy` | `same-origin` |
| `Permissions-Policy` | 14 features denied: accelerometer, autoplay, camera, display-capture, encrypted-media, geolocation, gyroscope, interest-cohort, magnetometer, microphone, midi, payment, usb; `fullscreen=(self)` |

### Content Security Policy

```
default-src 'self';
base-uri 'self';
form-action 'self' mailto:;
frame-ancestors 'none';
object-src 'none';
script-src 'self' 'sha256-7xqclwzdLzAGOXA1UM2QDQylRb5M1XS1N8Kp5ElRIaI=';
style-src 'self' 'unsafe-inline';
img-src 'self' data:;
font-src 'self';
connect-src 'self';
media-src 'self';
frame-src https://www.google.com https://www.youtube-nocookie.com;
manifest-src 'self';
upgrade-insecure-requests
```

**`script-src` uses a SHA-256 hash, not `'unsafe-inline'`.** There is exactly one inline script on
the site and it is byte-identical on every page, so a single hash covers it. Any injected script —
including one introduced through a compromised build — is blocked unless its hash is in the policy.

**`style-src` requires `'unsafe-inline'`.** Astro inlines the stylesheet and emits scoped component
styles as `<style>` elements. Hashing them would work but would invalidate on every content change.
The residual risk is CSS-based exfiltration, which requires an attacker to already be injecting
markup. Given no user-generated content, no comments, no search reflection and no third-party
script, this is an acceptable trade-off and is recorded as D-12 in `DECISIONS.md`.

`frame-src` allows only the two origins the page can actually embed, and both are behind a
`<details>` disclosure so nothing loads until a visitor opens it. YouTube uses
`youtube-nocookie.com`.

### Policy validation

`generate-headers.mjs` fails the build if the CSP would break the site or be trivially bypassable:

| Check | Result |
|---|---|
| External script or stylesheet origins not in the policy | **0** |
| Inline event handlers (`onclick=` etc.), which the CSP blocks | **0** |
| `javascript:` URLs | **0** |
| Inline scripts covered by a hash | 1/1 |

## 3. Secrets

| Check | Result |
|---|---|
| API keys, tokens or credentials in the repository | **none** |
| Secrets in client-side code | **none** |
| `.env` files committed | none; `.env` and `.env.*` are git-ignored |
| Build-time secrets required | none — the build is fully static and reproducible from source |

The live site publishes a reCAPTCHA site key, three gtag IDs and a Google MyMaps ID. Site keys are
public by design, but they are not carried over: reCAPTCHA is removed entirely, and the analytics
ID is inert until enabled (§5).

## 4. Forms

**No backend can be reconstructed from public information** — the live site posts to Contact Form 7
inside WordPress, which does not survive the migration. Rather than invent an endpoint or ship a
form that silently fails, the build is explicit:

| Aspect | Implementation |
|---|---|
| Endpoint | `formEndpoint` in `src/data/site.ts`, empty by default |
| Behaviour with no endpoint | `action="mailto:info@flextyres.com"` — the form still submits, via the visitor's mail client |
| Visible fallback | Every form states this and offers phone, WhatsApp and direct email |
| Redundancy | Phone, WhatsApp and email appear in the header, footer and every CTA band, so the commercial path never depends on the form |
| Anti-spam | Honeypot field (`company_url`), off-screen, `aria-hidden`, `tabindex="-1"` |
| No CAPTCHA | Deliberate: reCAPTCHA v3 is a third-party script, a privacy exposure and an accessibility barrier. A honeypot plus server-side filtering at the endpoint is sufficient for this volume |
| Injection risk | None client-side — no form input is ever written back into the DOM |
| `form-action` | Restricted to `'self'` and `mailto:` by CSP |
| Consent | Privacy policy linked immediately above every submit button |

**Before launch the owner must choose an endpoint.** Options and wiring instructions are in
`DEPLOYMENT.md`. Whichever is chosen must validate and rate-limit server-side; a honeypot is a
filter, not a defence.

## 5. Analytics and privacy

| Item | Live site | Rebuild |
|---|---|---|
| Universal Analytics `UA-129455084-1` | loaded | **removed** — the property no longer collects data |
| Google Ads `AW-1015016995` | loaded | **removed** — owner decision to reinstate |
| GA4 `G-GV9FHYB4FT` | loaded | **retained but disabled** |
| reCAPTCHA v3 | loaded on every page | removed |
| Google Translate | loaded on every page | removed |
| Google Fonts | 2 render-blocking requests to 2 origins | self-hosted |
| Cookie banner | present, blocked nothing | not needed — nothing sets a cookie |

GA4 ships **only** if `analytics.ga4MeasurementId` is set in `src/data/site.ts`. It is an empty
string, so the current build makes **zero third-party requests on load** and sets **zero cookies**.
That is also why no consent banner is required: there is nothing to consent to. If the owner
enables GA4, a consent mechanism becomes necessary under GDPR/ePrivacy for an EU business — noted
in `DEPLOYMENT.md`.

The `IP anonymisation` flag is pre-configured in the gtag call for when it is enabled.

## 6. Transport and delivery

| Item | Status |
|---|---|
| HTTPS | Required. HSTS with a 2-year max-age, `includeSubDomains` and `preload` |
| Mixed content | Impossible — `upgrade-insecure-requests`, and every asset is same-origin |
| Clickjacking | `X-Frame-Options: DENY` + `frame-ancestors 'none'` |
| MIME sniffing | `nosniff` |
| Referrer leakage | `strict-origin-when-cross-origin` |
| Cross-origin isolation | COOP + CORP `same-origin` |
| Outbound links | `rel="noopener"` on every external link; enforced by `check-links.mjs` |

## 7. Dependencies

```
dependencies:      astro ^7.2.9, @astrojs/sitemap ^3.7.3, sharp ^0.35.4
devDependencies:   typescript, @astrojs/check, prettier, prettier-plugin-astro, linkinator, @types/node
```

`npm audit` reports **0 vulnerabilities**. Three runtime dependencies, all build-time only —
nothing from `node_modules` reaches the browser. Compare with the live site's 19+ WordPress
plugins, each an internet-facing attack surface requiring continuous patching.

## 8. robots.txt and crawler policy

`robots.txt` is fully permissive and blocks no CSS, JS, image, font or document path. This is a
deliberate decision, not an oversight:

- Everything on the site is public marketing and product information the business wants found.
- Nothing is paywalled, licensed or personal.
- Blocking CSS or JS would impair rendering for every crawler.
- `/thank-you/` and `/legal/` are excluded from the sitemap and carry `noindex` **meta tags** —
  they are deliberately **not** `Disallow`ed, because a disallowed URL cannot be crawled and its
  `noindex` can therefore never be read.

No AI or search crawler is currently blocked. If FlexTyres later decides to opt out of AI training
corpora, targeted `User-agent` blocks belong in `src/pages/robots.txt.ts`. That is a business
decision with a real trade-off — several of those crawlers also feed answer surfaces that send
buyers — and is flagged as an owner decision rather than assumed either way.

## 9. Residual risks

| Risk | Severity | Status |
|---|---|---|
| `style-src 'unsafe-inline'` | Low | Accepted, documented (D-12) |
| Form endpoint not yet chosen | **Medium** | **Owner action required before launch** |
| GA4 consent mechanism if analytics is enabled | Medium | Documented in `DEPLOYMENT.md`; not triggered by the current build |
| Legacy WordPress install remains online with a public login | **High — but outside this repository** | Owner must decommission it after the redirect layer is live |
| Purchasing Terms PDF contains an unfilled template placeholder and no dispute-resolution selection | **High (legal, not technical)** | C-19; requires legal review |

## PHASE RESULT — Phase 13, Security

**Status: PASS**, with one owner action outstanding (form endpoint).

### Audit results
- 8 security headers, CSP derived from and validated against the actual build
- Inline scripts hash-pinned rather than `'unsafe-inline'`
- 0 secrets, 0 third-party requests on load, 0 cookies set
- 0 npm vulnerabilities, 3 runtime dependencies
- Entire WordPress attack surface eliminated

### Remaining risks
The form endpoint must be chosen and hardened before launch. The legacy WordPress install must be
decommissioned — while it remains online it is both a security surface and, per `SEO_AUDIT.md`,
an active duplicate-content problem.
