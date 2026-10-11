// TEMPORARY upload helper: PUT shard objects into the R2 bucket via binding, then this worker is deleted.
// Security: refuses to run unless a one-time key matches (set at deploy, deleted after).
export default {
  async fetch(req, env){
    const u = new URL(req.url);
    if (u.pathname==='/put' && req.method==='POST'){
      if (req.headers.get('x-upload-key') !== env.UPLOAD_KEY) return new Response('forbidden',{status:403});
      const b = await req.json();
      const obj = await env.KB.put(b.key, JSON.stringify(b.body), { httpMetadata:{contentType:'application/json'} });
      return Response.json({ok:true, key:b.key, bytes:JSON.stringify(b.body).length});
    }
    if (u.pathname==='/ls' && req.method==='GET'){
      const l = await env.KB.list();
      return Response.json({objects:l.objects.map(o=>({key:o.key,size:o.size}))});
    }
    return new Response('?',{status:404});
  }
};
