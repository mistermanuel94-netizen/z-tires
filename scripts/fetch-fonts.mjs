import fs from 'node:fs';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const want = [
  ['Inter', 400, 'inter-400'],
  ['Inter', 600, 'inter-600'],
  ['Poppins', 600, 'poppins-600'],
  ['Poppins', 700, 'poppins-700'],
];
fs.mkdirSync('public/fonts', { recursive: true });
for (const [fam, wt, out] of want) {
  const url = `https://fonts.googleapis.com/css2?family=${fam}:wght@${wt}&display=swap`;
  const css = await (await fetch(url, { headers: { 'User-Agent': UA } })).text();
  const blocks = css.split('@font-face');
  const latin = blocks.find((b) => /U\+0000-00FF/.test(b)) || blocks[blocks.length - 1];
  const m = latin.match(/url\((https:[^)]+\.woff2)\)/);
  if (!m) {
    console.log('NO URL', fam, wt);
    continue;
  }
  const b = Buffer.from(await (await fetch(m[1], { headers: { 'User-Agent': UA } })).arrayBuffer());
  fs.writeFileSync(`public/fonts/${out}.woff2`, b);
  console.log(out, b.length, 'bytes');
}
