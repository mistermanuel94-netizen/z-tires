import fs from 'node:fs';
import * as cheerio from 'cheerio';
const f = process.argv[2];
const html = fs.readFileSync(f,'utf8');
const $ = cheerio.load(html);
$('script,style,noscript').remove();
const sel = process.argv[3] || 'body';
$(sel).each((i,e)=>{
  const t = $(e).text().split('\n').map(s=>s.replace(/\s+/g,' ').trim()).filter(Boolean).join('\n');
  console.log(t);
});
