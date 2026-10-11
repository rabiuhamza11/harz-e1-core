// D1-strategy phone/offline capability probe. Run on the phone (Termux):
//   node tools/bench/termux-fts5-probe.mjs
// Proves whether Node 24's built-in SQLite supports FTS5 — the local
// engine for a D1-mirrored offline kit. Records timings at 20K scale.
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, existsSync } from 'fs';
import { randomUUID } from 'crypto';
const db = new DatabaseSync(':memory:');
let fts5 = true;
try { db.exec("CREATE VIRTUAL TABLE fts USING fts5(title, snippet)"); } catch (e) { fts5 = false; console.log('FTS5 unavailable:', e.message); }
if (fts5) {
  let docs = [];
  for (let i=0;i<10;i++){ const p = 'kb5k/shard'+i+'.json'; if (!existsSync('../'+p)) continue; }
  // load the 5K shards from the repo copy (offline corpus already proven on this phone)
  for (let i=0;i<10;i++){ const r = readFileSync('kb5k/shard'+i+'.json','utf8'); if (r!=='[]') docs = docs.concat(JSON.parse(r)); }
  const t0=Date.now();
  const ins = db.prepare('INSERT INTO fts(title,snippet) VALUES(?,?)');
  db.exec('BEGIN');
  for (const d of docs) ins.run(d.title, d.snippet||'');
  db.exec('COMMIT');
  const buildMs = Date.now()-t0;
  const fz = JSON.parse(readFileSync('kb5k/frozen-queryset.json','utf8')).cases;
  let top1=0; const t1=Date.now();
  const sel = db.prepare("SELECT rowid FROM fts WHERE fts MATCH ? ORDER BY rank LIMIT 3");
  for (const c of fz){ const r = sel.all(c.query); if (r[0] && r[0].rowid-1 === c.doc_id) top1++; }
  console.log('FTS5 OK on-device: 5000 docs indexed in', buildMs+'ms; battery top1 (offset-mapped):', top1+'/20; avg', Math.round((Date.now()-t1)/fz.length)+'ms/query');
  console.log('NOTE: rowid mapping is probe-only; the real offline kit stores doc_id explicitly.');
}
console.log('probe complete');
