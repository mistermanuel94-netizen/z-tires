/**
 * Static accessibility audit over dist/, targeting WCAG 2.2 AA.
 *
 * This is a structural check, not a substitute for keyboard and screen-reader testing. It catches
 * the classes of defect that are detectable in markup, which is where the old site failed:
 * missing alt text, unlabelled form controls, missing landmarks, empty links and buttons,
 * duplicate ids, tabindex abuse, and heading-order breaks.
 *
 * Colour contrast is verified separately against the token palette (see the CONTRAST table below),
 * because contrast lives in CSS variables rather than in markup.
 *
 * Run: node scripts/check-a11y.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const DIST = 'dist';
const errors = [];
const warnings = [];

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
    .replace(/<[^>]*>/g, '')
    .replace(/&[a-z]+;/gi, ' ')
    .trim();

const files = walk(DIST);

for (const f of files) {
  const html = fs.readFileSync(f, 'utf8');
  const route =
    '/' +
    path
      .relative(DIST, f)
      .replace(/\\/g, '/')
      .replace(/index\.html$/, '');
  const fail = (m) => errors.push(`${route}: ${m}`);
  const warn = (m) => warnings.push(`${route}: ${m}`);

  // ── Landmarks ──────────────────────────────────────────────────────────────
  if (!/<main\b/.test(html)) fail('no <main> landmark');
  if ((html.match(/<main\b/g) || []).length > 1) fail('more than one <main>');
  if (!/<header\b/.test(html)) fail('no <header> landmark');
  if (!/<footer\b/.test(html)) fail('no <footer> landmark');
  if (!/class="skip-link"/.test(html)) fail('no skip link');

  // Every <nav> needs a distinguishing accessible name when more than one is present.
  const navs = [...html.matchAll(/<nav\b([^>]*)>/g)];
  if (navs.length > 1) {
    for (const n of navs) {
      if (!/aria-label=|aria-labelledby=/.test(n[1]))
        fail(`a <nav> has no accessible name: <nav${n[1]}>`);
    }
  }

  // ── Language ───────────────────────────────────────────────────────────────
  if (!/<html lang="[a-z]{2}/.test(html)) fail('missing or malformed lang on <html>');

  // ── Duplicate ids ──────────────────────────────────────────────────────────
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  for (const d of [...new Set(dupes)]) fail(`duplicate id="${d}"`);

  // ── Images ─────────────────────────────────────────────────────────────────
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\salt="/.test(m[0])) fail(`<img> with no alt attribute: ${m[0].slice(0, 90)}`);
  }

  // ── Links ──────────────────────────────────────────────────────────────────
  for (const m of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const attrs = m[1];
    const inner = m[2];
    const text = strip(inner);
    const hasAriaLabel = /aria-label="[^"]+"/.test(attrs) || /aria-labelledby="/.test(attrs);
    const hasImgAlt = /<img[^>]*\salt="[^"]+"/.test(inner);
    const hasSrOnly = /visually-hidden/.test(inner);
    if (!text && !hasAriaLabel && !hasImgAlt && !hasSrOnly) {
      fail(`link with no accessible name: <a${attrs.slice(0, 80)}>`);
    }
    if (/^(click here|read more|here|more|link)$/i.test(text) && !hasSrOnly && !hasAriaLabel) {
      warn(`non-descriptive link text: "${text}"`);
    }
  }

  // ── Buttons ────────────────────────────────────────────────────────────────
  for (const m of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)) {
    const attrs = m[1];
    const inner = m[2];
    const text = strip(inner);
    const named =
      text ||
      /aria-label="[^"]+"/.test(attrs) ||
      /aria-labelledby="/.test(attrs) ||
      /visually-hidden/.test(inner);
    if (!named) fail(`button with no accessible name: <button${attrs.slice(0, 80)}>`);
    if (!/\stype="/.test(attrs)) warn(`<button> without an explicit type attribute`);
  }

  // ── Forms ──────────────────────────────────────────────────────────────────
  const labelFor = new Set([...html.matchAll(/<label\b[^>]*\sfor="([^"]+)"/g)].map((m) => m[1]));
  for (const m of html.matchAll(/<(input|select|textarea)\b([^>]*)>/gi)) {
    const tag = m[1];
    const attrs = m[2];
    const type = (attrs.match(/\stype="([^"]+)"/) || [])[1] || 'text';
    if (['hidden', 'submit', 'button', 'reset', 'image'].includes(type)) continue;

    const id = (attrs.match(/\sid="([^"]+)"/) || [])[1];
    const wrappedByLabel = new RegExp(
      `<label[^>]*>(?:(?!</label>)[\\s\\S])*${m[0].replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}`,
    ).test(html);
    const named =
      (id && labelFor.has(id)) ||
      /aria-label="[^"]+"/.test(attrs) ||
      /aria-labelledby="/.test(attrs) ||
      wrappedByLabel;

    if (!named) fail(`<${tag} type="${type}"> has no associated label: ${m[0].slice(0, 90)}`);

    // Autocomplete on identity fields.
    const name = (attrs.match(/\sname="([^"]+)"/) || [])[1] || '';
    if (
      ['name', 'email', 'phone', 'country', 'company'].includes(name) &&
      !/\sautocomplete="/.test(attrs)
    ) {
      warn(`field name="${name}" has no autocomplete attribute`);
    }
  }
  for (const m of html.matchAll(/<fieldset\b[^>]*>([\s\S]*?)<\/fieldset>/gi)) {
    if (!/<legend\b/.test(m[1])) fail('<fieldset> without a <legend>');
  }

  // ── ARIA hygiene ───────────────────────────────────────────────────────────
  for (const m of html.matchAll(/\stabindex="(\d+)"/g)) {
    if (Number(m[1]) > 0) fail(`positive tabindex="${m[1]}" breaks natural focus order`);
  }
  // A focusable element inside aria-hidden is a keyboard trap for screen-reader users.
  for (const m of html.matchAll(
    /<([a-z]+)\b[^>]*aria-hidden="true"[^>]*>([\s\S]{0,400}?)<\/\1>/gi,
  )) {
    if (/<(a|button|input|select|textarea)\b/i.test(m[2]) && !/tabindex="-1"/.test(m[0])) {
      warn('focusable element inside aria-hidden="true"');
    }
  }

  // ── Headings ───────────────────────────────────────────────────────────────
  const hs = [...html.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)];
  if (hs.filter((h) => h[1] === '1').length !== 1)
    fail(`${hs.filter((h) => h[1] === '1').length} <h1> (want exactly 1)`);
  let prev = 0;
  for (const h of hs) {
    const lvl = Number(h[1]);
    if (!strip(h[2])) fail(`empty <h${lvl}>`);
    if (prev && lvl > prev + 1) fail(`heading order skips h${prev} → h${lvl}`);
    prev = lvl;
  }

  // ── Tables ─────────────────────────────────────────────────────────────────
  for (const m of html.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/gi)) {
    if (!/<th\b/.test(m[1])) fail('<table> with no <th> header cells');
    if (!/<caption\b/.test(m[1])) warn('<table> with no <caption>');
    for (const th of m[1].matchAll(/<th\b([^>]*)>/gi)) {
      if (!/\sscope="/.test(th[1])) warn('<th> without a scope attribute');
    }
  }

  // ── iframes ────────────────────────────────────────────────────────────────
  for (const m of html.matchAll(/<iframe\b([^>]*)>/gi)) {
    if (!/\stitle="[^"]+"/.test(m[1])) fail('<iframe> without a title');
  }
}

// ── Contrast, computed from the token palette ────────────────────────────────
const hex2rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lum = (h) => {
  const [r, g, b] = hex2rgb(h).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

const CONTRAST = [
  ['body text on white', '#1f252a', '#ffffff', 4.5],
  ['muted text on white', '#62686d', '#ffffff', 4.5],
  ['muted text on subtle', '#62686d', '#f7f7f7', 4.5],
  ['link green on white', '#55771f', '#ffffff', 4.5],
  ['link green on subtle', '#55771f', '#f7f7f7', 4.5],
  ['link green on green-50', '#55771f', '#f4f8ea', 4.5],
  ['white on primary button', '#ffffff', '#55771f', 4.5],
  ['white on primary button hover', '#ffffff', '#3d5715', 4.5],
  ['white on dark button', '#ffffff', '#1f252a', 4.5],
  ['footer text on dark', '#b9bfc4', '#1f252a', 4.5],
  ['footer link hover on dark', '#b9d472', '#1f252a', 4.5],
  ['eyebrow green on white', '#55771f', '#ffffff', 4.5],
  ['answer text on green-50', '#1f252a', '#f4f8ea', 4.5],
  ['answer label on green-50', '#3d5715', '#f4f8ea', 4.5],
  ['hero lede on hero overlay', '#dfe3e6', '#101315', 4.5],
  ['hero facts on hero overlay', '#cfd4d8', '#101315', 4.5],
  ['focus ring on white', '#0b6bcb', '#ffffff', 3],
  ['border on white (non-text)', '#c7ccd1', '#ffffff', 1.4],
  ['step number ink on green', '#16191b', '#86b43a', 4.5],
  ['initials on green-100', '#3d5715', '#e4eecd', 4.5],
];

console.log('check-a11y — colour contrast (WCAG 2.2 AA)\n');
for (const [label, fg, bg, min] of CONTRAST) {
  const r = ratio(fg, bg);
  const ok = r >= min;
  console.log(`  ${ok ? '✓' : '✗'} ${r.toFixed(2)}:1  (min ${min})  ${label}`);
  if (!ok) errors.push(`contrast: ${label} is ${r.toFixed(2)}:1, needs ${min}:1`);
}

console.log(`\ncheck-a11y — audited ${files.length} pages`);
if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`);
  const seen = new Set();
  for (const w of warnings) {
    const key = w.replace(/^[^:]+: /, '');
    if (seen.has(key)) continue;
    seen.add(key);
    console.log('  ! ' + w);
  }
}
if (errors.length) {
  console.error(`\n${errors.length} error(s):`);
  for (const e of errors) console.error('  ✗ ' + e);
  process.exit(1);
}
console.log('\ncheck-a11y: PASS');
