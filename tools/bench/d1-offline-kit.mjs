#!/usr/bin/env node
// D1 offline kit builder + battery (Node 22.5+/24, built-in sqlite). Usage:
//   node tools/bench/d1-offline-kit.mjs build [shard-dir] [out.sqlite]
//   node tools/bench/d1-offline-kit.mjs battery [db] [frozen-json]
// No native compilation, no termux-api, works the same on sandbox and phone.
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, existsSync, statSync } from 'fs';
const [,,cmd] = process.argv;
if (cmd === 'build') {
  const dir = process.argv[3]||'/tmp/e1-20k';
  const out = process.argv[4]||'/tmp/e1-20k/kb20k.sqlite';
  if (existsSync(out)) { console.log('exists:', out, Math.round(statSync(out).size/1048576*100)/100+'MB'); process.exit(0); }
  const db = new DatabaseSync(out);
  db.exec("CREATE VIRTUAL TABLE fts USING fts5(title, snippet)");
  let docs=[];
  for(let i=0;i<10;i++){const r=readFileSync(dir+'/shard'+i+'.json','utf8');if(r!=='[]')docs=docs.concat(JSON.parse(r));}
  const t0=Date.now();
  const ins=db.prepare('INSERT INTO fts(rowid,title,snippet) VALUES(?,?,?)');
  db.exec('BEGIN'); for(const d of docs) ins.run(d.id,d.title,d.snippet||''); db.exec('COMMIT');
  console.log('built:', docs.length, 'docs in', Date.now()-t0+'ms ->', out, Math.round(statSync(out).size/1048576*100)/100+'MB');
} else if (cmd === 'battery') {
  const dbF = process.argv[3]||'/tmp/e1-20k/kb20k.sqlite';
  const fzF = process.argv[4]||'/tmp/e1-20k/frozen-20k.json';
  const db = new DatabaseSync(dbF,{readOnly:true});
  const fz = JSON.parse(readFileSync(fzF,'utf8')).cases;
  const sel = db.prepare("SELECT rowid FROM fts WHERE fts MATCH ? ORDER BY rank LIMIT 3");
  let top1=0,top3=0;const per=[];
  for(const c of fz){const t=Date.now();const r=sel.all(c.query);per.push(Date.now()-t);
    const ids=r.map(x=>x.rowid);
    if(ids[0]===c.doc_id)top1++; if(ids.includes(c.doc_id))top3++;}
  console.log('battery: top1',top1+'/'+fz.length,'| top3',top3+'/'+fz.length,
    '| first-query',per[0]+'ms | warm avg',Math.round(per.slice(1).reduce((a,b)=>a+b,0)/(per.length-1))+'ms');
  console.log('RSS:',Math.round(process.memoryUsage().rss/10485.76)/100+'MB | heap:',Math.round(process.memoryUsage().heapUsed/10485.76)/100+'MB');
} else { console.log('usage: build [shard-dir] [out] | battery [db] [frozen-json]'); }
