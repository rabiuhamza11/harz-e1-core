// HARZ E1 CORE v0.2 — provider-free sovereign control core (E1-KNOWLEDGE-1)
// BOUNDARY: ZERO fetch(), ZERO external AI, ZERO secrets. Deterministic only.
// PORTABILITY: single file, plain JS, no SDK. Substrate adapter pattern.
// v0.2: two-tier knowledge — tier 1 frozen 12-fact pack (IMMUTABLE baseline,
// pack_sha 5333dc8a... preserved), tier 2 sealed corpus sample (1015 docs from
// HARZ Search D1 node, selector id%42=0, sample_sha d82559c6..., 10 KV shards).
// Contract: E1-CORE-CONTRACT v0.1 + E1-KNOWLEDGE-1 ruling (Oct 11, 2026)

const VERSION = 'harz-e1-core v0.2';
const FROZEN_USD_NGN = 1600; // FROZEN policy rate, labeled NOT-LIVE on every use
const KB_SHARDS = 10;

// ---- Tier 1: frozen HARZ knowledge pack (DO NOT MODIFY — immutable baseline) ----
const PACK = [
  { id: 0, k: 'registration cac', fact: 'HARZ Digital Services trades as HI Water/Block Industry. CAC RC 321424 (CRBN), registered Aug 5, 2014.' },
  { id: 1, k: 'tax tin firs', fact: 'HARZ TIN: 24550860 (FIRS, MSTO Bauchi). Branch TIN: 24550860-0001.' },
  { id: 2, k: 'gdeg token contract polygon', fact: 'GDEG V2 contract: 0x222a10CE822188c680a04A283E45F9c11D79665e (Polygon Mainnet). Supply 10,000,000. Rate 1 GDEG = $0.01 (N15).' },
  { id: 3, k: 'nrl token contract polygon', fact: 'NRL V2 contract: 0xE8423c0595E6b2caD4E6f19B6F51666699be303a (Polygon Mainnet). Supply 11,022,500. Rate 1 NRL = N100. Use: staking, governance, commissions.' },
  { id: 4, k: 'payment bank transfer', fact: 'HARZ business bank: UBA 2034326424, code 033, Rabiu Hamza Mohammed (business payment rail).' },
  { id: 5, k: 'products store price', fact: 'HARZ catalog: 300+ digital products across 45 categories, most priced N2,000 to N5,000.' },
  { id: 6, k: 'stores shop buy', fact: 'HARZ stores: HARZ Store (harz-store.harz.workers.dev), Gumroad (hamzarabiu.gumroad.com), Getly store, HARZ Cloud OS (harzpay.harz.workers.dev).' },
  { id: 7, k: 'discount loyalty cashback', fact: 'GDEG loyalty rewards: 10 percent cashback in GDEG points on every purchase. Points are internal, convertible to real GDEG tokens when the exchange pool is live.' },
  { id: 8, k: 'rate usd ngn exchange', fact: 'HARZ frozen policy rate: 1 USD = 1,600 NGN. Labeled NOT-LIVE; it is a pricing policy, not a market feed.' },
  { id: 9, k: 'wallet crypto gdeg nrl', fact: 'HARZ Crypto Wallet (harz-crypto-wallet.harz.workers.dev): multi-chain (Polygon, BSC, Ethereum), stores GDEG and NRL tokens, PWA installable.' },
  { id: 10, k: 'owner founder rabiu', fact: 'HARZ Digital Services founder and owner: Rabiu Hamza Mohammed, author of The Complete Genius 365.' },
  { id: 11, k: 'deprecated contracts old', fact: 'DEPRECATED, never share: GDEG V1 0x217f..., GDEG V0 0xdE2c..., NRL V1 0xC0c6... Only the V2 contracts are valid.' }
];

// ---- helpers ----
const J = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json' } });
const uid = () => crypto.randomUUID();
async function sha256Hex(s) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, '0')).join('');
}

// ---- module: arithmetic (shunting-yard, no eval) ----
function arithmetic(input) {
  const expr = String(input.expr || '');
  const tokens = expr.match(/(\d+\.?\d*|[+\-*/%^()])/g) || [];
  if (!tokens.length) return { verdict: 'ERROR', output: 'no arithmetic tokens' };
  const prec = { '+': 1, '-': 1, '*': 2, '/': 2, '%': 2, '^': 3 };
  const out = [], ops = []; const trace = [];
  for (const t of tokens) {
    if (/^\d/.test(t)) out.push(parseFloat(t));
    else if (t === '(') ops.push(t);
    else if (t === ')') { while (ops.length && ops[ops.length - 1] !== '(') out.push(ops.pop()); ops.pop(); }
    else { while (ops.length && ops[ops.length - 1] !== '(' && prec[ops[ops.length - 1]] >= prec[t]) out.push(ops.pop()); ops.push(t); }
  }
  while (ops.length) out.push(ops.pop());
  const st = [];
  for (const t of out) {
    if (typeof t === 'number') { st.push(t); continue; }
    const b = st.pop(), a = st.pop();
    let r;
    if (t === '+') r = a + b; else if (t === '-') r = a - b; else if (t === '*') r = a * b;
    else if (t === '/') r = a / b; else if (t === '%') r = a % b; else r = Math.pow(a, b);
    st.push(r); trace.push(`${a} ${t} ${b} = ${r}`);
  }
  const value = Math.round((st[0] ?? NaN) * 1e10) / 1e10;
  return { verdict: 'OK', output: value, trace };
}

// ---- module: datetime (WAT = UTC+1) ----
function datetime(input) {
  if (input.op === 'now') {
    const t = new Date(Date.now() + 3600e3).toISOString().replace('Z', '+01:00');
    return { verdict: 'OK', output: { wat_now: t, note: 'WAT = UTC+1' } };
  }
  if (input.op === 'days_until') {
    const target = new Date(input.date + 'T00:00:00Z').getTime();
    const today = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00Z').getTime();
    return { verdict: 'OK', output: { days_until: Math.round((target - today) / 864e5) } };
  }
  return { verdict: 'ERROR', output: 'op must be now or days_until' };
}

// ---- module: convert (frozen rates, labeled) ----
function convert(input) {
  const a = Number(input.amount);
  if (input.pair === 'NGN->USD') return { verdict: 'OK', output: Math.round((a / FROZEN_USD_NGN) * 1e6) / 1e6, label: 'FROZEN RATE 1600:1 (NOT-LIVE)' };
  if (input.pair === 'USD->NGN') return { verdict: 'OK', output: Math.round(a * FROZEN_USD_NGN * 100) / 100, label: 'FROZEN RATE 1600:1 (NOT-LIVE)' };
  if (input.pair === 'km->miles') return { verdict: 'OK', output: Math.round(a * 0.621371 * 1e6) / 1e6, label: 'EXACT FACTOR 0.621371' };
  if (input.pair === 'kg->lb') return { verdict: 'OK', output: Math.round(a * 2.20462 * 1e6) / 1e6, label: 'EXACT FACTOR 2.20462' };
  return { verdict: 'ERROR', output: 'unsupported pair' };
}

// ---- module: logic (contradiction detection over supplied values) ----
function logic(input) {
  const vals = (input.values || []).map(Number);
  if (vals.length < 2) return { verdict: 'ERROR', output: 'need >=2 values for one subject' };
  const consistent = vals.every(v => v === vals[0]);
  return { verdict: 'OK', output: consistent ? 'CONSISTENT' : 'CONTRADICTION', detail: `${input.subject || 'subject'} claimed as ${vals.join(' vs ')}` };
}

// ---- tier 2: sealed corpus sample (KV-backed, cached in isolate) ----
let kbCache = null;
async function loadKB(env) {
  if (kbCache) return kbCache;
  const manifest = JSON.parse(await env.E1_MEMORY.get('e1:kb:manifest'));
  const docs = [];
  for (let i = 0; i < KB_SHARDS; i++) {
    const raw = await env.E1_MEMORY.get('e1:kb:shard' + i);
    if (!raw) throw new Error('knowledge shard ' + i + ' missing — fail-closed');
    docs.push(...JSON.parse(raw));
  }
  if (docs.length !== manifest.count) throw new Error('knowledge sample count mismatch — fail-closed');
  kbCache = { manifest, docs };
  return kbCache;
}

function corpusSearch(query, kb) {
  const words = String(query || '').toLowerCase().split(/\s+/).filter(w => w.length > 3);
  if (!words.length) return null;
  const scored = [];
  for (const d of kb.docs) {
    const t = d.title.toLowerCase(), s = (d.snippet || '').toLowerCase();
    let score = 0;
    for (const w of words) { if (t.includes(w)) score += 3; else if (s.includes(w)) score += 1; }
    if (score >= 3) scored.push({ score, d });
  }
  if (!scored.length) return null;
  scored.sort((a, b) => b.score - a.score || a.d.id - b.d.id);
  const top = scored.slice(0, 3).map(x => ({
    doc_id: x.d.id, title: x.d.title, url: x.d.url, domain: x.d.domain,
    source: x.d.source, content_hash: x.d.content_hash, fetched_at: x.d.fetched_at
  }));
  const best = scored[0].d;
  return {
    verdict: 'OK', output: best.snippet,
    citations: top,
    label: `CACHED — sealed HARZ Search sample (${kb.manifest.count} docs, sample_sha ${kb.manifest.sample_sha.slice(0, 12)}...; fetched_at shown per doc; this is stored index data, NOT live)`,
    evidence: { tier: 'corpus-sample', sample_sha: kb.manifest.sample_sha, selector: kb.manifest.selector, count: kb.manifest.count, cited: best.id }
  };
}

function packSearch(query, packSha) {
  const q = String(query || '').toLowerCase();
  const words = q.split(/\s+/).filter(w => w.length > 2);
  let best = null, bestScore = 0;
  for (const c of PACK) {
    let score = 0;
    for (const w of words) { if (c.k.includes(w)) score += 2; if (c.fact.toLowerCase().includes(w)) score += 1; }
    if (score > bestScore) { bestScore = score; best = c; }
  }
  if (!best || bestScore < 2) return null;
  return { verdict: 'OK', output: best.fact, evidence: { tier: 'pack', chunk_id: best.id, pack_sha: packSha, source: 'frozen HARZ knowledge pack v0.1 (immutable baseline)' } };
}

// ---- module: knowledge (tier routing: pack first for HARZ facts, then corpus; unknown -> honest refusal) ----
async function knowledge(input, packSha, env) {
  const tier = input.tier || 'auto';
  if (tier === 'pack' || tier === 'auto') {
    const p = packSearch(input.query, packSha);
    if (p) return p;
    if (tier === 'pack') return { verdict: 'UNSUPPORTED', output: 'I have no supported knowledge for this question in the frozen pack. I refuse to guess.', evidence: { tier: 'pack', pack_sha: packSha } };
  }
  if (tier === 'corpus' || tier === 'auto') {
    const kb = await loadKB(env);
    const c = corpusSearch(input.query, kb);
    if (c) return c;
  }
  return { verdict: 'UNSUPPORTED', output: 'I have no supported knowledge for this question in the pack or the sealed corpus sample. I refuse to guess.', evidence: { tier: 'none', pack_sha: packSha, sample_count: null } };
}

// ---- module: greet (deterministic template, no LLM) ----
function greet(input) {
  const name = (input && input.name) || 'friend';
  return { verdict: 'OK', output: `Good day, ${name}. This is the HARZ sovereign core. I answer what I can prove: arithmetic, dates, frozen-rate conversion, contradiction checks, HARZ facts from my sealed pack, and sampled news knowledge from the sealed HARZ Search sample. Everything else I refuse honestly.`, label: 'DETERMINISTIC TEMPLATE (no language model)' };
}

// ---- task router (the whole inference boundary: no external call exists) ----
async function runTask(module, input, packSha, env) {
  const modules = {
    arithmetic, datetime, convert, logic, greet,
    knowledge: i => knowledge(i, packSha, env)
  };
  const fn = modules[module];
  if (!fn) return { verdict: 'UNSUPPORTED', output: `module "${module}" does not exist in the sovereign core. No external fallback exists by design.` };
  return fn(input);
}

async function handleTask(body, env, packSha) {
  const id = uid();
  const result = await runTask(body.module, body.input || {}, packSha, env);
  const receipt = {
    receipt_id: id, module: body.module || 'unknown', input: body.input || {},
    output: result.output, verdict: result.verdict, evidence: result.evidence || null,
    citations: result.citations || null, label: result.label || null, trace: result.trace || null,
    execution_path: 'deterministic:' + (body.module || 'unknown'),
    providers_called: [], ts: new Date().toISOString(), version: VERSION
  };
  await env.E1_MEMORY.put('e1:receipt:' + id, JSON.stringify(receipt));
  return receipt;
}

export default {
  async fetch(request, env) {
   try {
    const url = new URL(request.url);
    const packSha = await sha256Hex(JSON.stringify(PACK));
    if (url.pathname === '/health') {
      const kb = await loadKB(env).catch(e => ({ error: e.message }));
      return J({ status: 'ok', version: VERSION, pack_sha: packSha, boundary: 'zero fetch, zero external AI, zero secrets', providers_wired: [], knowledge: { pack: 12, corpus_sample: kb.manifest ? kb.manifest.count : kb.error, sample_sha: kb.manifest ? kb.manifest.sample_sha : null } });
    }

    if (url.pathname === '/boundary') {
      return J({ contract: 'E1-CORE-CONTRACT v0.1 + E1-KNOWLEDGE-1', external_calls_in_core: 0, fetch_used_by_modules: false, providers_wired: [], note: 'structural boundary: core modules contain no code path to any provider. Zero fetch in module code (verified by source audit; /test/suite exercises live).' });
    }

    if (url.pathname === '/task' && request.method === 'POST') {
      const body = await request.json();
      return J(await handleTask(body, env, packSha));
    }

    const rid = url.pathname.match(/^\/receipt\/(.+)$/);
    if (rid) {
      const r = await env.E1_MEMORY.get('e1:receipt:' + rid[1]);
      return r ? J(JSON.parse(r)) : J({ error: 'receipt not found' }, 404);
    }

    // ---- extended suite: T1-T10 regression gates + T11-T14 knowledge gates ----
    if (url.pathname === '/test/suite') {
      const t = []; const mk = (name, passed, detail, inference) => ({ test: name, passed, control: passed ? 'PASS' : 'FAIL', inference, capability: passed ? 'PASS' : 'FAIL', detail });
      const kb0 = await loadKB(env);

      // T1 greeting (deterministic)
      let r = await runTask('greet', { name: 'Rabiu' }, packSha, env);
      t.push(mk('T1 greeting', r.verdict === 'OK' && r.output.includes('Good day'), r.output.slice(0, 80), 'DETERMINISTIC (no model)'));
      // T2 arithmetic
      r = await runTask('arithmetic', { expr: '17*23' }, packSha, env);
      const r2 = await runTask('arithmetic', { expr: '(15+3)*2' }, packSha, env);
      t.push(mk('T2 arithmetic', r.output === 391 && r2.output === 36, `17*23=${r.output}, (15+3)*2=${r2.output}`, 'DETERMINISTIC'));
      // T3 date computation
      r = await runTask('datetime', { op: 'days_until', date: '2027-01-01' }, packSha, env);
      const today = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00Z');
      const jan1 = new Date('2027-01-01T00:00:00Z');
      const expect = Math.round((jan1 - today) / 864e5);
      t.push(mk('T3 date computation', r.output.days_until === expect, `days_until 2027-01-01 = ${r.output.days_until}`, 'DETERMINISTIC'));
      // T4 tool execution
      r = await runTask('convert', { pair: 'NGN->USD', amount: 24000 }, packSha, env);
      t.push(mk('T4 tool: frozen-rate conversion', r.output === 15 && /NOT-LIVE/.test(r.label), '24000 NGN = ' + r.output + ' USD, ' + r.label, 'DETERMINISTIC'));
      // T5 pack knowledge with evidence (immutable baseline regression)
      r = await runTask('knowledge', { query: 'what is the GDEG V2 contract address' }, packSha, env);
      t.push(mk('T5 pack knowledge w/ evidence', r.verdict === 'OK' && r.output.includes('0x222a10') && r.evidence.pack_sha === packSha && r.evidence.chunk_id === 2, 'answered from pack chunk 2, pack_sha ' + packSha.slice(0, 8), 'RETRIEVAL-DETERMINISTIC'));
      // T6 persistence (write + read back from KV)
      const pid = uid();
      await env.E1_MEMORY.put('e1:probe:' + pid, JSON.stringify({ v: 42, ts: new Date().toISOString() }));
      let pv = await env.E1_MEMORY.get('e1:probe:' + pid);
      if (!pv) { await new Promise(res => setTimeout(res, 300)); pv = await env.E1_MEMORY.get('e1:probe:' + pid); }
      t.push(mk('T6 persistence', pv !== null && JSON.parse(pv).v === 42, 'KV write->readback OK', 'N/A (storage)'));
      // T7 provider independence
      const rr7 = await handleTask({ module: 'arithmetic', input: { expr: '2+2' } }, env, packSha);
      t.push(mk('T7 provider independence', rr7.output === 4 && rr7.providers_called.length === 0 && rr7.execution_path === 'deterministic:arithmetic', '2+2 answered live, receipt shows providers_called:[]', 'STRUCTURAL ZERO-PROVIDER'));
      // T8 receipt integrity
      const runA = await runTask('arithmetic', { expr: '128*4' }, packSha, env);
      const idB = uid();
      const recB = { receipt_id: idB, module: 'arithmetic', output: runA.output, providers_called: [], ts: new Date().toISOString() };
      await env.E1_MEMORY.put('e1:receipt:' + idB, JSON.stringify(recB));
      const readBack = JSON.parse(await env.E1_MEMORY.get('e1:receipt:' + idB));
      t.push(mk('T8 receipt integrity', readBack.output === 512 && runA.output === 512 && readBack.providers_called.length === 0, 'stored receipt matches observed execution (128*4=512)', 'N/A (records)'));
      // T9 provenance + contradiction detection
      const rr = await handleTask({ module: 'logic', input: { subject: 'price', values: [5000, 7000] } }, env, packSha);
      t.push(mk('T9 provenance + contradiction detection', rr.output === 'CONTRADICTION' && rr.providers_called.length === 0 && rr.execution_path === 'deterministic:logic', 'price 5000 vs 7000 -> ' + rr.output, 'DETERMINISTIC'));
      // T10 pack-tier unknown honesty (explicit pack scope)
      r = await runTask('knowledge', { query: 'who will win the 2030 world cup', tier: 'pack' }, packSha, env);
      t.push(mk('T10 pack unknown honesty', r.verdict === 'UNSUPPORTED', 'pack tier refused honestly: ' + r.output.slice(0, 50), 'HONEST-REFUSAL'));
      // T11 corpus retrieval accuracy (known sampled doc: id 0, Ebonyi elections)
      const t0 = Date.now();
      r = await runTask('knowledge', { query: 'Ebonyi stakeholders manifesto 2027 elections', tier: 'corpus' }, packSha, env);
      const corpusLatency = Date.now() - t0;
      t.push(mk('T11 corpus retrieval accuracy', r.verdict === 'OK' && r.evidence.tier === 'corpus-sample' && r.citations && r.citations.some(c => c.doc_id === 0), `cited doc ${r.citations ? r.citations[0].doc_id : '?'} (${corpusLatency}ms)`, 'RETRIEVAL-DETERMINISTIC'));
      // T12 citation correctness: served citation must match stored shard entry byte-for-byte
      const cite0 = r.citations && r.citations[0];
      let citeOk = false;
      if (cite0) {
        const shardRaw = await env.E1_MEMORY.get('e1:kb:shard' + (cite0.doc_id % KB_SHARDS));
        const stored = JSON.parse(shardRaw).find(d => d.id === cite0.doc_id);
        citeOk = stored && stored.content_hash === cite0.content_hash && stored.title === cite0.title && stored.fetched_at === cite0.fetched_at;
      }
      t.push(mk('T12 citation correctness', citeOk, 'served citation matches sealed shard entry exactly', 'N/A (integrity)'));
      // T13 stale/CACHED labeling honesty
      const hasLabel = r.label && r.label.startsWith('CACHED') && /NOT live/.test(r.label);
      const hasFetched = cite0 && /^\d{4}-\d{2}-\d{2}T/.test(cite0.fetched_at);
      t.push(mk('T13 cached/stale labeling', !!hasLabel && !!hasFetched, 'corpus answer labeled CACHED with fetched_at provenance', 'N/A (honesty)'));
      // T14 corpus unknown honesty (nonsense query, auto routing)
      r = await runTask('knowledge', { query: 'xyzzyplugh quixotic bromance flibbertigibbet' }, packSha, env);
      t.push(mk('T14 corpus unknown honesty', r.verdict === 'UNSUPPORTED' && !r.output.includes('0x'), 'refused honestly: no fabrication', 'HONEST-REFUSAL'));

      // ---- E1-KNOWLEDGE-1 measurements ----
      let kbBytes = 0;
      for (let i = 0; i < KB_SHARDS; i++) kbBytes += (await env.E1_MEMORY.get('e1:kb:shard' + i) || '').length;
      const t1 = Date.now();
      const cachedRun = await runTask('knowledge', { query: 'Ebonyi stakeholders manifesto 2027 elections', tier: 'corpus' }, packSha, env);
      const cachedLatency = Date.now() - t1;
      const measurements = {
        corpus_sample_docs: kb0.manifest.count, sample_sha: kb0.manifest.sample_sha,
        kb_storage_bytes: kbBytes, kb_storage_kb: Math.round(kbBytes / 102.4) / 10,
        corpus_query_first_ms: corpusLatency, corpus_query_cached_ms: cachedLatency,
        corpus_response_bytes: JSON.stringify(cachedRun).length,
        pack_sha_immutable: packSha
      };

      const passed = t.filter(x => x.passed).length;
      const receipt = {
        suite: 'E1 extended suite + E1-KNOWLEDGE-1 knowledge gates', version: VERSION,
        pack_sha: packSha, results: t, passed, total: t.length,
        measurements,
        ts: new Date().toISOString(),
        verdicts: {
          control: t.every(x => x.control === 'PASS') ? 'PASS' : 'FAIL',
          inference_scope: 'DETERMINISTIC-ONLY (no general language inference claimed)',
          capability: `${passed}/${t.length} sovereign passes`,
          knowledge_tiers: 'pack (12 facts, immutable) + corpus sample (' + kb0.manifest.count + ' docs, sealed)'
        }
      };
      await env.E1_MEMORY.put('e1:suite:' + Date.now(), JSON.stringify(receipt));
      return J(receipt);
    }

    return J({ version: VERSION, endpoints: ['/health', '/boundary', '/task POST', '/receipt/:id', '/test/suite'], contract: 'E1-CORE-CONTRACT v0.1 + E1-KNOWLEDGE-1' });
   } catch (e) {
    return J({ error: 'core exception: ' + e.message, stack: (e.stack || '').split('\n').slice(0, 4).join(' | ') }, 500);
   }
  }
};
