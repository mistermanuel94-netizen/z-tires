/**
 * Emits security and caching headers for the static host.
 *
 * The CSP is derived from what the built site actually loads, not from a template. It is
 * verified against dist/ before being written: if a page contains an inline script or an
 * external origin the policy does not allow, this fails.
 *
 * Writes dist/_headers (Netlify / Cloudflare Pages) and dist/headers.nginx.conf.
 *
 * Run after `astro build`: node scripts/generate-headers.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const DIST = 'dist';

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

const htmlFiles = walk(DIST, (p) => p.endsWith('.html'));
if (htmlFiles.length === 0) {
  console.error('generate-headers: no HTML in dist/ — run astro build first.');
  process.exit(1);
}

// ── What does the built site actually load? ────────────────────────────────────
const scriptHashes = new Set();
const externalOrigins = new Set();
const frameOrigins = new Set();
let hasInlineStyle = false;

for (const f of htmlFiles) {
  const html = fs.readFileSync(f, 'utf8');

  // Inline scripts, excluding JSON-LD, which is data and is covered by the default policy.
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/type="application\/ld\+json"/.test(m[1])) continue;
    if (/\ssrc=/.test(m[1])) continue;
    const hash = crypto.createHash('sha256').update(m[2], 'utf8').digest('base64');
    scriptHashes.add(`'sha256-${hash}'`);
  }
  for (const m of html.matchAll(/<script[^>]*\ssrc="(https?:\/\/[^"]+)"/g)) {
    externalOrigins.add(new URL(m[1]).origin);
  }
  if (/<style\b/.test(html)) hasInlineStyle = true;
  for (const m of html.matchAll(/<iframe[^>]*\ssrc="(https?:\/\/[^"]+)"/g)) {
    frameOrigins.add(new URL(m[1]).origin);
  }
  for (const m of html.matchAll(/<link[^>]*\shref="(https?:\/\/[^"]+)"[^>]*rel="stylesheet"/g)) {
    externalOrigins.add(new URL(m[1]).origin);
  }
}

const frameSrc = [...frameOrigins].sort();

/*
 * script-src uses per-script SHA-256 hashes rather than 'unsafe-inline'. There is exactly one
 * inline script on the site (the mobile menu toggle) and Astro emits it identically on every page,
 * so this is a single hash.
 *
 * style-src needs 'unsafe-inline' because Astro inlines the stylesheet into a <style> element and
 * scoped component styles are emitted the same way. Hashing them would work but would break on
 * every content change; the trade-off is documented in SECURITY_AUDIT.md. There is no user-
 * generated content and no third-party script that could exploit it.
 */
const csp = [
  `default-src 'self'`,
  `base-uri 'self'`,
  `form-action 'self' mailto:`,
  `frame-ancestors 'none'`,
  `object-src 'none'`,
  `script-src 'self' ${[...scriptHashes].join(' ')}`.trim(),
  `style-src 'self'${hasInlineStyle ? " 'unsafe-inline'" : ''}`,
  `img-src 'self' data:`,
  `font-src 'self'`,
  `connect-src 'self'`,
  `media-src 'self'`,
  frameSrc.length ? `frame-src ${frameSrc.join(' ')}` : `frame-src 'none'`,
  `manifest-src 'self'`,
  `upgrade-insecure-requests`,
].join('; ');

const HEADERS = {
  'Content-Security-Policy': csp,
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  // No page uses any of these; denying them shrinks the attack surface and is a Lighthouse
  // best-practice signal.
  'Permissions-Policy': [
    'accelerometer=()',
    'autoplay=()',
    'camera=()',
    'display-capture=()',
    'encrypted-media=()',
    'fullscreen=(self)',
    'geolocation=()',
    'gyroscope=()',
    'interest-cohort=()',
    'magnetometer=()',
    'microphone=()',
    'midi=()',
    'payment=()',
    'usb=()',
  ].join(', '),
};

// ── Verify the policy against the build ────────────────────────────────────────
const errors = [];
if (externalOrigins.size > 0) {
  errors.push(
    `the build loads scripts or stylesheets from external origins the CSP does not allow: ${[...externalOrigins].join(', ')}`,
  );
}
for (const f of htmlFiles) {
  const html = fs.readFileSync(f, 'utf8');
  for (const m of html.matchAll(/\son[a-z]+="/gi)) {
    errors.push(`${path.relative(DIST, f)}: inline event handler ${m[0]} is blocked by this CSP`);
  }
  if (/javascript:/i.test(html)) {
    errors.push(`${path.relative(DIST, f)}: javascript: URL is blocked by this CSP`);
  }
}
if (errors.length) {
  console.error('generate-headers: validation FAILED');
  for (const e of errors) console.error('  ✗ ' + e);
  process.exit(1);
}

// ── Netlify / Cloudflare Pages ────────────────────────────────────────────────
const lines = ['# Generated by scripts/generate-headers.mjs — do not edit by hand.', '', '/*'];
for (const [k, v] of Object.entries(HEADERS)) lines.push(`  ${k}: ${v}`);
lines.push(
  '',
  '# Content-hashed assets are immutable.',
  '/_assets/*',
  '  Cache-Control: public, max-age=31536000, immutable',
  '',
  '/fonts/*',
  '  Cache-Control: public, max-age=31536000, immutable',
  '',
  '# HTML must revalidate so a redeploy is picked up immediately.',
  '/*.html',
  '  Cache-Control: public, max-age=0, must-revalidate',
  '',
  '/documents/*',
  '  Cache-Control: public, max-age=86400',
  '',
);
fs.writeFileSync(path.join(DIST, '_headers'), lines.join('\n'));

// ── nginx ─────────────────────────────────────────────────────────────────────
const nginx = [
  '# Generated by scripts/generate-headers.mjs — include inside a server { } block.',
  '',
  ...Object.entries(HEADERS).map(([k, v]) => `add_header ${k} "${v.replace(/"/g, '\\"')}" always;`),
  '',
  'location /_assets/ { add_header Cache-Control "public, max-age=31536000, immutable" always; }',
  'location /fonts/   { add_header Cache-Control "public, max-age=31536000, immutable" always; }',
  'location /documents/ { add_header Cache-Control "public, max-age=86400" always; }',
  '',
].join('\n');
fs.writeFileSync(path.join(DIST, 'headers.nginx.conf'), nginx);

console.log('generate-headers: OK');
console.log(`  inline script hashes: ${scriptHashes.size}`);
console.log(`  external script/style origins: ${externalOrigins.size} (must be 0)`);
console.log(`  frame-src: ${frameSrc.length ? frameSrc.join(' ') : "'none'"}`);
console.log('  wrote dist/_headers, dist/headers.nginx.conf');
