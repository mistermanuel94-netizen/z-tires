/**
 * Post-build SEO audit. Fails the build on anything that would ship a defect the old site had.
 *
 * Checks every HTML file in dist/ for:
 *   - exactly one <h1>
 *   - a title, unique across the site, within length bounds
 *   - a meta description, unique across the site, within length bounds
 *   - a self-referential canonical
 *   - correct robots directives (noindex pages must not be in the sitemap, and vice versa)
 *   - Open Graph and Twitter completeness
 *   - valid, parseable JSON-LD containing Organization and WebSite
 *   - a logical heading hierarchy with no skipped levels
 *   - alt text on every <img>, and no keyword-stuffed alt
 *   - width and height on every <img>
 *   - lang on <html>
 *   - no orphan pages (every sitemap URL has at least one inbound internal link)
 *
 * Run: node scripts/check-seo.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const DIST = 'dist';
const SITE = 'https://flextyres.com';

const errors = [];
const warnings = [];
const fail = (f, m) => errors.push(`${f}: ${m}`);
const warn = (f, m) => warnings.push(`${f}: ${m}`);

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const files = walk(DIST);
if (files.length === 0) {
  console.error('check-seo: no HTML in dist/ — run astro build first.');
  process.exit(1);
}

const routeOf = (f) =>
  '/' +
  path
    .relative(DIST, f)
    .replace(/\\/g, '/')
    .replace(/index\.html$/, '');

// Sitemap URLs
const sitemapFiles = fs.readdirSync(DIST).filter((f) => /^sitemap-\d+\.xml$/.test(f));
const sitemapUrls = new Set();
for (const sf of sitemapFiles) {
  const xml = fs.readFileSync(path.join(DIST, sf), 'utf8');
  for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) sitemapUrls.add(m[1]);
}

const titles = new Map();
const descs = new Map();
const inboundLinks = new Map();
const pages = [];

for (const f of files) {
  const html = fs.readFileSync(f, 'utf8');
  const route = routeOf(f);
  const url = SITE + route;

  const pick = (re) => {
    const m = html.match(re);
    return m ? m[1] : null;
  };

  const title = pick(/<title>([\s\S]*?)<\/title>/);
  const desc = pick(/<meta name="description" content="([^"]*)"/);
  const canon = pick(/<link rel="canonical" href="([^"]*)"/);
  const robots = pick(/<meta name="robots" content="([^"]*)"/);
  const lang = pick(/<html lang="([^"]*)"/);
  const ogTitle = pick(/<meta property="og:title" content="([^"]*)"/);
  const ogDesc = pick(/<meta property="og:description" content="([^"]*)"/);
  const ogImage = pick(/<meta property="og:image" content="([^"]*)"/);
  const ogUrl = pick(/<meta property="og:url" content="([^"]*)"/);
  const twCard = pick(/<meta name="twitter:card" content="([^"]*)"/);

  const noindex = Boolean(robots && robots.includes('noindex'));
  const is404 = route === '/404/' || route === '/404.html' || f.endsWith('404.html');

  pages.push({ f, route, url, noindex, is404 });

  // ── lang ─────────────────────────────────────────────────────────────────────
  if (!lang) fail(route, 'missing lang on <html>');

  // ── title ────────────────────────────────────────────────────────────────────
  if (!title) fail(route, 'missing <title>');
  else {
    if (title.length > 62) fail(route, `title is ${title.length} chars (max 62)`);
    if (title.length < 15) fail(route, `title is only ${title.length} chars`);
    const prev = titles.get(title);
    if (prev) fail(route, `duplicate title, also on ${prev}`);
    titles.set(title, route);
  }

  // ── description ──────────────────────────────────────────────────────────────
  if (!desc) fail(route, 'missing meta description');
  else {
    if (desc.length < 70 || desc.length > 158)
      fail(route, `description is ${desc.length} chars (want 70-158)`);
    const prev = descs.get(desc);
    if (prev) fail(route, `duplicate description, also on ${prev}`);
    descs.set(desc, route);
  }

  // ── canonical ────────────────────────────────────────────────────────────────
  // The 404 page deliberately emits none: an error page is not a document at a URL.
  if (is404) {
    if (canon) fail(route, 'the 404 page must not declare a canonical');
  } else if (!canon) fail(route, 'missing canonical');
  else if (canon !== url) fail(route, `canonical "${canon}" does not match its own URL "${url}"`);

  // ── robots vs sitemap ────────────────────────────────────────────────────────
  if (!robots) fail(route, 'missing robots meta');
  if (noindex && sitemapUrls.has(url)) fail(route, 'is noindex but appears in the sitemap');
  if (!noindex && !is404 && !sitemapUrls.has(url))
    fail(route, 'is indexable but missing from the sitemap');

  // ── social ───────────────────────────────────────────────────────────────────
  const required = {
    'og:title': ogTitle,
    'og:description': ogDesc,
    'og:image': ogImage,
    'twitter:card': twCard,
  };
  if (!is404) required['og:url'] = ogUrl;
  for (const [k, v] of Object.entries(required)) {
    if (!v) fail(route, `missing ${k}`);
  }
  if (!is404 && ogUrl && ogUrl !== url)
    fail(route, `og:url "${ogUrl}" does not match the canonical`);

  // ── headings ─────────────────────────────────────────────────────────────────
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  if (h1s.length === 0) fail(route, 'no <h1>');
  else if (h1s.length > 1) fail(route, `${h1s.length} <h1> elements (want exactly 1)`);

  const levels = [...html.matchAll(/<h([1-6])\b/gi)].map((m) => Number(m[1]));
  let prevLevel = 0;
  for (const l of levels) {
    if (prevLevel && l > prevLevel + 1) {
      warn(route, `heading level jumps from h${prevLevel} to h${l}`);
      break;
    }
    prevLevel = l;
  }

  // ── images ───────────────────────────────────────────────────────────────────
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = m[0];
    const altM = tag.match(/\salt="([^"]*)"/);
    if (!altM) {
      fail(route, `<img> with no alt attribute: ${tag.slice(0, 110)}`);
      continue;
    }
    const alt = altM[1];
    if (alt.length > 0) {
      const words = alt.toLowerCase().split(/\s+/).filter(Boolean);
      const counts = {};
      for (const w of words) counts[w] = (counts[w] || 0) + 1;
      const stuffed = Object.entries(counts).filter(([w, n]) => n > 2 && w.length > 3);
      if (stuffed.length) warn(route, `possible keyword stuffing in alt: "${alt}"`);
      if (alt.length > 160) warn(route, `alt text is ${alt.length} chars: "${alt.slice(0, 60)}…"`);
    }
    if (!/\swidth="\d+"/.test(tag) || !/\sheight="\d+"/.test(tag)) {
      fail(route, `<img> without width/height (layout shift risk): ${tag.slice(0, 110)}`);
    }
  }

  // ── JSON-LD ──────────────────────────────────────────────────────────────────
  const ld = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
  if (ld.length === 0) fail(route, 'no JSON-LD');
  for (const block of ld) {
    let parsed;
    try {
      parsed = JSON.parse(block[1]);
    } catch (e) {
      fail(route, `JSON-LD does not parse: ${String(e).slice(0, 90)}`);
      continue;
    }
    const nodes = parsed['@graph'] ?? [parsed];
    const types = nodes.flatMap((n) => (Array.isArray(n['@type']) ? n['@type'] : [n['@type']]));
    if (!types.includes('Organization')) fail(route, 'JSON-LD is missing an Organization node');
    if (!types.includes('WebSite')) fail(route, 'JSON-LD is missing a WebSite node');
    // Forbidden: fabricated trust signals.
    const flat = JSON.stringify(parsed);
    for (const banned of [
      'aggregateRating',
      'ratingValue',
      'reviewCount',
      'priceCurrency',
      'availability',
    ]) {
      if (flat.includes(`"${banned}"`))
        fail(route, `JSON-LD contains "${banned}", which the public source does not support`);
    }
  }

  // ── internal links, for the orphan check ─────────────────────────────────────
  for (const m of html.matchAll(/<a\b[^>]*href="([^"#?]+)"/gi)) {
    let href = m[1];
    if (href.startsWith(SITE)) href = href.slice(SITE.length);
    if (!href.startsWith('/')) continue;
    if (href === route) continue; // self-links do not count as inbound
    if (!inboundLinks.has(href)) inboundLinks.set(href, new Set());
    inboundLinks.get(href).add(route);
  }
}

// ── orphans ────────────────────────────────────────────────────────────────────
for (const p of pages) {
  if (p.noindex || p.is404 || p.route === '/') continue;
  const inbound = inboundLinks.get(p.route);
  if (!inbound || inbound.size === 0) fail(p.route, 'orphan — no other page links to it');
}

// ── report ─────────────────────────────────────────────────────────────────────
console.log(`check-seo: audited ${files.length} pages, ${sitemapUrls.size} sitemap URLs`);
if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`);
  for (const w of warnings) console.log('  ! ' + w);
}
if (errors.length) {
  console.error(`\n${errors.length} error(s):`);
  for (const e of errors) console.error('  ✗ ' + e);
  process.exit(1);
}
console.log('check-seo: PASS');
