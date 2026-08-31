# DEPLOYMENT.md

---

## Requirements

- Node ≥ 22.12 (developed on 24.16)
- npm ≥ 9.6.5
- A static host that can serve custom headers and redirects

## Build

```bash
npm ci
npm run build          # astro build + generate-redirects + generate-headers
```

Output is `dist/` — static HTML, hashed assets, and the host configuration files below.

```bash
npm run audit          # typecheck + build + seo + links + a11y + schema + budget
npm run audit:full     # the above, plus external link checks and real-browser mobile QA
```

`npm run audit` must pass before deploying. Every check exits non-zero on failure.

## Files the build emits for the host

| File | Host |
|---|---|
| `dist/_redirects` | Netlify, Cloudflare Pages |
| `dist/_headers` | Netlify, Cloudflare Pages |
| `dist/vercel.json` | Vercel |
| `dist/.htaccess` | Apache |
| `dist/nginx-redirects.conf` | nginx — `include` inside a `server { }` block |
| `dist/headers.nginx.conf` | nginx — `include` inside a `server { }` block |

## Platform setup

### Netlify / Cloudflare Pages (recommended — zero configuration)

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Publish directory | `dist` |
| Node version | 22 or later |

`_redirects` and `_headers` are picked up automatically. Both platforms serve brotli by default,
which takes the homepage to ~12 KB on the wire.

### Vercel

Build command `npm run build`, output directory `dist`. `vercel.json` is emitted into `dist/`;
move or symlink it to the project root if your Vercel project reads from there.

### nginx

```nginx
server {
    listen 443 ssl http2;
    server_name flextyres.com;
    root /var/www/flextyres/dist;

    include /var/www/flextyres/dist/headers.nginx.conf;
    include /var/www/flextyres/dist/nginx-redirects.conf;

    # Trailing-slash directory index
    location / {
        try_files $uri $uri/index.html $uri/ =404;
    }

    error_page 404 /404.html;

    gzip on;
    gzip_types text/html text/css application/javascript application/xml image/svg+xml;
    # brotli_static on;   # strongly recommended if the module is available
}

# Redirect www and http to the canonical apex
server {
    listen 80;
    listen 443 ssl http2;
    server_name www.flextyres.com;
    return 301 https://flextyres.com$request_uri;
}
```

### Apache

`.htaccess` is emitted into `dist/`. Ensure `mod_rewrite`, `mod_headers` and `mod_deflate` are
enabled, and add the security headers from `dist/_headers` to your vhost.

## Host requirements

| Requirement | Why |
|---|---|
| HTTPS with a valid certificate | HSTS is set with `preload` |
| **Redirect `www` → apex** | Not emitted by the build; must be configured at the host or DNS |
| **Redirect `http` → `https`** | Same |
| Brotli or gzip | HTML is 71.7 KB raw, 12.0 KB brotli |
| Custom 404 → `/404.html` | The page exists but the host must wire it |
| Trailing-slash directory index | The site uses `trailingSlash: 'always'` |

---

## Before launch — required owner actions

### 1. Choose a form endpoint (blocking)

Forms currently post to `mailto:info@flextyres.com` and say so. To wire a real endpoint, set one
value in `src/data/site.ts`:

```ts
export const formEndpoint = 'https://…';
```

Everything else adapts: the encoding switches to `application/x-www-form-urlencoded` and the
mailto fallback notice disappears.

Options, all of which work with a static site:

| Option | Notes |
|---|---|
| Netlify Forms | Add `netlify` and `netlify-honeypot="company_url"` to the `<form>`; no external service |
| Cloudflare Worker | Full control; forward to email or a CRM |
| Formspree / Basin / Web3Forms | Hosted; check the GDPR data-processing terms — FlexTyres is an EU business |
| Own endpoint | Any HTTPS POST handler |

Whichever is chosen **must** validate and rate-limit server-side. The honeypot (`company_url`) is a
filter, not a defence — reject any submission where it is non-empty.

After wiring, point the success response at `/thank-you/` (already built, `noindex`).

### 2. Decide on analytics (blocking if you want data from day one)

Analytics is off. To enable GA4:

```ts
export const analytics = { ga4MeasurementId: 'G-GV9FHYB4FT' } as const;
```

The tag loads with `anonymize_ip` already set.

**If you enable it, you need a consent mechanism.** FlexTyres is a Belgian business serving EU
customers; GA4 sets cookies and transfers data, which requires consent under GDPR/ePrivacy. The
current build sets **zero cookies and makes zero third-party requests**, which is why it needs no
banner. Adding analytics changes that.

The Google Ads tag (`AW-1015016995`) and Universal Analytics (`UA-129455084-1`) are not carried
over. UA no longer collects data. Reinstating Ads is an owner decision.

### 3. Legal sign-off (blocking — see `CONTENT_TRUST_CONFLICTS.md`)

- **C-18** — three different privacy policies are published on the live site. The current-install
  version is reproduced verbatim and marked "under review". Confirm which governs.
- **C-19** — the Purchasing Terms PDF (dated 2012) contains an unfilled template placeholder
  ("30 (change this) days"), no dispute-resolution mechanism selected, and a 3%-**per-day**
  interest clause. The document is mirrored unaltered and its defects are neither reproduced nor
  paraphrased in site copy, but it needs legal review and reissue.

### 4. Resolve the P1 content conflicts

C-01 (tread depths), C-02 (Belgium address), C-05 (minimum order), C-14 (staff). Each currently
ships with a documented, least-misleading fallback plus a visible caveat. Resolving them lets the
caveats be removed. Full register in `CONTENT_TRUST_CONFLICTS.md`.

---

## Launch sequence

1. Deploy to a staging URL. Run `npm run audit:full` against the build.
2. Configure DNS: apex → host, `www` → 301 to apex.
3. Verify TLS and HSTS.
4. Spot-check redirects in production:
   ```bash
   curl -sI https://flextyres.com/en/                          # 301 → /
   curl -sI https://flextyres.com/en/about-us/                 # 301 → /about/
   curl -sI https://flextyres.com/en/sprinter-delivery-180-tires/  # 301 → /offers/sprinter-van-delivery/
   curl -sI https://flextyres.com/hello-world/                 # 410
   curl -sI https://flextyres.com/documents/flextyres-purchasing-terms.pdf  # 200
   ```
   The last one matters: that document is unreachable on the live site because of a 404 in the
   header and footer of every page.
5. Submit `https://flextyres.com/sitemap-index.xml` to Google Search Console and Bing Webmaster
   Tools.
6. Verify `robots.txt` resolves and declares the sitemap.
7. Test both quote forms and the contact form end to end.
8. **Take the legacy root WordPress install offline.** While it stays up it is both a duplicate-
   content problem (`SEO_AUDIT.md`) and an attack surface with a public login (`SECURITY_AUDIT.md`).
9. Keep the old Search Console property for at least 6 months to monitor 404s.

## After launch

| When | Action |
|---|---|
| Day 1 | Confirm indexing has begun; check Search Console coverage for unexpected 404s |
| Week 1 | Confirm the 21 fabricated pages are dropping out of the index |
| Week 2 | Review Search Console for redirect errors |
| Week 4 | Compare impressions and clicks against the pre-launch baseline |
| Week 6–8 | Re-indexing should be substantially complete |
| Quarterly | Re-run `npm run audit:full`; re-check the AI-crawler policy in `AI_SEARCH_AUDIT.md` §6 |

## Rollback

The old site is not modified by this project. If a rollback is needed, repoint DNS. Because the
redirect layer is served by the new host, reverting DNS restores the previous behaviour
completely.

## Maintenance

| Task | How |
|---|---|
| Change a business fact | Edit `src/data/site.ts` — it propagates everywhere, including schema |
| Add a service | Add a Markdown file to `src/content/services/` |
| Add an FAQ | Add a record to `src/content/faqs/faqs.json` |
| Add a page | Create the `.astro` file and link it from a hub — the orphan check fails the build otherwise |
| Add or change a redirect | Edit `src/data/redirects.ts`; the build validates and regenerates all four host configs |
| Re-process source images | `npm run prepare:images` (requires `_research/assets/orig/`) |
| Regenerate brand assets | `npm run prepare:brand` |
| Regenerate the redirect document | `node scripts/gen-redirect-doc.mjs` |
