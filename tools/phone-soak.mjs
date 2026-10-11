#!/usr/bin/env node
// E1-KNOWLEDGE-2 BATTERY SOAK (owner-side, optional). Usage: node tools/phone-soak.mjs [minutes]
// The accepted phone-run kit is FROZEN and untouched. This soak addresses the OPEN
// battery observation: repeated load+battery cycles for a sustained session.
// Termux cannot read battery % without termux-api — RECORD YOUR BATTERY %
// MANUALLY at start and end, and any device heating you observe.
import { readFileSync } from 'fs'; import os from 'os';
const mins = Number(process.argv[2]||10);
console.log('SOAK START', new Date().toISOString());
console.log('>>> NOTE YOUR BATTERY % NOW (device settings / notification shade) <<<');
let peak=0, iters=0, top1=0, total=0;
const src = readFileSync('harz-e1-core.js','utf8').replace('export default','const __w=');
const mod = await import('data:text/javascript;base64,'+Buffer.from(src+';export{__w as default}').toString('base64'));
const worker = mod.default;
const fz = JSON.parse(readFileSync('kb5k/frozen-queryset.json','utf8')).cases;
const t_end = Date.now()+mins*60000;
while (Date.now()<t_end){
  const kv=new Map();
  kv.set('e1:kb5k:manifest',readFileSync('kb5k/manifest.json','utf8'));
  for(let i=0;i<10;i++) kv.set('e1:kb5k:shard'+i,readFileSync('kb5k/shard'+i+'.json','utf8'));
  const env={E1_MEMORY:{get:async k=>kv.get(k)??null,put:async(k,v)=>kv.set(k,v)}};
  for(const c of fz){
    const r=await (await worker.fetch(new Request('https://x/task',{method:'POST',body:JSON.stringify({module:'knowledge',input:{query:c.query,tier:'corpus'}})}),env)).json();
    const ids=(r.citations||[]).map(x=>x.doc_id);
    if(ids[0]===c.doc_id) top1++; total++;
  }
  iters++;
  const rss=process.memoryUsage().rss; if(rss>peak)peak=rss;
  if(os.platform()!=='android') break; // sandbox smoke: 1 iteration
}
console.log('SOAK END', new Date().toISOString());
console.log('iterations:',iters,'| queries:',total,'| top1:',top1,'/',total,'| peak RSS:',Math.round(peak/10485.76)/100,'MB');
console.log('>>> NOTE YOUR BATTERY % NOW and any heating observed. Soak duration:',mins+' min <<<');
