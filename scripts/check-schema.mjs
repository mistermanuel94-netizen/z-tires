/**
 * Structured-data audit over dist/.
 *
 * Validates that every JSON-LD graph:
 *   - parses
 *   - resolves every internal @id reference
 *   - carries a consistent Organization identity across every page
 *   - emits a BreadcrumbList whose items match the visible breadcrumb trail
 *   - emits FAQPage only where the questions are visible in the HTML
 *   - contains no property the public source does not support (ratings, prices, availability,
 *     founding dates, employees, awards)
 *   - references only URLs that exist in the build
 *
 * Run: node scripts/check-schema.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const DIST = 'dist';
const SITE = 'https://flextyres.com';

const errors = [];
const typeCounts = new Map();

/** Properties that would assert something the public flextyres.com content does not support. */
const FORBIDDEN = [
  'aggregateRating',
  'ratingValue',
  'reviewCount',
  'ratingCount',
  'review',
  'price',
  'priceCurrency',
  'lowPrice',
  'highPrice',
  'offers',
  'availability',
  'foundingDate',
  'numberOfEmployees',
  'employee',
  'founder',
  'award',
  'hasCredential',
  'makesOffer',
  'vatID',
  'taxID',
  'duns',
  'globalLocationNumber',
];

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const strip = (s) =>
  s
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const urlExists = (u) => {
  if (!u.startsWith(SITE)) return true; // external, not our problem to verify here
  let p = u.slice(SITE.length).split('#')[0];
  if (p === '' || p === '/') return fs.existsSync(path.join(DIST, 'index.html'));
  if (/\.[a-z0-9]+$/i.test(p)) return fs.existsSync(path.join(DIST, p));
  return fs.existsSync(path.join(DIST, p, 'index.html'));
};

const files = walk(DIST);
let orgFingerprint = null;

for (const f of files) {
  const html = fs.readFileSync(f, 'utf8');
  const route =
    '/' +
    path
      .relative(DIST, f)
      .replace(/\\/g, '/')
      .replace(/index\.html$/, '');
  const text = strip(html);
  const fail = (m) => errors.push(`${route}: ${m}`);
  const is404 = f.endsWith('404.html');

  const blocks = [
    ...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g),
  ];
  if (blocks.length === 0) {
    fail('no JSON-LD block');
    continue;
  }
  if (blocks.length > 1) fail(`${blocks.length} JSON-LD blocks — use one graph per page`);

  for (const b of blocks) {
    let data;
    try {
      data = JSON.parse(b[1]);
    } catch (e) {
      fail(`JSON-LD does not parse: ${String(e).slice(0, 100)}`);
      continue;
    }

    if (data['@context'] !== 'https://schema.org') fail('@context is not https://schema.org');

    const nodes = data['@graph'] ?? [data];

    // @id may be declared on a nested node (e.g. Organization.logo), which is still a valid
    // target for a {"@id": …} reference elsewhere in the graph.
    const ids = new Set();
    const collectIds = (v) => {
      if (Array.isArray(v)) return v.forEach(collectIds);
      if (v && typeof v === 'object') {
        if (typeof v['@id'] === 'string' && Object.keys(v).length > 1) ids.add(v['@id']);
        Object.values(v).forEach(collectIds);
      }
    };
    collectIds(nodes);

    for (const n of nodes) {
      const t = Array.isArray(n['@type']) ? n['@type'].join('/') : n['@type'];
      if (!t) fail('a node has no @type');
      typeCounts.set(t, (typeCounts.get(t) ?? 0) + 1);
    }

    // ── forbidden properties ──────────────────────────────────────────────
    const flat = JSON.stringify(data);
    for (const prop of FORBIDDEN) {
      if (new RegExp(`"${prop}"\\s*:`).test(flat)) {
        fail(`emits "${prop}", which the public source does not support`);
      }
    }

    // ── @id references must resolve within the graph ──────────────────────
    const refs = [...flat.matchAll(/\{"@id":"([^"]+)"\}/g)].map((m) => m[1]);
    for (const r of new Set(refs)) {
      if (!ids.has(r)) fail(`@id reference "${r}" does not resolve inside the graph`);
    }

    // ── URLs must exist ───────────────────────────────────────────────────
    for (const m of flat.matchAll(/"(?:url|item|contentUrl)":"(https:\/\/flextyres\.com[^"]*)"/g)) {
      if (!urlExists(m[1])) fail(`references a URL that does not exist in the build: ${m[1]}`);
    }

    // ── Organization identity must be byte-identical site-wide ────────────
    const org = nodes.find((n) => n['@type'] === 'Organization');
    if (!org) fail('no Organization node');
    else {
      const fp = JSON.stringify(org);
      if (orgFingerprint === null) orgFingerprint = fp;
      else if (fp !== orgFingerprint) fail('Organization node differs from other pages');
      if (!org.address) fail('Organization has no address');
      if (!org.telephone) fail('Organization has no telephone');
      if (!org.openingHoursSpecification) fail('Organization has no opening hours');
    }

    // ── BreadcrumbList must match the visible trail ───────────────────────
    const bc = nodes.find((n) => n['@type'] === 'BreadcrumbList');
    if (bc) {
      const crumbNames = bc.itemListElement.map((i) => i.name);
      const visibleNav = html.match(/<nav class="crumbs"[\s\S]*?<\/nav>/);
      if (!visibleNav && crumbNames.length > 1) {
        fail('emits a BreadcrumbList but renders no visible breadcrumb');
      } else if (visibleNav) {
        const visible = strip(visibleNav[0]);
        for (const name of crumbNames) {
          if (!visible.includes(name)) fail(`breadcrumb "${name}" is in schema but not visible`);
        }
      }
      for (const i of bc.itemListElement) {
        if (!urlExists(i.item)) fail(`breadcrumb item URL does not exist: ${i.item}`);
      }
    }

    // ── FAQPage questions must be visible on the page ─────────────────────
    const faq = nodes.find((n) => n['@type'] === 'FAQPage');
    if (faq) {
      for (const q of faq.mainEntity) {
        const probe = strip(q.name).slice(0, 40);
        if (probe && !text.includes(probe)) {
          fail(`FAQ question is in schema but not visible on the page: "${q.name}"`);
        }
        const ans = strip(q.acceptedAnswer.text).slice(0, 40);
        if (ans && !text.includes(ans)) {
          fail(
            `FAQ answer is in schema but not visible on the page: "${q.acceptedAnswer.text.slice(0, 50)}…"`,
          );
        }
      }
    }

    // ── HowTo steps must be visible ───────────────────────────────────────
    const howto = nodes.find((n) => n['@type'] === 'HowTo');
    if (howto) {
      for (const s of howto.step) {
        const probe = strip(s.name).slice(0, 30);
        if (probe && !text.includes(probe)) fail(`HowTo step not visible on the page: "${s.name}"`);
      }
    }

    // ── WebPage name/description should match the page's own metadata ─────
    // The 404 is served at arbitrary URLs and deliberately declares no WebPage node.
    const wp = nodes.find((n) => ['WebPage', 'ContactPage', 'AboutPage'].includes(n['@type']));
    if (is404) {
      if (wp) fail('the 404 page must not declare a WebPage node');
    } else if (!wp) {
      fail('no WebPage node');
    } else if (wp.url && wp.url !== SITE + route) {
      fail(`WebPage.url "${wp.url}" does not match the page route "${SITE + route}"`);
    }
  }
}

console.log(`check-schema: audited ${files.length} pages\n`);
console.log('node types emitted:');
for (const [t, n] of [...typeCounts].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(3)} x ${t}`);
}

if (errors.length) {
  console.error(`\n${errors.length} error(s):`);
  for (const e of errors) console.error('  ✗ ' + e);
  process.exit(1);
}
console.log('\ncheck-schema: PASS');
