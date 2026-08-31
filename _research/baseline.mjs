import fs from 'node:fs';
import * as cheerio from 'cheerio';
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const html = fs.readFileSync('pages/en.html','utf8');
const $ = cheerio.load(html);
const urls = new Set();
$('link[rel="stylesheet"]').each((i,e)=>urls.add({t:'css',u:$(e).attr('href')}));
$('script[src]').each((i,e)=>urls.add({t:'js',u:$(e).attr('src')}));
$('img').each((i,e)=>{const s=$(e).attr('src'); if(s && !s.startsWith('data:')) urls.add({t:'img',u:s});});
const list=[...urls];
const tot={css:0,js:0,img:0,other:0};
let count=0, fails=0;
await Promise.all(list.map(async ({t,u})=>{
  try{
    const abs = u.startsWith('//')?'https:'+u:new URL(u,'https://flextyres.com/en/').toString();
    const r = await fetch(abs,{headers:{'User-Agent':UA,'Accept-Encoding':'gzip, deflate, br'}});
    const b = await r.arrayBuffer();
    tot[t]=(tot[t]||0)+b.byteLength; count++;
  }catch(e){ fails++; }
}));
const htmlBytes = Buffer.byteLength(html);
console.log('HTML (uncompressed):', htmlBytes);
console.log('CSS  bytes:', tot.css, ' JS bytes:', tot.js, ' IMG bytes:', tot.img);
console.log('resource requests fetched:', count, 'failed:', fails, 'total listed:', list.length);
console.log('TOTAL (html+css+js+img, uncompressed):', htmlBytes+tot.css+tot.js+tot.img);
