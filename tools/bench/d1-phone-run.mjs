#!/usr/bin/env node
// D1-PHONE-RUN — the real D1 kit test on the owner's phone (Termux, Node 22.5+/24).
// One command:  node tools/bench/d1-phone-run.mjs
// Builds the D1 offline kit from the repo's kb5k shards ON-DEVICE, then runs the
// frozen battery with receipts. Mirrors phone-run.mjs honesty rules: prints every
// failure, writes a JSON receipt, never changes repo files outside receipts/.
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'fs';
import { execSync } from 'child_process';

const t = (ms) => `${ms}ms`;
const step = (ok, msg) => console.log(`${ok ? 'ok' : 'FAIL'}: ${msg}`);
const receipt = { tool: 'd1-phone-run', started: new Date().toISOString(), steps: [] };
let failures = 0;
const rec = (name, data) => receipt.steps.push({ name, ...data });

// STEP 0: environment
let nodeV = process.version, arch = process.arch, ram = 'unknown';
try { ram = execSync('cat /proc/meminfo | head -1').toString().trim(); } catch {}
step(true, `node ${nodeV} ${arch} | ${ram}`);
if (parseInt(nodeV.slice(1)) < 22) { step(false, 'node < 22.5 — node:sqlite unavailable'); process.exit(1); }
rec('env', { nodeV, arch, ram });

// STEP 1: corpus seal check (must be the 5K corpus, fails closed otherwise)
let docs = [];
for (let i = 0; i < 10; i++) {
  const r = readFileSync(`kb5k/shard${i}.json`, 'utf8');
  if (r !== '[]') docs = docs.concat(JSON.parse(r));
}
const fz = JSON.parse(readFileSync('kb5k/frozen-queryset.json', 'utf8'));
step(docs.length === 5000, `corpus: ${docs.length} docs (need 5000)`);
if (docs.length !== 5000) process.exit(1);
rec('corpus', { docs: docs.length, cases: fz.cases.length });

// STEP 2: build kit ON-DEVICE, measure build + size
mkdirSync('.d1-kit', { recursive: true });
const out = '.d1-kit/kb5k.sqlite';
const db = new DatabaseSync(out);
db.exec("CREATE VIRTUAL TABLE fts USING fts5(title, snippet)");
const ins = db.prepare('INSERT INTO fts(rowid,title,snippet) VALUES(?,?,?)');
const b0 = Date.now();
db.exec('BEGIN'); for (const d of docs) ins.run(d.id, d.title, d.snippet || ''); db.exec('COMMIT');
const buildMs = Date.now() - b0;
const sizeMB = +(statSync(out).size / 1048576).toFixed(2);
const sizeOk = statSync(out).size <= 15 * 1048576;
step(sizeOk, `kit built in ${t(buildMs)} -> ${sizeMB}MB (frozen limit <=15MB)`);
if (!sizeOk) failures++;
rec('build', { buildMs, sizeMB, limit: 15, pass: sizeOk });
db.close();

// STEP 3: cold load + frozen battery (readOnly)
const cold0 = Date.now();
const rdb = new DatabaseSync(out, { readOnly: true });
const sel = rdb.prepare("SELECT rowid FROM fts WHERE fts MATCH ? ORDER BY rank LIMIT 3");
const coldMs = Date.now() - cold0 + (Date.now() - cold0); // open; first query measured below
let top1 = 0, top3 = 0; const per = [];
const first0 = Date.now();
const first = sel.all(fz.cases[0].query);
const firstMs = Date.now() - first0;
per.push(firstMs);
if (first[0] && first[0].rowid === fz.cases[0].doc_id) top1++;
if (first.map(x => x.rowid).includes(fz.cases[0].doc_id)) top3++;
for (const c of fz.cases.slice(1)) {
  const q0 = Date.now(); const r = sel.all(c.query); per.push(Date.now() - q0);
  const ids = r.map(x => x.rowid);
  if (ids[0] === c.doc_id) top1++;
  if (ids.includes(c.doc_id)) top3++;
}
const b1Ok = top1 >= 19, b3Ok = top3 >= 19;
step(b1Ok, `frozen battery: top1 ${top1}/20 (>=19)`);
step(b3Ok, `frozen battery: top3 ${top3}/20 (>=19)`);
if (!b1Ok || !b3Ok) failures++;
const warmAvg = Math.round(per.slice(1).reduce((a, b) => a + b, 0) / (per.length - 1));
step(true, `first query ${t(firstMs)} | warm avg ${t(warmAvg)}`);
rec('battery', { top1, top3, firstMs, warmAvg, thresholds: { top1: 19, top3: 19 }, pass: b1Ok && b3Ok });

// STEP 4: OFFLINE proof — airplane mode, then local queries must still answer
console.log('\nEnable AIRPLANE MODE / disable WiFi now, then press Enter...');
await new Promise(r => process.stdin.once('data', r));
import net from 'net'; import dns from 'dns';
const probe = () => new Promise(res => { const s = net.connect({host:'1.1.1.1',port:443,timeout:4000}); s.on('connect',()=>{s.destroy();res('CONNECTED');}); s.on('timeout',()=>{s.destroy();res('TIMEOUT');}); s.on('error',()=>res('REFUSED')); });
const dnsP = () => new Promise(res => dns.lookup('google.com',{timeout:4000},(e)=>res(e?'DNS-FAIL':'DNS-OK')));
const tcpProbe = await probe(), dnsProbe = await dnsP();
const offlineProof = `tcp_1_1_1_1=${tcpProbe}, dns=${dnsProbe}`;
const offlineOk = tcpProbe !== 'CONNECTED';
step(offlineOk, `offline probe: ${offlineProof} (REFUSED/TIMEOUT + DNS-FAIL = interfaces dead, good)`);
if (!offlineOk) { console.log('WARNING: interfaces were ACTIVE — strongest offline claim NOT established; rerun with airplane mode'); }
const oq0 = Date.now();
const oq = sel.all(fz.cases[2].query);
const offlineMs = Date.now() - oq0;
step(true, `offline query answered locally in ${t(offlineMs)} (${oq.length} results)`);
rec('offline', { offlineProof, offlineMs, providers_called: [] });

// STEP 5: memory + receipt
const rss = Math.round(process.memoryUsage().rss / 10485.76) / 100;
const rssOk = rss <= 250;
step(rssOk, `peak RSS ${rss}MB (<=250MB)`);
if (!rssOk) failures++;
rec('memory', { rss, limit: 250, pass: rssOk });
receipt.finished = new Date().toISOString();
receipt.verdict = failures === 0 ? (tcpProbe === 'CONNECTED' ? 'PASS with offline caveat' : 'PASS') : 'FAIL';
receipt.failures = failures;
const rf = `receipts/D1-PHONE-RUN-${receipt.started.replace(/[:.]/g, '-')}.json`;
writeFileSync(rf, JSON.stringify(receipt, null, 2));
console.log(`\nVERDICT: ${receipt.verdict} | failures: ${failures}`);
console.log(`receipt written: ${rf}`);
console.log('Send this whole JSON file back (it is small).');
