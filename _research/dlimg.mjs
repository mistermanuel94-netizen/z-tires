import fs from 'node:fs';
import path from 'node:path';
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const imgs = JSON.parse(fs.readFileSync('images.json','utf8'));
const OUT='assets/orig'; fs.mkdirSync(OUT,{recursive:true});
// keep only flextyres.com uploads
const cand = imgs.map(i=>i.url).filter(u=>/flextyres\.com\/.*wp-content\/uploads\//.test(u));
// strip WP size suffix to get the original
const orig = new Set();
for (const u of cand){
  orig.add(u.replace(/-\d+x\d+(_c)?(?=\.(jpe?g|png|webp|gif)$)/i,''));
}
console.log('candidates:', cand.length, 'originals:', orig.size);
const report=[];
for (const u of orig){
  const name = decodeURIComponent(path.basename(new URL(u).pathname));
  const dest = path.join(OUT, name);
  try{
    const r = await fetch(u,{headers:{'User-Agent':UA}});
    if(!r.ok){ report.push({u,status:r.status}); continue; }
    const b = Buffer.from(await r.arrayBuffer());
    fs.writeFileSync(dest,b);
    report.push({u,status:200,bytes:b.length,file:dest});
  }catch(e){ report.push({u,error:String(e)}); }
}
fs.writeFileSync('img-download.json',JSON.stringify(report,null,2));
const ok=report.filter(r=>r.status===200);
console.log('downloaded',ok.length,'total bytes',ok.reduce((a,b)=>a+b.bytes,0));
console.log('failed:', report.filter(r=>r.status!==200).map(r=>r.status+' '+r.u).join('\n'));
