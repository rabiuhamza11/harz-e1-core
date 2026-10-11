import { readFileSync } from 'fs';
const before = process.memoryUsage();
let docs=[];
const t0=Date.now();
const man=JSON.parse(readFileSync('manifest-20k.json','utf8'));
for(let i=0;i<10;i++){ const r=readFileSync('shard'+i+'.json','utf8'); if(r==='[]') continue; docs=docs.concat(JSON.parse(r)); }
const coldMs=Date.now()-t0;
const after=process.memoryUsage();
let peak=process.memoryUsage().heapUsed;
const fz=JSON.parse(readFileSync('frozen-20k.json','utf8')).cases;
let top1=0;const t1=Date.now();
for(const c of fz){
  const words=c.query.toLowerCase().split(/\s+/).filter(w=>w.length>3);
  const scored=[];
  for(const d of docs){const t=d.title.toLowerCase(),s=(d.snippet||'').toLowerCase();let sc=0;
    for(const w of words){if(t.includes(w))sc+=3;else if(s.includes(w))sc+=1;}
    if(sc>=3)scored.push({sc,d});}
  scored.sort((a,b)=>b.sc-a.sc||a.d.id-b.d.id);
  if(scored[0]&&scored[0].d.id===c.doc_id)top1++;
  if(process.memoryUsage().heapUsed>peak)peak=process.memoryUsage().heapUsed;
}
console.log('COLD full load:',coldMs,'ms | docs:',docs.length);
console.log('heapUsed before/after load:',Math.round(before.heapUsed/10485.76)/100,'->',Math.round(after.heapUsed/10485.76)/100,'MB | PEAK during battery:',Math.round(peak/10485.76)/100,'MB');
console.log('RSS:',Math.round(process.memoryUsage().rss/10485.76)/100,'MB | battery top1:',top1+'/20 | battery wall:',Date.now()-t1,'ms');
