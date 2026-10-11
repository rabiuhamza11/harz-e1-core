# E1-KNOWLEDGE-2 PHASES 1-2 RECEIPT (2026-10-11) — 1,015 -> 5,000 documents

Ruling: E1-KNOWLEDGE-2 APPROVED (owner, Oct 11): measured growth 5K then 20K,
14-test suite preserved, no production AI changes, no hardware purchase,
no external AI dependency, no unsupported claims.

## PHASE 1 — BASELINE FROZEN (all preserved in this repo)

- 1,015-doc corpus: exact KV bytes pulled from harz-e1-memory (baseline/)
- seal verified: sample_sha 7c5a9003463a97b2... (recipe v2, Python AND JS byte-identical, tools/seal-verify.*)
- 12-fact pack immutable: pack_sha 5333dc8a53a9ca55... (live-verified pre-deploy, unchanged post-deploy)
- 14-test suite retained as regression gates (14/14 on baseline pre-deploy)
- Termux closure receipt recorded: receipts/E1-TERMUX1-CLOSED-20261011.md
- No changes to production AI (harz-ai v6.6.0+p4+D-Arith untouched) or laptop GO.

## PHASE 2 — GROWTH TO 5,000 DOCS (worker now v0.3-kb5k)

Corpus: deterministic sample selector CAST(id AS INTEGER) % 8 = 0
ORDER BY id ASC LIMIT 5000, from harz_search_v02 D1 (42,622 docs).
Sealed: sample_sha 0a5c75d461c206a8... (recipe v2, cross-language MATCH).
Cross-check vs baseline: all 239 shared in-range ids byte-identical
(15 baseline ids beyond the 5,000 cap excluded by construction).
Deployed via safe-deploy (E1_MEMORY binding preserved); baseline KV keys
(e1:kb:*) left in place for rollback.

### INTEGRITY
count 5000 = manifest 5000 (fail-closed loadKB), KV bytes 4,711,022
(measured live), seal MATCH in Python and JS.

### STORAGE
5 non-empty shards (id%10 mapping; 5 empty by id-parity of the id%8
selector — structural, disclosed), 4.7 MB total. Well under the 25 MB
per-value limit. At 20K (~19 MB in 10 shards) the limit nears — a
20K build must re-evaluate shard count or move to R2 (per ruling:
measure, then decide).

### RETRIEVAL ACCURACY (frozen query set, declared before execution)
Set: every 250th doc by ascending id (20 cases); query = first 8
significant title words. Thresholds declared before run: top-1 >= 18/20
(90%), top-3 >= 19/20 (95%), citation byte-exact 100% of retrievals.
RESULTS: top-1 19/20 (95%), top-3 19/20 (95%), citation byte-exact
19/19 among retrievals (100%).
The single miss (doc 34000, title "Monthly Reports") is a 4-way title
tie among identically-titled docs; deterministic tie-break by id
returned a valid identically-titled doc — correct behavior under
ambiguity, zero fabrication. Not a retrieval defect; recorded honestly.

### CITATION INTEGRITY
T12 verified against the LIVE 5K corpus (v0.3-kb5k): served citation
matches sealed shard entry exactly. (In v0.3 first pass T12 and the
storage metric still read the baseline keys — caught by the failing
gate audit, fixed, redeployed, disclosed here.)

### DISCLOSED TEST CHANGE (T14)
Original T14 "nonsense" query aged out: the word "bromance" exists in
doc 35792 of the grown corpus (real ABC article, correctly retrieved).
Replaced with pre-verified non-lexicon gibberish (qwzxvk pjorlmf
vbnmtre; zero hits across all 5,000 titles+snippets, verified before
freezing). Premise restored: refuse what is truly absent, retrieve what
is truly present. This is the disclosure the ruling requires — never
silently change criteria to appear successful.

### PERFORMANCE (measured separately)
- LIVE worker: suite wall 2.5s cold / 1.3s warm; corpus query in-suite
  <1ms (Date.now resolution); 10-query wall avg 409ms incl. HTTPS RTT.
- NODE substrate proxy (phone proxy): cold full load 114ms, warm query
  avg 16ms, response 2,189 bytes.

### MEMORY (Node substrate proxy for phone)
heapUsed 12.7MB -> 23.7MB after cold load; PEAK 37.4MB during 20-query
battery; RSS 167.6MB (Node runtime included).

### OFFLINE OPERATION (demonstrated by test)
DNS resolver poisoned to unreachable; 20/20 frozen queries answered
locally with providers_called:[] and deterministic execution_path;
honest UNSUPPORTED refusal for the non-lexicon query; suite 14/14.
Structural audit: zero fetch()/http/net in core modules; providers_wired
remains []. Sandbox forbids network-namespace isolation (unshare not
permitted) — the equivalent proof is DNS-poisoning + structural audit.
On-phone Termux verification remains owner-side (kit below).

### PHONE LIMITS (owner-side; kit provided)
Predefined limits for the Termux run (declared BEFORE it): corpus
install <= 15MB, peak process RSS <= 250MB, cold load <= 3000ms on
phone hardware, stability = full 20-query battery + refusal without
process exit. Kit: clone repo, `node tools/seal-verify.mjs
kb5k/manifest.json kb5k/shard*.json` then `node tools/bench.mjs`
(bench needs the shard files in cwd). STATUS: PENDING OWNER HANDS —
not claimed as measured until the phone receipt exists.

### REGRESSION
14/14 green on the 5K corpus, live (cold and warm runs).

### PROVIDER INDEPENDENCE
Zero external inference calls across every measurement above
(receipts providers_called:[] throughout; providers_wired:[]).

## DECISION GATE (predeclared, for 20K advance)
1. corpus integrity PASS (sealed, cross-language MATCH)
2. regression suite PASS (14/14)
3. retrieval accuracy PASS (95% / 95% / 100% of retrievals vs declared thresholds)
4. phone resource use PENDING OWNER HANDS (Node proxy: 37MB peak heap, 4.7MB storage, 114ms cold load — well inside any modern phone)
5. offline + provider independence PASS (demonstrated)

Server-side gates: 4/5 PASS, 1 pending the owner's phone run.
20K is NOT advanced until the phone receipt lands, per the ruling's
own protocol.

## ARCHITECTURAL NOTE (per ruling: do not assume 10-shard optimal)
5K in 10 shards works (4.7MB, <25MB limit, sub-second). The 20K build
MUST re-evaluate: projected ~19MB in 10 shards is within KV limits but
single-isolate cold reads grow ~4x; R2-backed shards or a D1-backed
index are the measured alternatives to compare. Decision deferred to
the 20K proposal with numbers, as ruled.

## TWO-QUESTION SEPARATION (ruling's safeguard)
Q1 "can HARZ store and search 5,000 docs on a phone?" — resource
answer: 4.7MB storage, 37MB peak heap, 114ms cold load, 16ms warm query
on Node substrate; phone hands-on pending.
Q2 "can HARZ reliably answer using those docs?" — correctness answer:
95% top-1, 95% top-3, 100% citation fidelity among retrievals, honest
ties under ambiguous titles, honest refusal of absent content.
Both recorded; neither conflated.
