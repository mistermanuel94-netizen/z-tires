import type { APIRoute } from 'astro';
import { site } from '~/data/site';

/**
 * robots.txt.
 *
 * Deliberately permissive. Everything on this site is public marketing and product information
 * that FlexTyres wants found — by search engines and by the AI assistants buyers increasingly use
 * to shortlist suppliers. Nothing here is paywalled, licensed or personal.
 *
 * Two rules only:
 *  - `/thank-you/` and `/legal/` are excluded from the sitemap and carry `noindex`; robots.txt does
 *    NOT disallow them, because a disallowed URL cannot be crawled and therefore its noindex can
 *    never be read. The meta tag is the correct control.
 *  - No CSS, JS, image or font path is blocked. Rendering must not be impaired.
 *
 * If FlexTyres later decides to opt out of AI training corpora, add targeted `User-agent` blocks
 * here — see docs/SECURITY_AUDIT.md for the current crawler list and the trade-off.
 */
export const GET: APIRoute = () => {
  const body = `# https://flextyres.com/
# Wholesale used car and truck tyres.

User-agent: *
Allow: /

# Nothing on this site requires crawl restrictions. CSS, JavaScript, images, fonts and
# documents are all crawlable so pages render correctly for every crawler.
#
# Utility pages (/thank-you/, /legal/) carry a noindex meta tag rather than a Disallow,
# so crawlers can read the directive.

Sitemap: ${site.url}/sitemap-index.xml
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
