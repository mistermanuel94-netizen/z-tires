/**
 * Performance budget enforcement over dist/.
 *
 * Budgets are set against the measured baseline of the live WordPress site (8.79 MB and 98
 * requests on the homepage alone). They are deliberately tight: every one of them is currently
 * met with room to spare, so a regression is visible before it ships rather than after.
 *
 * Run: node scripts/check-budget.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const DIST = 'dist';

const BUDGET = {
  /** Brotli-compressed HTML, per page. The live baseline was 148 KB uncompressed. */
  htmlBrotliKB: 30,
  /** Uncompressed inline CSS per page. The live baseline was 1,547 KB across 23 files. */
  cssKB: 40,
  /** Client-side JS per page, inline plus external. The live baseline was 2,404 KB across 39 files. */
  jsKB: 5,
  /** Blocking sub-resource requests: stylesheets plus scripts. The live baseline was 62. */
  blockingRequests: 0,
  /** Self-hosted fonts, whole site. The live baseline loaded 26 faces from Google Fonts. */
  fontKB: 100,
  /** Largest single emitted image. */
  maxImageKB: 320,
  /**
   * Whole site, excluding the mirrored source documents which are byte-identical originals.
   * This counts every responsive variant of every image; a visitor downloads one variant per
   * image, so it is a deployment-size guard, not a page-weight guard. Page weight is covered by
   * the per-page budgets above.
   */
  totalSiteMB: 12,
};

function walk(dir, filter = () => true) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p, filter));
    else if (filter(p)) out.push(p);
  }
  return out;
}

const errors = [];
const rows = [];

const htmlFiles = walk(DIST, (p) => p.endsWith('.html'));
if (htmlFiles.length === 0) {
  console.error('check-budget: no HTML in dist/ — run astro build first.');
  process.exit(1);
}

let worstHtml = 0;
let worstCss = 0;
let worstJs = 0;

for (const f of htmlFiles) {
  const html = fs.readFileSync(f, 'utf8');
  const route =
    '/' +
    path
      .relative(DIST, f)
      .replace(/\\/g, '/')
      .replace(/index\.html$/, '');

  const brotli = zlib.brotliCompressSync(html).length / 1024;

  const inlineCss = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].reduce(
    (n, m) => n + Buffer.byteLength(m[1]),
    0,
  );
  const cssLinks = [...html.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)].map(
    (m) => m[1],
  );
  let externalCss = 0;
  for (const href of cssLinks) {
    if (href.startsWith('http')) continue;
    const p = path.join(DIST, href);
    if (fs.existsSync(p)) externalCss += fs.statSync(p).size;
  }
  const cssKB = (inlineCss + externalCss) / 1024;

  // JSON-LD is data, not executable JavaScript; it is counted as HTML, not as JS.
  const inlineJs = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)]
    .filter(([, attrs]) => !/type="application\/ld\+json"/.test(attrs) && !/\ssrc=/.test(attrs))
    .reduce((n, m) => n + Buffer.byteLength(m[2]), 0);
  const scriptSrcs = [...html.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)].map((m) => m[1]);
  let externalJs = 0;
  let thirdPartyScripts = 0;
  for (const src of scriptSrcs) {
    if (src.startsWith('http')) {
      thirdPartyScripts++;
      continue;
    }
    const p = path.join(DIST, src);
    if (fs.existsSync(p)) externalJs += fs.statSync(p).size;
  }
  const jsKB = (inlineJs + externalJs) / 1024;

  const blocking = cssLinks.filter((h) => !h.startsWith('http')).length + scriptSrcs.length;

  worstHtml = Math.max(worstHtml, brotli);
  worstCss = Math.max(worstCss, cssKB);
  worstJs = Math.max(worstJs, jsKB);

  rows.push({ route, brotli, cssKB, jsKB, blocking, thirdPartyScripts });

  if (brotli > BUDGET.htmlBrotliKB)
    errors.push(`${route}: HTML ${brotli.toFixed(1)} KB brotli (budget ${BUDGET.htmlBrotliKB})`);
  if (cssKB > BUDGET.cssKB)
    errors.push(`${route}: CSS ${cssKB.toFixed(1)} KB (budget ${BUDGET.cssKB})`);
  if (jsKB > BUDGET.jsKB) errors.push(`${route}: JS ${jsKB.toFixed(1)} KB (budget ${BUDGET.jsKB})`);
  if (blocking > BUDGET.blockingRequests)
    errors.push(
      `${route}: ${blocking} blocking sub-resource request(s) (budget ${BUDGET.blockingRequests})`,
    );
  if (thirdPartyScripts > 0) errors.push(`${route}: ${thirdPartyScripts} third-party script(s)`);
}

// Fonts
const fonts = walk(path.join(DIST, 'fonts'));
const fontKB = fonts.reduce((n, f) => n + fs.statSync(f).size, 0) / 1024;
if (fontKB > BUDGET.fontKB)
  errors.push(`fonts total ${fontKB.toFixed(1)} KB (budget ${BUDGET.fontKB})`);

// Images
const imgs = walk(DIST, (p) => /\.(avif|webp|jpe?g|png|svg|gif)$/i.test(p));
const imgTotalKB = imgs.reduce((n, f) => n + fs.statSync(f).size, 0) / 1024;
let maxImg = { f: '', kb: 0 };
for (const f of imgs) {
  const kb = fs.statSync(f).size / 1024;
  if (kb > maxImg.kb) maxImg = { f: path.relative(DIST, f), kb };
}
if (maxImg.kb > BUDGET.maxImageKB)
  errors.push(
    `largest image ${maxImg.f} is ${maxImg.kb.toFixed(0)} KB (budget ${BUDGET.maxImageKB})`,
  );

// Whole site
const all = walk(DIST);
const totalMB = all.reduce((n, f) => n + fs.statSync(f).size, 0) / 1048576;
const docsMB =
  walk(path.join(DIST, 'documents')).reduce((n, f) => n + fs.statSync(f).size, 0) / 1048576;
if (totalMB - docsMB > BUDGET.totalSiteMB)
  errors.push(
    `site is ${(totalMB - docsMB).toFixed(1)} MB excluding documents (budget ${BUDGET.totalSiteMB})`,
  );

// ── report ─────────────────────────────────────────────────────────────────────
rows.sort((a, b) => b.brotli - a.brotli);
console.log('check-budget — heaviest pages\n');
console.log('  HTML(br)   CSS      JS    blocking  route');
for (const r of rows.slice(0, 8)) {
  console.log(
    `  ${r.brotli.toFixed(1).padStart(6)} KB ${r.cssKB.toFixed(1).padStart(6)} KB ${r.jsKB.toFixed(1).padStart(5)} KB ${String(r.blocking).padStart(8)}  ${r.route}`,
  );
}

console.log('\nsite totals');
console.log(`  pages              ${htmlFiles.length}`);
console.log(`  worst HTML (br)    ${worstHtml.toFixed(1)} KB  / budget ${BUDGET.htmlBrotliKB}`);
console.log(`  worst CSS          ${worstCss.toFixed(1)} KB  / budget ${BUDGET.cssKB}`);
console.log(`  worst JS           ${worstJs.toFixed(1)} KB  / budget ${BUDGET.jsKB}`);
console.log(`  fonts              ${fontKB.toFixed(1)} KB  / budget ${BUDGET.fontKB}`);
console.log(
  `  images (${imgs.length} files) ${(imgTotalKB / 1024).toFixed(2)} MB, largest ${maxImg.kb.toFixed(0)} KB (${maxImg.f})`,
);
console.log(`  documents          ${docsMB.toFixed(2)} MB (mirrored source files)`);
console.log(`  total              ${totalMB.toFixed(2)} MB`);

if (errors.length) {
  console.error(`\n${errors.length} budget violation(s):`);
  for (const e of errors) console.error('  ✗ ' + e);
  process.exit(1);
}
console.log('\ncheck-budget: PASS');
