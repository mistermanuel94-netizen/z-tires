# LEGACY_DECOMMISSION.md

Taking down the WordPress installation, resolving the duplicate-content problem and closing the
security exposure.

**This requires hosting and WordPress administrator access, which this project does not have and
should not have.** Everything below is executable by whoever holds those credentials. Nothing here
has been run against the live site.

---

## 1. Verified live state

Checked 2026-08-31. All of the following are still publicly reachable:

| URL | Status | Problem |
|---|---|---|
| `https://flextyres.com/` | 301 → `/en/` | Apex costs a hop |
| `https://flextyres.com/about-us/` | **200** | Legacy duplicate of the live About page |
| `https://flextyres.com/en/team/waylon-dalton/` | **200** | Fabricated staff profile, indexable |
| `https://flextyres.com/hello-world/` | **200** | WordPress default post, indexable |
| `https://flextyres.com/wp-login.php` | **200** | Public admin login |
| `https://flextyres.com/robots.txt` | 200 | Declares the stale sitemap only |

Two complete WordPress sites are running on one host: a legacy install at the root and the live one
under `/en/`. Neither canonicalises to the other, and both are fully indexable.

## 2. The two problems

### Duplicate content
14 legacy root pages duplicate live `/en/` pages — About, Contact, FAQ, Recycling, Stock, Quote and
the privacy policy. Each pair competes for the same query with self-referential canonicals, so
Google must pick one and the choice is not FlexTyres'. On top of that, 21 fabricated theme-demo
pages describe a business that does not exist.

### Security
WordPress 6.7.7 with a commercial theme and 19+ plugins, a public login page, `xmlrpc.php`
advertised on every page, and an exposed REST API. Slider Revolution in particular has a documented
history of critical advisories. Every plugin is an internet-facing surface requiring continuous
patching. Once the static site is live, none of it needs to exist.

## 3. Recommended sequence

Do **not** delete WordPress first. Order matters: if the CMS goes down before the redirects are
live, 86 URLs start returning errors and the accumulated link equity is lost.

```
Step 1  Deploy the static site to a staging URL and verify
Step 2  Apply interim mitigations to live WordPress   ← works today, no cutover needed
Step 3  Cut DNS over to the static host
Step 4  Verify redirects in production
Step 5  Archive WordPress (full backup)
Step 6  Take WordPress offline
Step 7  Monitor for 30 days, then destroy
```

## 4. Step 2 — Interim mitigations (apply today)

These resolve most of the duplicate-content damage **before** the cutover, and cost nothing if the
migration slips. All are reversible.

### 4a. Deindex the fabricated content

In WordPress admin, for each of these, set Yoast → Advanced → *Allow search engines to show this
page?* → **No**:

```
/en/team/                          and all 8 child profiles
/en/portfolio/                     and all 6 child pages
/en/categories/brakes|electrical|engine|fluid|wheel/
/en/cart/  /en/checkout/  /en/my-account/  /en/shop/  /en/shop-3/
/en/good-reviews/  /en/bad-reviews/  /en/neutral-reviews/
/en/bot/  /en/thank-you/
/hello-world/  /category/uncategorized/
```

Faster, if you prefer code — add to the active theme's `functions.php` (child theme if there is
one):

```php
/**
 * Interim: de-index theme demo content and empty WooCommerce pages pending migration.
 * Remove once the site is served statically.
 */
add_action( 'wp_head', function () {
    $noindex_paths = [
        '/en/team', '/en/portfolio', '/en/categories',
        '/en/cart', '/en/checkout', '/en/my-account', '/en/shop',
        '/en/good-reviews', '/en/bad-reviews', '/en/neutral-reviews',
        '/en/bot', '/en/thank-you', '/hello-world', '/category/uncategorized',
    ];
    $current = wp_parse_url( $_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH ) ?: '';
    foreach ( $noindex_paths as $path ) {
        if ( str_starts_with( $current, $path ) ) {
            echo '<meta name="robots" content="noindex, follow">' . "\n";
            return;
        }
    }
}, 1 );
```

### 4b. Point the legacy duplicates at the live pages

Add cross-install canonicals so Google consolidates onto `/en/` instead of guessing. On the
**legacy root install**, in each page's Yoast → Advanced → *Canonical URL*:

| Legacy page | Canonical URL |
|---|---|
| `/about-us/` | `https://flextyres.com/en/about-us/` |
| `/contact-us/` | `https://flextyres.com/en/contact-us/` |
| `/frequently-asked-questions/` | `https://flextyres.com/en/faqs/` |
| `/recycling/` | `https://flextyres.com/en/tire-recycling/` |
| `/our-stock/` | `https://flextyres.com/en/our-stock-new/` |
| `/tyres-for-cars/` | `https://flextyres.com/en/our-stock-new/` |
| `/tyres-for-trucks/` | `https://flextyres.com/en/our-stock-new/` |
| `/request-a-quote/` | `https://flextyres.com/en/request-a-free-quote/` |
| `/home/` | `https://flextyres.com/en/` |
| `/privacy-policy/` | `https://flextyres.com/en/wpautoterms/privacy-policy/` |
| `/wpautoterms/privacy-policy/` | `https://flextyres.com/en/wpautoterms/privacy-policy/` |
| `/wpautoterms/terms-and-conditions/` | `https://flextyres.com/en/wpautoterms/terms-and-conditions/` |
| `/image-gallery/` | `https://flextyres.com/en/our-stock-new/` |
| `/special-offers/` | `https://flextyres.com/en/` |

### 4c. Fix the sitemap declaration

`robots.txt` currently advertises only the stale All in One SEO sitemap. Replace its contents with:

```
User-agent: *
Allow: /

Sitemap: https://flextyres.com/en/sitemap_index.xml
```

### 4d. Fix the site-wide 404

The header and footer menu item "Purchasing Terms & Conditions" links to
`https://flextyres.com/en/Terms & Conditions.pdf`. The unencoded space and ampersand truncate the
href, so it 404s on **every page**. Either percent-encode it
(`Terms%20%26%20Conditions.pdf`) or, better, rename the file to `purchasing-terms.pdf` and update
the menu link. This is a five-minute fix worth doing regardless of migration timing.

### 4e. Immediate security hardening

```php
// Disable XML-RPC — advertised via a pingback link on every page, and a brute-force vector.
add_filter( 'xmlrpc_enabled', '__return_false' );
remove_action( 'wp_head', 'rsd_link' );

// Remove the WordPress version from markup and feeds.
remove_action( 'wp_head', 'wp_generator' );

// Restrict the REST API to authenticated users.
add_filter( 'rest_authentication_errors', function ( $result ) {
    if ( ! empty( $result ) ) {
        return $result;
    }
    if ( ! is_user_logged_in() ) {
        return new WP_Error(
            'rest_not_logged_in',
            'REST API restricted.',
            [ 'status' => 401 ]
        );
    }
    return $result;
} );

// Block user enumeration via ?author=N
add_action( 'template_redirect', function () {
    if ( is_author() || isset( $_GET['author'] ) ) {
        wp_safe_redirect( home_url(), 301 );
        exit;
    }
} );
```

Also, at the host or in `.htaccess`, restrict `/wp-login.php` and `/wp-admin/` to known IP
addresses, and enforce two-factor authentication on every administrator account.

## 5. Step 3 — DNS cutover

The static site carries the complete redirect layer, so the moment DNS points at the new host every
legacy URL redirects correctly. Nothing needs to be configured on WordPress for this.

1. Deploy `dist/` to the static host (see `DEPLOYMENT.md`).
2. Lower the DNS TTL to 300 seconds **24–48 hours beforehand**, so a rollback is fast.
3. Point the apex A/ALIAS record at the static host.
4. Point `www` at a 301 to the apex.
5. Confirm the certificate is issued and HTTPS resolves.
6. Restore the normal TTL after 48 hours of stable traffic.

## 6. Step 4 — Verify in production

```bash
# Legacy duplicates now redirect
curl -sI https://flextyres.com/about-us/          # 301 → /about/
curl -sI https://flextyres.com/en/about-us/       # 301 → /about/
curl -sI https://flextyres.com/tyres-for-trucks/  # 301 → /tyres/truck-tyres/

# Fabricated content redirects to the real equivalent
curl -sI https://flextyres.com/en/team/waylon-dalton/   # 301 → /about/
curl -sI https://flextyres.com/en/portfolio/oil-change/ # 301 → /services/

# WordPress artefacts are gone, not moved
curl -sI https://flextyres.com/hello-world/       # 410
curl -sI https://flextyres.com/feed/              # 410

# The admin surface no longer exists
curl -sI https://flextyres.com/wp-login.php       # 404
curl -sI https://flextyres.com/xmlrpc.php         # 404
curl -sI https://flextyres.com/wp-json/           # 404

# The document that used to 404 on every page
curl -sI https://flextyres.com/legal/purchasing-terms/  # 200

# robots.txt declares the correct sitemap
curl -s https://flextyres.com/robots.txt | grep -i sitemap
```

All 83 redirect rules are verified against the build at compile time
(`scripts/generate-redirects.mjs`), so a failure here indicates a host-configuration problem, not a
missing rule.

## 7. Step 5 — Archive before deleting

Do not skip this. Take a complete, restorable copy and store it off the server.

```bash
# Database
wp db export flextyres-final-$(date +%F).sql --add-drop-table

# Files: uploads, themes, plugins, wp-config
tar czf flextyres-files-$(date +%F).tar.gz \
    wp-content/uploads wp-content/themes wp-content/plugins wp-config.php

# Verify the archives before you rely on them
gzip -t flextyres-files-*.tar.gz && echo "archive OK"
head -5 flextyres-final-*.sql
```

Keep both for **at least 12 months**. Belgian commercial and tax law requires transaction records
to be retained; if any order correspondence exists only in WordPress, it must survive the
decommission.

Confirm before deleting anything:

- [ ] No order or customer data exists only in the WordPress database
- [ ] No Contact Form 7 submission log holds inquiries that have not been actioned
- [ ] The media library contains no image the new site needs — 64 were migrated; check for later uploads
- [ ] No email account or DNS record depends on the WordPress host
- [ ] The archives restore successfully on a test server

## 8. Step 6 — Take WordPress offline

Once DNS has been stable for **7 days** and Search Console shows the new pages being indexed:

1. **Disable public access first**, do not delete. Suspend the vhost, or move the document root:
   ```bash
   mv /var/www/flextyres /var/www/flextyres.retired
   ```
   Reversible in seconds if a problem surfaces.
2. Wait a further **30 days**, monitoring Search Console for 404s and unexpected traffic.
3. Only then delete the files and drop the database, keeping the archives from §7.
4. Cancel the WordPress hosting plan and revoke any API keys and FTP or SSH accounts tied to it.

## 9. Step 7 — Search Console

1. Keep the old property; do not delete it.
2. Submit `https://flextyres.com/sitemap-index.xml`.
3. Use **Removals → Temporarily remove** for the fabricated `/en/team/*` and `/en/portfolio/*` URLs
   to accelerate their disappearance while the 301s take effect.
4. Watch Coverage weekly for four weeks. Redirect errors point at host configuration; 404s point at
   a URL missing from the redirect map — add it to `src/data/redirects.ts` and redeploy.
5. Expect substantial re-indexing within 4–8 weeks.

## 10. Rollback

Until §8 step 3, rollback is repointing DNS at the WordPress host. Because the redirect layer lives
on the static host rather than in WordPress, reverting restores the previous behaviour exactly.

After the files are deleted, rollback means restoring from the §7 archives — slower, and the reason
the 30-day window exists.

## 11. What is resolved on completion

| Problem | Resolution |
|---|---|
| Two indexable sites competing | One canonical site; 83 single-hop redirects |
| 21 fabricated indexable pages | 301 to real equivalents; removed from the index |
| 14 legacy duplicate pages | 301 to their consolidated replacements |
| WordPress core, theme and 19+ plugins to patch | Gone — static files have no runtime |
| Public `/wp-login.php` | Gone |
| `xmlrpc.php` advertised on every page | Gone |
| Exposed REST API | Gone |
| Slider Revolution and other CVE-prone plugins | Gone |
| `robots.txt` declaring a stale sitemap | Correct sitemap declared |
| Purchasing Terms 404 on every page | Terms served as HTML at `/legal/purchasing-terms/` |
| No security headers | 8 headers including a hash-pinned CSP |

## 12. Who does what

| Task | Needs |
|---|---|
| §4 interim mitigations | WordPress administrator |
| §5 DNS cutover | Domain registrar / DNS access |
| §6 verification | Anyone with a terminal |
| §7 archive | Server SSH or hosting control panel |
| §8 decommission | Hosting administrator |
| §9 Search Console | Verified property owner |

The static site and its redirect layer are complete and verified. Everything remaining in this
document is an operations task on infrastructure this project has no access to.
