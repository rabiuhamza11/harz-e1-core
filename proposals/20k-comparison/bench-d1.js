// harz-e1-bench-d1 — D1+FTS5 index strategy at 20K docs (measurement-only)
const J = (o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{'content-type':'application/json'}});
export default {
  async fetch(req, env){
    try{
      const u = new URL(req.url);
      if (u.pathname==='/health'){
        const t0=Date.now();
        const r=await env.DB.prepare("SELECT COUNT(*) c FROM docs").first();
        return J({strategy:'D1+FTS5', docs:r.c, count_ms:Date.now()-t0});
      }
      if (u.pathname==='/bench' && req.method==='POST'){
        const body = await req.json();
        const out=[]; let first=null;
        for (const c of body.cases){
          const t0=Date.now();
          const rows = await env.DB.prepare(
            "SELECT d.id, d.title, d.url, d.domain, d.source, d.content_hash, d.fetched_at, bm25(fts) AS rank FROM fts JOIN docs d ON d.id = fts.rowid WHERE fts MATCH ? ORDER BY rank LIMIT 3"
          ).bind(c.query).all();
          const ms=Date.now()-t0;
          if (first===null) first=ms;
          const ids=(rows.results||[]).map(r=>r.id);
          out.push({expect:c.doc_id, returned:ids, top1:ids[0]===c.doc_id, top3:ids.slice(0,3).includes(c.doc_id), ms, cites:rows.results});
        }
        const top1=out.filter(x=>x.top1).length, top3=out.filter(x=>x.top3).length;
        return J({strategy:'D1+FTS5', first_query_ms:first, avg_ms:Math.round(out.reduce((a,b)=>a+b.ms,0)/out.length), top1:top1+'/'+out.length, top3:top3+'/'+out.length, cases:out});
      }
      return J({error:'unknown path'});
    }catch(e){ return J({error:'bench exception: '+e.message},500); }
  }
};
