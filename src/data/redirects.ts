/**
 * Redirect map: every public URL the old flextyres.com served, mapped to its final destination
 * on the rebuilt site. Single-hop only — no chains, no loops.
 *
 * `410` marks content that was fabricated or is a platform artefact with no equivalent page.
 * Redirecting those to a real page would be a soft misdirection; 410 Gone is the honest status.
 *
 * Generated into platform configs by scripts/generate-redirects.mjs.
 */

export interface Redirect {
  from: string;
  to: string;
  status: 301 | 410;
  reason: string;
}

export const redirects: Redirect[] = [
  // ── Language prefix: the whole live install moves to the root ───────────────────────────
  {
    from: '/en/',
    to: '/',
    status: 301,
    reason: 'Single-language site; the /en/ prefix is removed',
  },
  { from: '/en', to: '/', status: 301, reason: 'Trailing-slash variant of the above' },
  { from: '/home/', to: '/', status: 301, reason: 'Legacy duplicate homepage' },

  // ── Company ─────────────────────────────────────────────────────────────────────────────
  {
    from: '/en/about-us/',
    to: '/about/',
    status: 301,
    reason: 'Slug shortened; deduplicates against the legacy /about-us/',
  },
  {
    from: '/about-us/',
    to: '/about/',
    status: 301,
    reason: 'Legacy duplicate; export destinations rescued to /export-markets/',
  },
  { from: '/en/contact-us/', to: '/contact/', status: 301, reason: 'Slug shortened' },
  {
    from: '/contact-us/',
    to: '/contact/',
    status: 301,
    reason: 'Legacy duplicate with a conflicting address',
  },
  { from: '/en/franchise-opportunity/', to: '/franchise/', status: 301, reason: 'Slug shortened' },

  // ── Tyres ───────────────────────────────────────────────────────────────────────────────
  {
    from: '/en/our-stock-new/',
    to: '/tyres/',
    status: 301,
    reason: 'Thin stock page replaced by a real product hub',
  },
  {
    from: '/en/our-stock/',
    to: '/tyres/',
    status: 301,
    reason: 'Previously chained via /en/our-stock-new/; now direct',
  },
  {
    from: '/our-stock/',
    to: '/gallery/',
    status: 301,
    reason: 'Legacy page was 45 photographs and 18 words',
  },
  { from: '/image-gallery/', to: '/gallery/', status: 301, reason: 'Legacy gallery consolidated' },
  {
    from: '/image-gallery',
    to: '/gallery/',
    status: 301,
    reason: 'Non-trailing-slash variant, previously a chain',
  },
  {
    from: '/tyres-for-cars/',
    to: '/tyres/car-tyres/',
    status: 301,
    reason: 'Legacy car page; grades and sizes carried across',
  },
  {
    from: '/tyres-for-trucks/',
    to: '/tyres/truck-tyres/',
    status: 301,
    reason: 'Legacy truck page; its unique grading is the source for the new page',
  },
  {
    from: '/en/tire-recycling/',
    to: '/tyre-recycling/',
    status: 301,
    reason: 'Consistent British spelling in new paths',
  },
  { from: '/recycling/', to: '/tyre-recycling/', status: 301, reason: 'Legacy duplicate' },

  // ── Services ────────────────────────────────────────────────────────────────────────────
  {
    from: '/en/our-services/',
    to: '/services/',
    status: 301,
    reason: 'Slug shortened; one page becomes a hub plus four detail pages',
  },
  {
    from: '/en/tripling-techniques/',
    to: '/services/doubling-and-tripling/',
    status: 301,
    reason: 'Moved from under About into Services, where it belongs',
  },

  // ── Quote and ordering ──────────────────────────────────────────────────────────────────
  {
    from: '/en/request-a-free-quote/',
    to: '/request-a-quote/',
    status: 301,
    reason: 'Slug shortened; deduplicates against the legacy /request-a-quote/',
  },
  {
    from: '/en/quote-car-tires/',
    to: '/request-a-quote/car-tyres/',
    status: 301,
    reason: 'Nested under the quote hub; British spelling',
  },
  {
    from: '/en/quote-truck-tires/',
    to: '/request-a-quote/truck-tyres/',
    status: 301,
    reason: 'Nested under the quote hub; British spelling',
  },
  { from: '/en/thank-you/', to: '/thank-you/', status: 301, reason: 'Language prefix removed' },

  // ── Offers ──────────────────────────────────────────────────────────────────────────────
  {
    from: '/en/sprinter-delivery-180-tires/',
    to: '/offers/sprinter-van-delivery/',
    status: 301,
    reason: 'Orphaned page given a home under /offers/',
  },
  {
    from: '/special-offers/',
    to: '/offers/',
    status: 301,
    reason: 'Legacy page was empty; /offers/ now has real content',
  },

  // ── FAQs ────────────────────────────────────────────────────────────────────────────────
  { from: '/en/faqs/', to: '/faqs/', status: 301, reason: 'Language prefix removed' },
  {
    from: '/frequently-asked-questions/',
    to: '/faqs/',
    status: 301,
    reason: 'Legacy duplicate of the same Q&A',
  },
  {
    from: '/fr/',
    to: '/faqs/',
    status: 301,
    reason: 'Existing misconfigured redirect preserved to its final destination',
  },

  // ── Legal ───────────────────────────────────────────────────────────────────────────────
  {
    from: '/en/wpautoterms/',
    to: '/legal/',
    status: 301,
    reason: 'Plugin archive replaced by a legal index',
  },
  { from: '/wpautoterms/', to: '/legal/', status: 301, reason: 'Legacy plugin archive' },
  {
    from: '/en/wpautoterms/terms-and-conditions/',
    to: '/legal/terms-and-conditions/',
    status: 301,
    reason: 'Plugin path removed',
  },
  {
    from: '/wpautoterms/terms-and-conditions/',
    to: '/legal/terms-and-conditions/',
    status: 301,
    reason: 'Legacy duplicate',
  },
  {
    from: '/en/wpautoterms/privacy-policy/',
    to: '/legal/privacy-policy/',
    status: 301,
    reason: 'Plugin path removed',
  },
  {
    from: '/wpautoterms/privacy-policy/',
    to: '/legal/privacy-policy/',
    status: 301,
    reason: 'Legacy duplicate',
  },
  {
    from: '/privacy-policy/',
    to: '/legal/privacy-policy/',
    status: 301,
    reason: 'Third privacy policy; owner must confirm which text governs (C-18)',
  },

  // ── Documents: the purchasing terms link 404d on every page of the old site ─────────────
  {
    from: '/en/Terms%20&%20Conditions.pdf',
    to: '/documents/flextyres-purchasing-terms.pdf',
    status: 301,
    reason: 'Renamed; the unencoded ampersand made the old link a site-wide 404',
  },
  {
    from: '/en/Terms & Conditions.pdf',
    to: '/documents/flextyres-purchasing-terms.pdf',
    status: 301,
    reason: 'Unencoded variant of the above',
  },
  {
    from: '/EUSIZESFLEX.xlsx',
    to: '/documents/flextyres-stock-list.xlsx',
    status: 301,
    reason: 'Renamed descriptively; content byte-identical',
  },
  {
    from: '/EUSIZESFLEX.pdf',
    to: '/documents/flextyres-stock-list.pdf',
    status: 301,
    reason: 'Renamed descriptively; content byte-identical',
  },

  // ── WooCommerce shell: no products ever existed ─────────────────────────────────────────
  {
    from: '/en/shop/',
    to: '/tyres/',
    status: 301,
    reason: 'Empty WooCommerce page; /tyres/ is the real product hub',
  },
  { from: '/en/shop-3/', to: '/tyres/', status: 301, reason: 'Duplicate of the above' },
  {
    from: '/en/cart/',
    to: '/request-a-quote/',
    status: 301,
    reason: 'Empty cart; quoting is the real purchase path',
  },
  { from: '/en/checkout/', to: '/request-a-quote/', status: 301, reason: 'Empty checkout' },
  {
    from: '/en/my-account/',
    to: '/contact/',
    status: 301,
    reason: 'Empty account page that occupied the primary nav',
  },

  // ── Review-gating funnel (violates Google review policy) ────────────────────────────────
  {
    from: '/en/good-reviews/',
    to: '/about/',
    status: 301,
    reason: 'Review-gating page removed; testimonials live on /about/',
  },
  {
    from: '/en/bad-reviews/',
    to: '/contact/',
    status: 301,
    reason: 'Review-gating page removed; one feedback route for everyone',
  },
  {
    from: '/en/neutral-reviews/',
    to: '/contact/',
    status: 301,
    reason: 'Review-gating page removed',
  },

  // ── Theme demo: fabricated services (autoser theme) ─────────────────────────────────────
  {
    from: '/en/portfolio/',
    to: '/services/',
    status: 301,
    reason: 'Fabricated service archive; real services are at /services/',
  },
  {
    from: '/en/portfolio/brake-fluid-exchange/',
    to: '/services/',
    status: 301,
    reason: 'Theme demo content — FlexTyres does not service vehicles',
  },
  {
    from: '/en/portfolio/checking-car-engine/',
    to: '/services/',
    status: 301,
    reason: 'Theme demo content',
  },
  {
    from: '/en/portfolio/electrical-system/',
    to: '/services/',
    status: 301,
    reason: 'Theme demo content',
  },
  {
    from: '/en/portfolio/oil-change/',
    to: '/services/',
    status: 301,
    reason: 'Theme demo content',
  },
  {
    from: '/en/portfolio/tune-ups-system/',
    to: '/services/',
    status: 301,
    reason: 'Theme demo content',
  },
  {
    from: '/en/portfolio/wheel-alignment/',
    to: '/services/',
    status: 301,
    reason: 'Theme demo content',
  },
  {
    from: '/en/categories/brakes/',
    to: '/services/',
    status: 301,
    reason: 'Empty taxonomy archive for the demo portfolio',
  },
  {
    from: '/en/categories/electrical/',
    to: '/services/',
    status: 301,
    reason: 'Empty taxonomy archive',
  },
  {
    from: '/en/categories/engine/',
    to: '/services/',
    status: 301,
    reason: 'Empty taxonomy archive',
  },
  {
    from: '/en/categories/fluid/',
    to: '/services/',
    status: 301,
    reason: 'Empty taxonomy archive',
  },
  {
    from: '/en/categories/wheel/',
    to: '/services/',
    status: 301,
    reason: 'Empty taxonomy archive',
  },

  // ── Theme demo: fabricated staff (autoser theme) ────────────────────────────────────────
  {
    from: '/en/team/',
    to: '/about/',
    status: 301,
    reason: 'Fabricated staff archive; no real named staff are published',
  },
  {
    from: '/en/team/waylon-dalton/',
    to: '/about/',
    status: 301,
    reason: 'Theme demo persona, not a FlexTyres employee',
  },
  {
    from: '/en/team/waylon-dalton-2/',
    to: '/about/',
    status: 301,
    reason: 'Duplicate theme demo persona',
  },
  { from: '/en/team/sophie-lana/', to: '/about/', status: 301, reason: 'Theme demo persona' },
  {
    from: '/en/team/sophie-lana-2/',
    to: '/about/',
    status: 301,
    reason: 'Duplicate theme demo persona',
  },
  { from: '/en/team/james-hoult/', to: '/about/', status: 301, reason: 'Theme demo persona' },
  {
    from: '/en/team/james-hoult-2/',
    to: '/about/',
    status: 301,
    reason: 'Duplicate theme demo persona',
  },
  { from: '/en/team/oscar-helman/', to: '/about/', status: 301, reason: 'Theme demo persona' },
  {
    from: '/en/team/oscar-helman-2/',
    to: '/about/',
    status: 301,
    reason: 'Duplicate theme demo persona',
  },

  // ── Empty pages ─────────────────────────────────────────────────────────────────────────
  { from: '/en/bot/', to: '/', status: 301, reason: 'Empty page titled "Bot"' },

  // ── Divi Library taxonomies leaked into the public sitemap ──────────────────────────────
  {
    from: '/layout_category/sections/',
    to: '/',
    status: 301,
    reason: 'Page-builder artefact; previously chained via / to /en/',
  },
  { from: '/layout_type/section/', to: '/', status: 301, reason: 'Page-builder artefact' },
  { from: '/layout_type/row/', to: '/', status: 301, reason: 'Page-builder artefact' },
  { from: '/module_width/regular/', to: '/', status: 301, reason: 'Page-builder artefact' },
  { from: '/scope/global/', to: '/', status: 301, reason: 'Page-builder artefact' },
  { from: '/scope/not_global/', to: '/', status: 301, reason: 'Page-builder artefact' },

  // ── WordPress defaults: gone, not moved ─────────────────────────────────────────────────
  {
    from: '/hello-world/',
    to: '',
    status: 410,
    reason: 'WordPress default post with a default comment; no equivalent content exists',
  },
  {
    from: '/category/uncategorized/',
    to: '',
    status: 410,
    reason: 'Archive containing only the default post',
  },
  {
    from: '/author/flextyres/',
    to: '',
    status: 410,
    reason: 'Author archive; the platform it belonged to is gone',
  },
  {
    from: '/en/author/flextyres/',
    to: '',
    status: 410,
    reason: 'Author archive; previously a redirect chain',
  },
  {
    from: '/2018/12/',
    to: '',
    status: 410,
    reason: 'Date archive containing only the default post',
  },
  {
    from: '/feed/',
    to: '',
    status: 410,
    reason: 'RSS feed carrying only the default post; the new site publishes no feed',
  },
  {
    from: '/comments/feed/',
    to: '',
    status: 410,
    reason: 'Comment feed; the new site has no comments',
  },
];

/**
 * Old paths that are also live paths on the new site, so they need no redirect at all:
 *   /request-a-quote/  — the legacy quote hub slug is reused as the canonical quote hub
 *   /thank-you/        — unchanged
 * Listed here so the audit can distinguish "deliberately unmapped" from "forgotten".
 */
export const UNCHANGED_PATHS = ['/request-a-quote/', '/thank-you/'] as const;
