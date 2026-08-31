import fs from 'node:fs';
import * as cheerio from 'cheerio';

const results = JSON.parse(fs.readFileSync('crawl-results.json','utf8'));
const out = [];
for (const r of results){
  if (!r.file || !fs.existsSync(r.file)) { out.push({url:r.url,status:r.status,redirect:r.redirect,note:'no-html'}); continue; }
  const html = fs.readFileSync(r.file,'utf8');
  const $ = cheerio.load(html);
  const txt = $('body').clone().find('script,style,noscript,nav,footer,header').remove().end().text().replace(/\s+/g,' ').trim();
  const rec = {
    url: r.url,
    finalUrl: r.finalUrl,
    status: r.status,
    bytes: r.bytes,
    title: $('title').first().text().trim(),
    metaDesc: $('meta[name="description"]').attr('content')||'',
    canonical: $('link[rel="canonical"]').attr('href')||'',
    robots: $('meta[name="robots"]').attr('content')||'',
    ogTitle: $('meta[property="og:title"]').attr('content')||'',
    ogImage: $('meta[property="og:image"]').attr('content')||'',
    lang: $('html').attr('lang')||'',
    h1: $('h1').map((i,e)=>$(e).text().replace(/\s+/g,' ').trim()).get().filter(Boolean),
    h2: $('h2').map((i,e)=>$(e).text().replace(/\s+/g,' ').trim()).get().filter(Boolean),
    h3: $('h3').map((i,e)=>$(e).text().replace(/\s+/g,' ').trim()).get().filter(Boolean),
    words: txt.split(/\s+/).filter(Boolean).length,
    imgCount: $('img').length,
    imgs: $('img').map((i,e)=>({src:$(e).attr('src')||$(e).attr('data-src')||'', alt:$(e).attr('alt')??null, w:$(e).attr('width')||'', h:$(e).attr('height')||''})).get(),
    intLinks: [...new Set($('a[href^="https://flextyres.com"],a[href^="/"]').map((i,e)=>$(e).attr('href')).get())],
    extLinks: [...new Set($('a[href^="http"]').map((i,e)=>$(e).attr('href')).get().filter(h=>!h.includes('flextyres.com')))],
    schemaTypes: [],
    scripts: $('script[src]').map((i,e)=>$(e).attr('src')).get(),
    stylesheets: $('link[rel="stylesheet"]').map((i,e)=>$(e).attr('href')).get(),
  };
  $('script[type="application/ld+json"]').each((i,e)=>{
    try { const j = JSON.parse($(e).text());
      const g = j['@graph']||[j];
      for (const n of [].concat(g)) if (n && n['@type']) rec.schemaTypes.push(Array.isArray(n['@type'])?n['@type'].join('/'):n['@type']);
    } catch { rec.schemaTypes.push('PARSE_ERROR'); }
  });
  out.push(rec);
}
fs.writeFileSync('extract.json', JSON.stringify(out,null,2));
console.log('pages:', out.length);
