#!/usr/bin/env python3
"""Seal recipe v2: sha256 over compact JSON array (ensure_ascii=False, byte-identical to JS JSON.stringify)
of [id,title,url,domain,source,fetched_at,content_hash,snippet] sorted by id. Usage: seal-verify.py manifest.json shard*.json"""
import json,sys,hashlib
man=json.load(open(sys.argv[1]))
docs=[]
for p in sys.argv[2:]:
    docs.extend(json.load(open(p)))
docs.sort(key=lambda d:d['id'])
F=['id','title','url','domain','source','fetched_at','content_hash','snippet']
recs=[[d[f] for f in F] for d in docs]
seal=hashlib.sha256(json.dumps(recs,separators=(',',':'),ensure_ascii=False).encode()).hexdigest()
ok = seal==man['sample_sha'] and len(docs)==man['count']
print(f"docs={len(docs)} (manifest {man['count']}) sample_sha={seal[:16]}... MATCH={ok}")
sys.exit(0 if ok else 1)
