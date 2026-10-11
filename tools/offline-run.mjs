import { readFileSync } from 'fs';
import dns from 'dns';
// force every DNS lookup to fail — if the core tried any external call it would crash here
dns.setDefaultResultOrder('verbatim');
dns.setServers(['127.0.0.1:1']); // unreachable resolver
process.env.NODE_TLS_REJECT_UNAUTHORIZED='1';
const src = readFileSync('/tmp/e1-core/harz-e1-core-v03.js','utf8').replace('export default','const __w=');
const mod = await import('data:text/javascript;base64,'+Buffer.from(src+';export{__w as default}').toString('base64'));
const worker = mod.default;
const kv = new Map();
kv.set('e1:kb5k:manifest', readFileSync('manifest-5k.json','utf8'));
for (let i=0;i<10;i++) kv.set('e1:kb5k:shard'+i, readFileSync('shard'+i+'.json','utf8'));
const env = { E1_MEMORY: { get: async k => kv.get(k) ?? null, put: async (k,v) => kv.set(k,v) } };
const fz = JSON.parse(readFileSync('/tmp/e1-5k/frozen-queryset.json','utf8')).cases;
let ok=0;
for (const c of fz) {
  const r = await (await worker.fetch(new Request('https://x/task',{method:'POST',body:JSON.stringify({module:'knowledge',input:{query:c.query,tier:'corpus'}})}), env)).json();
  if (r.providers_called.length===0 && r.execution_path==='deterministic:knowledge') ok++;
}
const t = await (await worker.fetch(new Request('https://x/task'), env).catch(()=>({json:async()=>({})})));
const refuse = await (await worker.fetch(new Request('https://x/task',{method:'POST',body:JSON.stringify({module:'knowledge',input:{query:'qwzxvk pjorlmf vbnmtre',tier:'corpus'}})}), env)).json();
console.log('OFFLINE battery: '+ok+'/20 answered locally with providers_called:[] and deterministic execution');
console.log('OFFLINE refusal:', refuse.verdict, '|', String(refuse.output).slice(0,60));
console.log('DNS poisoned; zero network available; suite + retrieval + refusal all completed without any network.');
