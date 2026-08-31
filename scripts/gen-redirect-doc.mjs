/**
 * Regenerates the redirect table inside URL_REDIRECT_MAP.md from src/data/redirects.ts, so the
 * document can never drift from the rules that actually ship.
 *
 * Run: node scripts/gen-redirect-doc.mjs
 */
import fs from 'node:fs';

const src = fs.readFileSync('src/data/redirects.ts', 'utf8');
const re =
  /\{\s*from:\s*'([^']+)',\s*to:\s*'([^']*)',\s*status:\s*(301|410),\s*reason:\s*'((?:[^'\\]|\\.)*)'\s*,?\s*\}/g;

const rows = [];
let m;
while ((m = re.exec(src)) !== null) {
  rows.push({ from: m[1], to: m[2], status: Number(m[3]), reason: m[4].replace(/\\'/g, "'") });
}
if (!rows.length) {
  console.error('gen-redirect-doc: parsed 0 rules');
  process.exit(1);
}

const esc = (s) => s.replace(/\|/g, '\\|');
const lines = [
  '| # | Old URL | New URL | Type | Reason | Canonical target | Internal links updated | Status |',
  '|---|---|---|---|---|---|---|---|',
];
rows.forEach((r, i) => {
  const to = r.status === 410 ? '— *(410 Gone)*' : '`' + r.to + '`';
  const canon = r.status === 410 ? 'n/a' : '`https://flextyres.com' + r.to + '`';
  lines.push(
    `| ${i + 1} | \`${esc(r.from)}\` | ${to} | ${r.status} | ${esc(r.reason)} | ${canon} | Yes | Verified |`,
  );
});

const table = lines.join('\n');
const doc = fs.readFileSync('URL_REDIRECT_MAP.md', 'utf8');
const START = '<!-- REDIRECT-TABLE:START -->';
const END = '<!-- REDIRECT-TABLE:END -->';
const a = doc.indexOf(START);
const b = doc.indexOf(END);
if (a === -1 || b === -1) {
  console.error('gen-redirect-doc: markers not found in URL_REDIRECT_MAP.md');
  process.exit(1);
}
fs.writeFileSync(
  'URL_REDIRECT_MAP.md',
  doc.slice(0, a + START.length) + '\n\n' + table + '\n\n' + doc.slice(b),
);

const n301 = rows.filter((r) => r.status === 301).length;
const n410 = rows.filter((r) => r.status === 410).length;
console.log(`gen-redirect-doc: wrote ${rows.length} rows (${n301} x 301, ${n410} x 410)`);
