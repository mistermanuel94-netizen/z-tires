import fs from 'node:fs';
import path from 'node:path';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const ORIGIN = 'https://flextyres.com';
const OUT = 'pages';
fs.mkdirSync(OUT, { recursive: true });

const seeds = fs.readFileSync('seeds.txt','utf8').split(/\r?\n/).map(s=>s.trim()).filter(Boolean);

const seen = new Set();
const results = [];
const queue = [...seeds];

const SKIP_EXT = /\.(jpg|jpeg|png|gif|webp|svg|ico|css|js|pdf|zip|mp4|webm|woff2?|ttf|eot|xml|rss|json)(\?|$)/i;

function norm(u){
  try {
    const url = new URL(u, ORIGIN);
    if (url.origin !== ORIGIN) return null;
    url.hash = '';
    // drop tracking params but keep meaningful ones
    return url.toString();
  } catch { return null; }
}

function slugFile(u){
  const url = new URL(u);
  let p = (url.pathname + url.search).replace(/[^a-zA-Z0-9._-]+/g,'_').replace(/^_+|_+$/g,'');
  if (!p) p = 'root';
  return p.slice(0,150);
}

async function fetchOne(u){
  const res = await fetch(u, { redirect:'manual', headers:{ 'User-Agent': UA, 'Accept':'text/html,application/xhtml+xml' } });
  return res;
}

async function run(){
  while(queue.length){
    const u = queue.shift();
    const n = norm(u);
    if (!n || seen.has(n)) continue;
    seen.add(n);
    if (SKIP_EXT.test(n)) continue;
    let rec = { url:n, status:null, redirect:null, chain:[], error:null, file:null, bytes:0 };
    try {
      let cur = n, hops = 0;
      while (hops < 6){
        const res = await fetchOne(cur);
        rec.status = res.status;
        if ([301,302,303,307,308].includes(res.status)){
          const loc = res.headers.get('location');
          rec.chain.push({from:cur, status:res.status, to:loc});
          const nx = norm(loc);
          if (!nx){ rec.redirect = loc; break; }
          rec.redirect = nx; cur = nx; hops++;
          if (seen.has(nx) && nx!==n) { break; }
          continue;
        }
        rec.finalUrl = cur;
        rec.contentType = res.headers.get('content-type')||'';
        if (rec.contentType.includes('text/html')){
          const html = await res.text();
          rec.bytes = Buffer.byteLength(html);
          const f = path.join(OUT, slugFile(cur)+'.html');
          fs.writeFileSync(f, html);
          rec.file = f;
          // extract links
          for (const m of html.matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)){
            const l = norm(m[1]);
            if (l && !seen.has(l) && !SKIP_EXT.test(l)) queue.push(l);
          }
        }
        break;
      }
    } catch(e){ rec.error = String(e); }
    results.push(rec);
    console.log(rec.status, rec.url, rec.redirect?('-> '+rec.redirect):'', rec.bytes?`(${rec.bytes}b)`:'');
    fs.writeFileSync('crawl-results.json', JSON.stringify(results,null,2));
  }
  console.log('DONE', results.length);
}
run();
