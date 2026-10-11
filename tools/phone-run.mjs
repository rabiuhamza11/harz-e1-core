#!/usr/bin/env node
// E1-KNOWLEDGE-2 PHONE GATE KIT — executes the owner-approved 8-step protocol.
// No dependencies. Node 18+. Usage: node tools/phone-run.mjs [--noninteractive]
// Emits receipts/PHONE-RUN-<ts>.json. Thresholds are FROZEN in this file and
// must not be changed after observing results (owner ruling, Oct 11 2026).
import { readFileSync, readdirSync, statSync, mkdirSync, writeFileSync } from 'fs';
import net from 'net'; import dns from 'dns'; import os from 'os';
import { execSync } from 'child_process';
const INTERACTIVE = !process.argv.includes('--noninteractive');
const ROOT = new URL('..', import.meta.url).pathname;
const sha256 = async s => { const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(d)].map(b=>b.toString(16).padStart(2,'0')).join(''); };
const R = { kit: 'E1-KNOWLEDGE-2 phone gate v1', started: new Date().toISOString(),
  device: { platform: os.platform(), arch: os.arch(), cpu: os.cpus()[0]?.model, cores: os.cpus().length, total_ram_mb: Math.round(os.totalmem()/1048576), node: process.version } };
R.failures = []; R.steps = {};
const fail = m => { R.failures.push(m); console.log('  FAIL:', m); };
const ok = m => console.log('  ok:', m);

// ---- STEP 0: preserve artifact hashes BEFORE testing ----
console.log('STEP 0 — artifact hashes (preserved before testing)');
const files = {};
for (const f of ['kb5k/manifest.json','harz-e1-core.js','tools/phone-run.mjs','kb5k/frozen-queryset.json'])
  files[f] = await sha256(readFileSync(ROOT+f,'utf8'));
for (const f of readdirSync(ROOT+'kb5k').filter(x=>x.startsWith('shard')))
  files['kb5k/'+f] = await sha256(readFileSync(ROOT+'kb5k/'+f,'utf8'));
R.steps.s0 = { artifact_sha256: files };
ok(Object.keys(files).length + ' artifacts hashed');

// ---- STEP 1: verify manifest and shard seal ----
console.log('STEP 1 — manifest + shard seal');
const man = JSON.parse(readFileSync(ROOT+'kb5k/manifest.json','utf8'));
let docs = [];
for (const f of readdirSync(ROOT+'kb5k').filter(x=>x.startsWith('shard')))
  docs = docs.concat(JSON.parse(readFileSync(ROOT+'kb5k/'+f,'utf8')));
docs.sort((a,b)=>a.id-b.id);
const F = ['id','title','url','domain','source','fetched_at','content_hash','snippet'];
const seal = await sha256(JSON.stringify(docs.map(d=>F.map(f=>d[f]))));
R.steps.s1 = { docs: docs.length, manifest_count: man.count, recomputed_sha: seal, manifest_sha: man.sample_sha,
  MATCH: seal===man.sample_sha && docs.length===man.count };
R.steps.s1.MATCH ? ok('seal MATCH, '+docs.length+' docs') : fail('seal/count mismatch');

// ---- STEP 2: confirm the 5,000-doc corpus, not the 1,015 baseline ----
console.log('STEP 2 — corpus identity');
const isBase = seal.startsWith('7c5a9003463a97b2');
R.steps.s2 = { count: docs.length, is_5000: docs.length===5000, is_baseline: isBase, seal_prefix: seal.slice(0,8) };
if (docs.length!==5000) fail('not the 5,000-doc corpus ('+docs.length+')');
else if (isBase) fail('baseline corpus loaded by mistake');
else ok('5,000-doc corpus confirmed, seal '+seal.slice(0,8));

// ---- STEP 3: installation size; peak RSS tracked across the run ----
console.log('STEP 3 — install size');
let bytes = 0; for (const f of Object.keys(files)) bytes += statSync(ROOT+f).size;
R.steps.s3 = { install_bytes: bytes, install_mb: Math.round(bytes/10485.76)/100, limit_mb: 15, within: bytes<=15*1048576 };
R.steps.s3.within ? ok('install '+(bytes/1048576).toFixed(1)+'MB <= 15MB') : fail('install exceeds 15MB');
let peakRSS = 0; const trackRSS = () => { const r = process.memoryUsage().rss; if (r>peakRSS) peakRSS = r; };

// ---- build the worker with an fs-backed KV shim ----
const src = readFileSync(ROOT+'harz-e1-core.js','utf8').replace('export default','const __w=');
const mod = await import('data:text/javascript;base64,'+Buffer.from(src+';export{__w as default}').toString('base64'));
const worker = mod.default;
const kv = new Map();
kv.set('e1:kb5k:manifest', readFileSync(ROOT+'kb5k/manifest.json','utf8'));
for (let i=0;i<10;i++) kv.set('e1:kb5k:shard'+i, readFileSync(ROOT+'kb5k/shard'+i+'.json','utf8'));
const env = { E1_MEMORY: { get: async k => kv.get(k) ?? null, put: async (k,v) => kv.set(k,v) } };
const ask = async q => (await worker.fetch(new Request('https://x/task',{method:'POST',body:JSON.stringify({module:'knowledge',input:{query:q,tier:'corpus'}})}), env)).json();
const task = async (m,i) => (await worker.fetch(new Request('https://x/task',{method:'POST',body:JSON.stringify({module:m,input:i})}), env)).json();

// ---- STEP 4: cold load measured separately from warm latency ----
console.log('STEP 4 — cold load vs warm latency (COLD = fresh isolate: full shard read + parse)');
let t0 = Date.now();
const first = await ask('Ebonyi stakeholders manifesto 2027 elections'); trackRSS();
const cold1 = Date.now()-t0;
// true cold: reconstruct the module + KV fresh
t0 = Date.now();
const mod2 = await import('data:text/javascript;base64,'+Buffer.from(src+';export{__w as d2}').toString('base64'));
const w2 = mod2.d2;
const kv2 = new Map();
kv2.set('e1:kb5k:manifest', readFileSync(ROOT+'kb5k/manifest.json','utf8'));
for (let i=0;i<10;i++) kv2.set('e1:kb5k:shard'+i, readFileSync(ROOT+'kb5k/shard'+i+'.json','utf8'));
const env2 = { E1_MEMORY: { get: async k => kv2.get(k) ?? null, put: async (k,v) => kv2.set(k,v) } };
await w2.fetch(new Request('https://x/health'), env2); // health triggers loadKB
const coldMs = Date.now()-t0; trackRSS();
R.steps.s4 = { cold_full_load_ms: coldMs, cold_first_query_ms: cold1, limit_cold_ms: 3000, within: coldMs<=3000 };
R.steps.s4.within ? ok('cold load '+coldMs+'ms <= 3000ms') : fail('cold load '+coldMs+'ms > 3000ms');

// warm battery on the FROZEN query set
const fz = JSON.parse(readFileSync(ROOT+'kb5k/frozen-queryset.json','utf8'));
let top1=0, top3=0, exact=0, qms=[];
for (const c of fz.cases) {
  t0 = Date.now();
  const r = await ask(c.query); qms.push(Date.now()-t0); trackRSS();
  const ids = (r.citations||[]).map(x=>x.doc_id);
  if (ids[0]===c.doc_id) top1++;
  if (ids.slice(0,3).includes(c.doc_id)) top3++;
  for (const x of (r.citations||[])) if (x.doc_id===c.doc_id) {
    const s = docs.find(d=>d.id===c.doc_id);
    if (x.title===s.title && x.url===s.url && x.content_hash===s.content_hash && x.fetched_at===s.fetched_at) exact++;
  }
}
// refusal case (pre-verified non-lexicon)
const refuse = await task('knowledge',{query:'qwzxvk pjorlmf vbnmtre',tier:'corpus'}); trackRSS();
R.steps.s5 = { cases: fz.cases.length, top1, top3, citation_exact: exact,
  thresholds: { top1: 19, top3: 19, citation_exact_of_retrievals: '100%' },
  refusal: { verdict: refuse.verdict, honest: refuse.verdict==='UNSUPPORTED' },
  warm_avg_ms: Math.round(qms.reduce((a,b)=>a+b,0)/qms.length), warm_max_ms: Math.max(...qms) };
const retrieved = top1; // citations checked only on retrieved docs
if (top1>=19 && top3>=19 && exact===retrieved && refuse.verdict==='UNSUPPORTED') ok('frozen battery: top1 '+top1+'/20, top3 '+top3+'/20, citations '+exact+'/'+retrieved+', refusal honest');
else fail('frozen battery: top1 '+top1+'/20, top3 '+top3+'/20, citations '+exact+'/'+retrieved+', refusal '+refuse.verdict);

// ---- STEP 6: connectivity probe (owner disables interfaces first) ----
console.log('STEP 6 — connectivity test');
if (INTERACTIVE) {
  console.log('\n  >>> ENABLE AIRPLANE MODE / DISABLE WIFI NOW, then press Enter (120s timeout) <<<');
  await new Promise(res => { const t=setTimeout(res,120000); process.stdin.once('data',()=>{clearTimeout(t);res();}); });
} else console.log('  (noninteractive: connectivity probe still recorded)');
const probe = () => new Promise(res => { const s = net.connect({host:'1.1.1.1',port:443,timeout:4000}); s.on('connect',()=>{s.destroy();res('CONNECTED');}); s.on('timeout',()=>{s.destroy();res('TIMEOUT');}); s.on('error',()=>res('REFUSED')); });
const dnsP = () => new Promise(res => dns.lookup('google.com',{timeout:4000},(e)=>res(e?'DNS-FAIL':'DNS-OK')));
const offlineRun = await ask(fz.cases[0].query); trackRSS();
R.steps.s6 = { tcp_1_1_1_1: await probe(), dns: await dnsP(),
  offline_query_answered: offlineRun.verdict==='OK', offline_providers: offlineRun.providers_called, offline_seal: offlineRun.evidence?.sample_sha?.slice(0,8) };
if (R.steps.s6.tcp_1_1_1_1==='CONNECTED') R.steps.s6.warning = 'interfaces were ACTIVE — strongest offline claim NOT established; rerun with airplane mode';
ok('tcp: '+R.steps.s6.tcp_1_1_1_1+', dns: '+R.steps.s6.dns+', offline query providers_called: '+JSON.stringify(offlineRun.providers_called));

// ---- STEP 7: receipts identify correct seal; providers_called empty ----
console.log('STEP 7 — receipt integrity');
const r1 = await task('arithmetic',{expr:'17*23'});
const recs = [r1, offlineRun]; let recOK = true;
for (const r of recs) if (r.providers_called.length!==0) recOK=false;
R.steps.s7 = { arithmetic_17x23: r1.output, receipts_providers_empty: recOK,
  corpus_seal_in_receipts: offlineRun.evidence?.sample_sha?.slice(0,8), expected_seal: seal.slice(0,8),
  seal_match: offlineRun.evidence?.sample_sha===seal };
recOK && R.steps.s7.seal_match ? ok('receipts clean, seal '+seal.slice(0,8)) : fail('receipt integrity');

// ---- STEP 8: failures, battery, duration ----
const battery = () => { try { return JSON.parse(execSync('termux-battery-status 2>/dev/null').toString()); } catch { return null; } };
const batStart = R.battery_start = battery();
R.steps.s8 = { peak_rss_mb: Math.round(peakRSS/10485.76)/100, rss_limit_mb: 250, within_rss: peakRSS<=250*1048576,
  battery_telemetry: batStart ? 'termux-api recorded' : 'unavailable (termux-api not installed) — note battery behavior manually' };
R.steps.s8.within_rss ? ok('peak RSS '+R.steps.s8.peak_rss_mb+'MB <= 250MB') : fail('peak RSS exceeds 250MB');
R.finished = new Date().toISOString();
R.duration_s = Math.round((new Date(R.finished)-new Date(R.started))/1000);
R.battery_end = battery();
R.verdict = R.failures.length===0 ? (R.steps.s6.tcp_1_1_1_1==='CONNECTED' ? 'PASS with offline caveat' : 'PASS') : 'FAIL';
mkdirSync(ROOT+'receipts',{recursive:true});
const out = ROOT+'receipts/PHONE-RUN-'+R.started.replace(/[:.]/g,'-')+'.json';
writeFileSync(out, JSON.stringify(R,null,1));
console.log('\nVERDICT: '+R.verdict+' | failures: '+R.failures.length);
console.log('receipt written: '+out);
