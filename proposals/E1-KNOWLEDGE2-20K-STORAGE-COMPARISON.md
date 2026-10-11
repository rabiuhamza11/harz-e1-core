# E1-KNOWLEDGE-2 20K PROPOSAL — STORAGE STRATEGY COMPARISON (2026-10-11)

Owner ruling (Oct 11): the 20K proposal MUST compare KV sharding, R2, and a
D1-backed index on equivalent corpus data, query cases, and correctness
requirements, with real storage/request costs; no architecture chosen on
theoretical performance alone. 20K expansion itself remains BLOCKED pending
owner acceptance of the phone evidence AND this comparison.

Phone gate (same day, owner-run): PASS, 0 failures (cold 207ms, RSS
113.57MB, airplane-mode TCP REFUSED + DNS FAIL, seal verified on-device).
Recorded at receipts/PHONE-GATE-RESULT-20261011.md.

## METHOD (equivalence, declared before measurement)
- DATA: one deterministic sealed sample of 20,000 docs, selector
  CAST(id AS INTEGER) % 2 = 0 ORDER BY id ASC LIMIT 20000 from
  harz_search_v02 (42,622 docs). seal 29649c8a198649beb... (recipe v2),
  19,022,429 bytes. MEASUREMENT-ONLY: the live core (5K) was not touched.
- CASES: frozen 20-case set built BEFORE any measurement (every 1000th
  doc by ascending id, first-8-significant-title-words query, same
  construction rule as the accepted 5K gate).
- CORRECTNESS: top-1 >= 90%, top-3 >= 95%, citations byte-exact 100% of
  retrievals. All three strategies scored on the identical set.

## RESULTS (all measured today, live)

Metric                     KV 10-shard          D1 + FTS5 index      R2
Storage (20K docs)         19.0 MB in 10 KV     27.1 MB (docs+FTS)   UNMEASURED —
                           values (5 x 3.8MB)                        blocked
Cold first request         1,725 ms (cold KV,   15 ms (stateless,   (owner
                           fresh isolate);      no corpus load)      action
                           ~127 ms (KV warm)                        required)
Warm query (in-worker)    <1 ms (isolate        10-12 ms avg;        to
                           cache hot; Date.now   1.65 ms SQL          enable;
                           resolution)                               API error
Reads per request          10 KV reads per      1 SQL query;         10042 on
                           cold isolate         rows_read = 3        both
                                                (measured)           accounts)
Isolate memory             65.3 MB heap after   ~0 (no corpus        one-click
                           load; PEAK 65.5 MB    in isolate)          dashboard
                           (Node proxy)                              enablement)
Memory scaling             LINEAR: ~130 MB at    flat (storage-      then this
                           40K -> hits the      side index)          battery
                           128 MB Workers       will be
                           isolate limit        replicated
Accuracy (frozen 20)       19/20 top-1          19/20 top-1
                           19/20 top-3          19/20 top-3
                           citations 100%       citations 100%
                           (0 mismatches)
Miss analysis              identical case: doc 34000 "Monthly Reports"
                           — multi-way title tie, deterministic tie-break,
                           valid identically-titled doc returned, zero
                           fabrication in both strategies (same known
                           ambiguity artifact as the accepted 5K gate)
Phone headroom (proxy)     20K KV = 65MB heap   D1 phone client
                           (250MB gate OK;     fetches only query
                           40K would breach    results, not the
                           the Workers         corpus
                           isolate limit)

## COSTS (Cloudflare list prices — verify at deploy decision)
- KV: $0.30/million reads; $0.50/GB-month storage. 10 reads per cold
  isolate. 19MB stored.
- D1: $0.001/million rows read (measured 3 rows/MATCH query ≈ nil);
  rows written $1/million; 27.1MB storage on the paid tier, 10GB/DB cap.
- R2: $0.015/GB-month storage, Class B reads $0.36/million (unmeasured
  here; figures listed for completeness only).

## FINDING
D1+FTS5 wins on the measured dimensions that matter at 20K and beyond:
no cold-load cliff (15ms vs 1,725ms first request), no isolate memory
ceiling (the KV full-load pattern is linear and hits the 128MB Workers
limit near 40K docs), equal accuracy and citation fidelity on the same
frozen cases, and near-zero measured read cost. KV sharding remains
CORRECT for the accepted 5K core (65ms->114ms loads, 4.7MB, already
phone-proven at 207ms/113MB) — the finding is about the growth path, not
a defect in today's deployed system.

## RECOMMENDATION (for owner ruling; NOT a deployment)
1. Accept the phone gate evidence (owner to rule).
2. Choose the D1+FTS5 path for the 20K corpus IF the owner accepts this
   comparison and the R2 strategy is either (a) measured after the
   one-click dashboard enablement, or (b) explicitly waived by the owner.
   Per the ruling, R2 must not be skipped silently: unmeasured is not
   rejected. If the owner enables R2, a bench worker with an R2 binding
   replicates this battery within the hour.
3. On a 20K go: FIRST preserve the 20K sample (sealed shards committed to
   this repo before any deploy), then build the 20K core as a new worker
   version pointing at a dedicated D1 index (not harz_search_v02 itself),
   keep the 5K live core untouched until the 20K passes the full 14-gate
   suite + the 20K frozen battery on the new storage path.
4. The pack (12 facts, 5333dc8a) stays immutable in every path.

## ARTIFACTS
- proposals/20k-comparison/: frozen-20k.json, bench-kv.js, bench-d1.js,
  bench results (kv-run1, d1-run1), manifest-20k (seal 29649c8a,
  selector declared), node20k memory proxy.
- Bench workers (live, measurement-only): harz-e1-bench-kv,
  harz-e1-bench-d1 (hamzarabiu390 account); bench D1: harz_e1_bench_20k
  (uuid 3e7b2598-7a08-4d40-aa37-b28cb1d2cb87), FTS5 rebuilt from docs.
- The 20K raw sample is deterministically rebuildable from the D1 node
  via the declared selector; NOT committed (19MB) to keep the repo lean —
  on a 20K go it will be sealed and committed BEFORE deployment.
