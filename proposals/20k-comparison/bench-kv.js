// harz-e1-bench-kv — KV-sharding strategy at 20K docs (measurement-only; live core untouched)
const KB_PREFIX = 'e1:kb20k:'; const KB_SHARDS = 10; let kbCache = null; let loaded = false;
const J = (o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{'content-type':'application/json'}});
async function loadKB(env){
  if (kbCache) return kbCache;
  const manifest = JSON.parse(await env.E1_MEMORY.get(KB_PREFIX+'manifest'));
  const docs = [];
  for (let i=0;i<KB_SHARDS;i++){ const raw = await env.E1_MEMORY.get(KB_PREFIX+'shard'+i); if(raw===null||raw==='') continue; docs.push(...JSON.parse(raw)); }
  if (docs.length !== manifest.count) throw new Error('count mismatch '+docs.length+' vs '+manifest.count+' — fail-closed');
  kbCache = { manifest, docs }; loaded = true;
  return kbCache;
}
function score(query, kb){
  const words = String(query||'').toLowerCase().split(/\s+/).filter(w=>w.length>3);
  const scored = [];
  for (const d of kb.docs){ const t=d.title.toLowerCase(), s=(d.snippet||'').toLowerCase(); let sc=0;
    for (const w of words){ if (t.includes(w)) sc+=3; else if (s.includes(w)) sc+=1; }
    if (sc>=3) scored.push({score:sc,d}); }
  scored.sort((a,b)=>b.score-a.score||a.d.id-b.d.id);
  return scored.slice(0,3).map(x=>({doc_id:x.d.id,title:x.d.title,url:x.d.url,domain:x.d.domain,source:x.d.source,content_hash:x.d.content_hash,fetched_at:x.d.fetched_at,score:x.score}));
}
export default {
  async fetch(req, env){
    try{
      const u = new URL(req.url);
      if (u.pathname==='/health'){
        const t0=Date.now(); const kb=await loadKB(env); const ms=Date.now()-t0;
        return J({strategy:'KV 10-shard', docs:kb.docs.length, sha:kb.manifest.sample_sha.slice(0,12), load_ms:ms, was_cold:!loaded});
      }
      if (u.pathname==='/bench' && req.method==='POST'){
        const body = await req.json();
        const out=[]; let coldMs=null;
        for (const c of body.cases){
          const t0=Date.now(); const kb=await loadKB(env); const cites=score(c.query,kb); const ms=Date.now()-t0;
          if (coldMs===null) coldMs=Date.now()-t0;
          const ids=cites.map(x=>x.doc_id);
          out.push({expect:c.doc_id, returned:ids, top1:ids[0]===c.doc_id, top3:ids.slice(0,3).includes(c.doc_id), ms, cites});
        }
        const top1=out.filter(x=>x.top1).length, top3=out.filter(x=>x.top3).length;
        return J({strategy:'KV 10-shard', cold_first_query_ms:coldMs, warm_avg_ms:Math.round(out.slice(1).reduce((a,b)=>a+b.ms,0)/(out.length-1)), top1:top1+'/'+out.length, top3:top3+'/'+out.length, cases:out});
      }
      return J({error:'unknown path'});
    }catch(e){ return J({error:'bench exception: '+e.message},500); }
  }
};
