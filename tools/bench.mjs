import { readFileSync } from 'fs';
import os from 'os';
const src = readFileSync('/tmp/e1-core/harz-e1-core-v03.js','utf8')
  .replace('export default','const __w=');
const mod = await import('data:text/javascript;base64,'+Buffer.from(src+';export{__w as default}').toString('base64'));
const worker = mod.default;
const kv = new Map();
kv.set('e1:kb5k:manifest', readFileSync('manifest-5k.json','utf8'));
for (let i=0;i<10;i++) kv.set('e1:kb5k:shard'+i, readFileSync('shard'+i+'.json','utf8'));
const env = { E1_MEMORY: { get: async k => kv.get(k) ?? null, put: async (k,v) => kv.set(k,v) } };
const gb = () => process.memoryUsage();
const mb = b => Math.round(b/10485.76)/100;
console.log('RSS before load:', mb(gb().rss), 'MB | heapUsed:', mb(gb().heapUsed), 'MB');
// COLD: first /test/suite forces full loadKB of all shards + parse
let t0 = Date.now();
const r1 = await (await worker.fetch(new Request('https://x/test/suite'), env)).json();
const coldMs = Date.now()-t0;
console.log('COLD suite wall:', coldMs, 'ms | passed:', r1.passed+'/'+r1.total);
console.log('RSS after cold:', mb(gb().rss), 'MB | heapUsed:', mb(gb().heapUsed), 'MB');
// WARM: 20-query battery (frozen set)
const fz = JSON.parse(readFileSync('/tmp/e1-5k/frozen-queryset.json','utf8')).cases;
let peakHeap = gb().heapUsed, t1=Date.now(), top1=0;
for (const c of fz) {
  const r = await (await worker.fetch(new Request('https://x/task',{method:'POST',body:JSON.stringify({module:'knowledge',input:{query:c.query,tier:'corpus'}})}), env)).json();
  const ids=(r.citations||[]).map(x=>x.doc_id);
  if (ids[0]===c.doc_id) top1++;
  if (gb().heapUsed>peakHeap) peakHeap=gb().heapUsed;
}
const warmAvg = (Date.now()-t1)/fz.length;
console.log('WARM battery:', fz.length, 'queries | avg', Math.round(warmAvg), 'ms | top-1:', top1+'/20');
console.log('PEAK heapUsed during battery:', mb(peakHeap), 'MB | RSS:', mb(gb().rss), 'MB');
// integrity cross-check: pack sha + sample sha vs live worker values
const h = await (await worker.fetch(new Request('https://x/health'), env)).json();
console.log('pack_sha:', h.pack_sha.slice(0,16), '| sample:', h.knowledge.corpus_sample, h.knowledge.sample_sha.slice(0,12));
console.log('providers_wired:', JSON.stringify(h.providers_wired));
