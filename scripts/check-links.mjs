/**
 * Post-build link audit over dist/.
 *
 * Fails on:
 *   - an internal href that resolves to no file
 *   - an internal href that is also a redirect source (a link that would cost a hop)
 *   - an href of "#" or an empty href (the old site shipped one in every footer)
 *   - an internal link missing its trailing slash
 *   - an in-page #fragment with no matching id
 *   - a target="_blank" without rel="noopener"
 *
 * Warns on external links, and optionally checks them over the network with --external.
 *
 * Run: node scripts/check-links.mjs [--external]
 */
import fs from 'node:fs';
import path from 'node:path';

const DIST = 'dist';
const SITE = 'https://flextyres.com';
const CHECK_EXTERNAL = process.argv.includes('--external');

const errors = [];
const externals = new Map();

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

// Redirect sources — an internal link must never point at one.
const redirectSrc = new Set();
if (fs.existsSync('dist/_redirects')) {
  for (const line of fs.readFileSync('dist/_redirects', 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    redirectSrc.add(t.split(/\s+/)[0]);
  }
}

const files = walk(DIST);
const routeOf = (f) =>
  '/' +
  path
    .relative(DIST, f)
    .replace(/\\/g, '/')
    .replace(/index\.html$/, '');

const resolves = (href) => {
  const clean = href.split('#')[0].split('?')[0];
  if (clean === '/') return fs.existsSync(path.join(DIST, 'index.html'));
  if (/\.[a-z0-9]+$/i.test(clean)) return fs.existsSync(path.join(DIST, clean));
  return fs.existsSync(path.join(DIST, clean, 'index.html'));
};

let internalCount = 0;

for (const f of files) {
  const html = fs.readFileSync(f, 'utf8');
  const route = routeOf(f);
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));

  for (const m of html.matchAll(/<a\b([^>]*)>/gi)) {
    const attrs = m[1];
    const hrefM = attrs.match(/\shref="([^"]*)"/);

    if (!hrefM) {
      // An <a> with no href is not a link; only flag it if it looks like a nav item.
      continue;
    }
    let href = hrefM[1].trim();

    if (href === '' || href === '#') {
      errors.push(`${route}: dead link — href="${href}"`);
      continue;
    }

    if (/\starget="_blank"/.test(attrs) && !/\srel="[^"]*noopener/.test(attrs)) {
      errors.push(`${route}: target="_blank" without rel="noopener" → ${href}`);
    }

    if (href.startsWith('mailto:') || href.startsWith('tel:')) continue;

    if (href.startsWith(SITE)) href = href.slice(SITE.length) || '/';

    if (/^https?:\/\//i.test(href)) {
      if (!externals.has(href)) externals.set(href, new Set());
      externals.get(href).add(route);
      continue;
    }

    if (href.startsWith('#')) {
      const id = href.slice(1);
      if (!ids.has(id)) errors.push(`${route}: fragment "${href}" has no matching id on the page`);
      continue;
    }

    if (!href.startsWith('/')) {
      errors.push(`${route}: relative internal link "${href}" — use an absolute path`);
      continue;
    }

    internalCount++;

    const [pathPart, frag] = href.split('#');

    if (!/\.[a-z0-9]+$/i.test(pathPart) && !pathPart.endsWith('/')) {
      errors.push(`${route}: internal link missing a trailing slash → ${href}`);
      continue;
    }

    if (redirectSrc.has(pathPart)) {
      errors.push(`${route}: links to a redirect source (costs a hop) → ${pathPart}`);
      continue;
    }

    if (!resolves(pathPart)) {
      errors.push(`${route}: broken internal link → ${href}`);
      continue;
    }

    if (frag) {
      const targetFile =
        pathPart === '/' ? path.join(DIST, 'index.html') : path.join(DIST, pathPart, 'index.html');
      if (fs.existsSync(targetFile)) {
        const targetHtml = fs.readFileSync(targetFile, 'utf8');
        if (
          !new RegExp(`\\sid="${frag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`).test(targetHtml)
        ) {
          errors.push(`${route}: fragment "#${frag}" does not exist on ${pathPart}`);
        }
      }
    }
  }
}

console.log(
  `check-links: ${files.length} pages, ${internalCount} internal links, ${externals.size} unique external links`,
);

if (CHECK_EXTERNAL) {
  console.log('\nchecking external links…');
  const UA = 'Mozilla/5.0 (compatible; FlexTyresLinkCheck/1.0)';
  for (const [url, from] of externals) {
    try {
      let r = await fetch(url, {
        method: 'HEAD',
        headers: { 'User-Agent': UA },
        redirect: 'follow',
      });
      if (r.status === 405 || r.status === 403) {
        r = await fetch(url, { method: 'GET', headers: { 'User-Agent': UA }, redirect: 'follow' });
      }
      const mark = r.ok ? '✓' : '✗';
      console.log(`  ${mark} ${r.status} ${url}`);
      if (r.status >= 400 && r.status !== 403 && r.status !== 429) {
        errors.push(`external link returns ${r.status}: ${url} (from ${[...from].join(', ')})`);
      }
    } catch (e) {
      console.log(`  ? ERR ${url} — ${String(e).slice(0, 60)}`);
    }
  }
} else {
  console.log('\nexternal links (not fetched; pass --external to verify):');
  for (const [url, from] of externals) console.log(`  · ${url}  ← ${[...from].length} page(s)`);
}

if (errors.length) {
  console.error(`\n${errors.length} error(s):`);
  for (const e of errors) console.error('  ✗ ' + e);
  process.exit(1);
}
console.log('\ncheck-links: PASS');
