# E1-KNOWLEDGE-2 COMPARATIVE BENCHMARK — THRESHOLDS FROZEN (2026-10-11)

Owner ruling (Oct 11, record 3e68e8a): phone evidence ACCEPTED; D1+FTS5
provisionally selected; R2 comparison REQUIRED before 20K expansion;
thresholds must be frozen BEFORE running the comparison. This file is
that freeze. No threshold below may change after any candidate's
numbers are observed. Identical corpus (sealed 20K, 29649c8a...),
identical frozen 20-case query set, identical correctness requirements
for every candidate.

## FROZEN THRESHOLDS (per candidate)
1. Retrieval accuracy: top-1 >= 18/20 (90%); top-3 >= 19/20 (95%);
   citation byte-exactness 100% of retrievals; the known 4-way
   "Monthly Reports" title tie counts as honest (valid identically-
   titled doc returned, tie broken deterministically, no fabrication).
2. Unknown-answer honesty: the pre-verified non-lexicon refusal case
   (qwzxvk pjorlmf vbnmtre, zero corpus hits) must produce an honest
   UNSUPPORTED refusal or equivalent refusal to fabricate. A candidate
   that fabricates on unknown queries is DISQUALIFIED regardless of
   other scores.
3. Cold first request (live worker, wall clock from client): <= 3,000 ms.
4. Warm query (live worker, wall clock): average <= 500 ms; in-worker
   CPU <= 100 ms.
5. Memory: strategies that load the corpus into the isolate must stay
   <= 100MB heap at 20K (headroom below the 128MB Workers limit);
   storage-side strategies (D1/R2) report ~0 isolate corpus memory.
6. Storage limits: KV value <= 25MB per shard; D1 database <= 10GB;
   R2 object sizes recorded (no per-object limit concern at this scale).
7. Phone/offline capability: the candidate must ship a device-side
   artifact kit that runs the frozen 20-case battery locally on the
   phone with zero provider calls. KV: fs-shim shards (PROVEN, phone
   gate PASS). D1: node:sqlite + FTS5 on Termux Node 24 (probe staged,
   tools/bench/termux-fts5-probe.mjs). R2: identical shard artifacts
   cached on device (same fs-shim as KV). Offline honesty rule: server-
   side indexes (D1/R2) are NOT claimed as independently accessible
   offline; device-offline operation uses the local artifact, labeled
   CACHED per the HARZ Universal App Contract.
8. Operational cost: rows_read (D1) / reads (KV) / Class-B GET (R2)
   per query, measured, then priced at Cloudflare list rates, reported
   per 1000 and per 1,000,000 queries.
9. No external AI inference anywhere in the retrieval path (receipts
   must show providers_called: []).

## DECISION RULE (frozen)
A candidate QUALIFIES only if gates 1, 2, 7(device kit exists or is
probed green), and 9 all pass. Among qualifiers, ranking order:
(1) cold first request, (2) warm average, (3) memory scaling headroom,
(4) device-offline artifact capability, (5) cost. The OWNER rules on
the winner. No automatic selection; no threshold changed post-hoc.

## STATUS AT FREEZE TIME
KV 10-shard and D1+FTS5 were measured BEFORE this freeze (Oct 11,
record b9ed55b) and both already meet gates 1, 2, 9; their numbers
stand as reported and will be re-run alongside R2 under this same
protocol when R2 is measured, to exclude any day-of variance.
R2: UNMEASURED — blocked on one-time dashboard enablement (API error
10042 on both Cloudflare accounts; token permissions verified present).
Everything for R2 is staged: bench worker, upload helper, bucket
creation, deploy + battery commands — measurable within the hour of
enablement.

## R2 BLOCKER (exact)
Enable R2 on the a2 account (c0bea6cf..., the one hosting the bench
workers): dash.cloudflare.com -> R2 -> "Enable R2" (one click; no cost
unless storage is used). Or on the main account (5ab9477...) if the
bench should live there instead. If enablement is not available or
acceptable, the fallback is the documented waiver request with the
evidence in this file — per the owner's own protocol, waiver only by
owner decision, never silently.
