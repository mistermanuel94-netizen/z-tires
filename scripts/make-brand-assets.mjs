/**
 * Generates the apple-touch-icon, the public logo copy used by JSON-LD, and the default
 * Open Graph card. Everything is composed from the FlexTyres logo and the brand palette
 * sampled from it — no new brand marks are invented.
 *
 * Run: node scripts/make-brand-assets.mjs
 */
import fs from 'node:fs';
import sharp from 'sharp';

const LOGO = 'src/assets/images/flextyres-logo.png';
const INK = '#343435';
const INK_DEEP = '#1f252a';
const GREEN = '#a4c21e';

fs.mkdirSync('public', { recursive: true });

// --- apple-touch-icon: logo mark on the brand charcoal, safe-area padded ------------------
const iconLogo = await sharp(LOGO).resize({ width: 148, fit: 'inside' }).png().toBuffer();
await sharp({
  create: { width: 180, height: 180, channels: 4, background: INK },
})
  .composite([{ input: iconLogo, gravity: 'center' }])
  .png({ compressionLevel: 9 })
  .toFile('public/apple-touch-icon.png');

// --- logo copy for structured data (schema.org ImageObject needs a stable public URL) -----
await sharp(LOGO)
  .resize({ width: 470, fit: 'inside' })
  .png({ compressionLevel: 9 })
  .toFile('public/flextyres-logo.png');

// --- default Open Graph card, 1200x630 ----------------------------------------------------
const ogLogo = await sharp(LOGO).resize({ width: 360, fit: 'inside' }).png().toBuffer();

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${INK_DEEP}"/>
      <stop offset="100%" stop-color="#0f1214"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <rect x="0" y="0" width="1200" height="8" fill="${GREEN}"/>
  <text x="80" y="392" font-family="Poppins, Segoe UI, sans-serif" font-size="58" font-weight="700" fill="#ffffff">Wholesale used tyres,</text>
  <text x="80" y="462" font-family="Poppins, Segoe UI, sans-serif" font-size="58" font-weight="700" fill="${GREEN}">by the container</text>
  <text x="80" y="530" font-family="Inter, Segoe UI, sans-serif" font-size="27" fill="#b9bfc4">Graded car and truck tyres for trade buyers · Evere, Belgium</text>
</svg>`;

await sharp(Buffer.from(svg))
  .composite([{ input: ogLogo, top: 76, left: 80 }])
  .png({ compressionLevel: 9 })
  .toFile('public/og-default.png');

for (const f of [
  'public/apple-touch-icon.png',
  'public/flextyres-logo.png',
  'public/og-default.png',
]) {
  console.log(f, (fs.statSync(f).size / 1024).toFixed(1) + ' KB');
}
