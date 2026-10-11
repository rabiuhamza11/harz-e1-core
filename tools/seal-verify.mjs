// Seal recipe v2 in JS — must match Python byte-for-byte. Usage: node seal-verify.mjs manifest.json shard*.json
import { readFileSync } from 'fs';
const man=JSON.parse(readFileSync(process.argv[2],'utf8'));
let docs=[];
for (const p of process.argv.slice(3)) docs=docs.concat(JSON.parse(readFileSync(p,'utf8')));
docs.sort((a,b)=>a.id-b.id);
const F=['id','title','url','domain','source','fetched_at','content_hash','snippet'];
const recs=docs.map(d=>F.map(f=>d[f]));
const seal=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(recs)));
const hex=[...new Uint8Array(seal)].map(b=>b.toString(16).padStart(2,'0')).join('');
console.log(`docs=${docs.length} (manifest ${man.count}) sample_sha=${hex.slice(0,16)}... MATCH=${hex===man.sample_sha&&docs.length===man.count}`);
process.exit(hex===man.sample_sha&&docs.length===man.count?0:1);
