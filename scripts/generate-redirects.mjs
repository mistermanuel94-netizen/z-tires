/**
 * Emits host redirect configuration from the single source of truth in src/data/redirects.ts,
 * and validates it: no chains, no loops, no duplicate sources, every 301 target must be a real
 * page in dist/.
 *
 * Writes:
 *   dist/_redirects        Netlify / Cloudflare Pages
 *   dist/vercel.json       Vercel
 *   dist/.htaccess         Apache
 *   dist/nginx-redirects.conf  nginx (include from a server block)
 *
 * Run after `astro build`: node scripts/generate-redirects.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const src = fs.readFileSync('src/data/redirects.ts', 'utf8');

/** Parse the redirect literals without needing a TS toolchain at runtime. */
const rules = [];
const re =
  /\{\s*from:\s*'([^']+)',\s*to:\s*'([^']*)',\s*status:\s*(301|410),\s*reason:\s*'((?:[^'\\]|\\.)*)'\s*,?\s*\}/g;
let m;
while ((m = re.exec(src)) !== null) {
  rules.push({ from: m[1], to: m[2], status: Number(m[3]), reason: m[4].replace(/\\'/g, "'") });
}

if (rules.length === 0) {
  console.error('generate-redirects: parsed 0 rules — the source format changed.');
  process.exit(1);
}

// ── Validation ─────────────────────────────────────────────────────────────────────────────
const errors = [];
const sources = new Set();
const sourceSet = new Set(rules.map((r) => r.from));

for (const r of rules) {
  if (sources.has(r.from)) errors.push(`duplicate source: ${r.from}`);
  sources.add(r.from);

  if (r.status === 301) {
    if (!r.to) errors.push(`301 with no target: ${r.from}`);
    if (r.to === r.from) errors.push(`self-redirect loop: ${r.from}`);
    if (sourceSet.has(r.to))
      errors.push(`redirect chain: ${r.from} -> ${r.to}, which also redirects`);
  }
  if (r.status === 410 && r.to) errors.push(`410 must have an empty target: ${r.from}`);
}

// Every 301 target that is a page (not a file) must exist in the build.
if (fs.existsSync('dist')) {
  for (const r of rules.filter((x) => x.status === 301)) {
    if (/\.[a-z0-9]+$/i.test(r.to)) {
      if (!fs.existsSync(path.join('dist', r.to)))
        errors.push(`301 target file missing from dist: ${r.to}`);
    } else {
      const page = path.join('dist', r.to, 'index.html');
      if (!fs.existsSync(page)) errors.push(`301 target page missing from dist: ${r.to}`);
    }
  }
} else {
  console.warn(
    'generate-redirects: dist/ not found — target existence not verified. Run astro build first.',
  );
}

if (errors.length) {
  console.error('generate-redirects: validation FAILED');
  for (const e of errors) console.error('  ✗ ' + e);
  process.exit(1);
}

fs.mkdirSync('dist', { recursive: true });

/**
 * Percent-encode a path for the formats that are whitespace-delimited.
 *
 * The _redirects format and nginx's `location` directive both split on whitespace, so a rule for a
 * path containing a literal space -- such as the old "/en/Terms & Conditions.pdf" -- truncates at
 * the first space and never matches. Encoding makes the rule expressible. Segments already
 * percent-encoded in the source are left alone.
 */
const encodePath = (p) =>
  p
    .split('/')
    .map((seg) => (/%[0-9A-Fa-f]{2}/.test(seg) ? seg : encodeURIComponent(seg)))
    .join('/');

/** Two source rules can collapse to the same encoded path; keep the first. */
const encodedRules = [];
const seenEncoded = new Set();
for (const r of rules) {
  const from = encodePath(r.from);
  if (seenEncoded.has(from)) continue;
  seenEncoded.add(from);
  encodedRules.push({ ...r, from });
}

// ── Netlify / Cloudflare Pages ─────────────────────────────────────────────────────────────
const netlify = [
  '# Generated from src/data/redirects.ts — do not edit by hand.',
  '# Single-hop only. 410 = content that was fabricated or is a dead platform artefact.',
  '',
  '# Paths are percent-encoded: this format is whitespace-delimited, so a literal space would',
  '# truncate the rule.',
  ...encodedRules.map((r) =>
    r.status === 410 ? `${r.from}  /404  410` : `${r.from}  ${r.to}  301`,
  ),
  '',
].join('\n');
fs.writeFileSync('dist/_redirects', netlify);

// ── Vercel ─────────────────────────────────────────────────────────────────────────────────
fs.writeFileSync(
  'dist/vercel.json',
  JSON.stringify(
    {
      $schema: 'https://openapi.vercel.sh/vercel.json',
      trailingSlash: true,
      cleanUrls: false,
      redirects: rules
        .filter((r) => r.status === 301)
        .map((r) => ({ source: r.from, destination: r.to, permanent: true })),
      // Vercel cannot serve 410 from a redirect rule; these are rewritten to a gone handler.
      rewrites: rules
        .filter((r) => r.status === 410)
        .map((r) => ({ source: r.from, destination: '/404/' })),
    },
    null,
    2,
  ) + '\n',
);

// ── Apache ─────────────────────────────────────────────────────────────────────────────────
const esc = (s) => s.replace(/([.?*+^$[\]\\(){}|\-])/g, '\\$1');
const htaccess = [
  '# Generated from src/data/redirects.ts — do not edit by hand.',
  '<IfModule mod_rewrite.c>',
  '  RewriteEngine On',
  '',
  ...rules.flatMap((r) =>
    r.status === 410
      ? [`  RewriteRule ^${esc(r.from.replace(/^\//, ''))}$ - [G,L]`]
      : [`  RewriteRule ^${esc(r.from.replace(/^\//, ''))}$ ${r.to} [R=301,L]`],
  ),
  '</IfModule>',
  '',
].join('\n');
fs.writeFileSync('dist/.htaccess', htaccess);

// ── nginx ──────────────────────────────────────────────────────────────────────────────────
const nginx = [
  '# Generated from src/data/redirects.ts — do not edit by hand.',
  '# include this file inside a server { } block.',
  '',
  ...encodedRules.map((r) =>
    r.status === 410
      ? `location = ${r.from} { return 410; }`
      : `location = ${r.from} { return 301 ${r.to}; }`,
  ),
  '',
].join('\n');
fs.writeFileSync('dist/nginx-redirects.conf', nginx);

const n301 = rules.filter((r) => r.status === 301).length;
const n410 = rules.filter((r) => r.status === 410).length;
console.log(`generate-redirects: OK — ${rules.length} rules (${n301} x 301, ${n410} x 410)`);
if (encodedRules.length !== rules.length) {
  console.log(
    `  ${rules.length - encodedRules.length} rule(s) collapsed to an existing encoded path in the whitespace-delimited formats`,
  );
}
console.log('  wrote dist/_redirects, dist/vercel.json, dist/.htaccess, dist/nginx-redirects.conf');
