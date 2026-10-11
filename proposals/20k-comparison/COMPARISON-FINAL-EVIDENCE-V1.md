# E1-KNOWLEDGE-2 — KV vs D1 FINAL COMPARATIVE EVIDENCE (2026-10-11)

Per the owner's waiver ruling (R2-WAIVER-RULING.md). Identical corpus
(sealed 20K, 29649c8a, 19.0MB), identical frozen 20-case set, identical
frozen thresholds (BENCHMARK-THRESHOLDS-FROZEN.md — unchanged since
freeze, before any candidate's numbers). Both live bench workers re-run
SAME-DAY under this ruling to exclude day-of variance (receipts:
bench-kv-rerun.json, bench-d1-rerun.json). No number below is estimated;
each is either measured (with receipt) or labeled UNMEASURED.

## 1. Same-day re-run results (Oct 11, ~09:45 WAT, live workers)

Metric | KV 10-shard | D1+FTS5 | Gate
---|---|---|---
top-1 | 19/20 | 19/20 | >=18 PASS both
top-3 | 19/20 | 19/20 | >=19 PASS both
Citations byte-exact | 100% | 100% | PASS both
Known 'Monthly Reports' tie | honest, identical miss | honest, identical miss | PASS both
Unknown-answer (qwzxvk..., gate 2) | EMPTY results, honest | EMPTY results, honest | PASS both (same-day)
AI providers in retrieval path | none (by construction) | none | PASS both
Cold-cold first request (fresh isolate + cold store) | 1684 ms (health probe load_ms, same-day; consistent with 1725 ms record b9ed55b) | 18 ms | <=3000 PASS both
Cold isolate, warm KV edge | 141 ms | n/a (D1 always queries backend) |
Warm average in-request | 0 ms (sub-ms, corpus in-isolate) | 13 ms (9-22 ms range) | <=500 PASS both
Isolate heap at 20K | 65.3 MB, LINEAR (hits 128 MB Workers limit ~40K docs) | ~0 corpus in isolate (prior-day in-worker measurement, b9ed55b) | <=100 PASS D1; KV passes at 20K, fails ~40K
Storage footprint | 19.0 MB / 10 shards (1.9 MB/shard, max shard << 25 MB KV value limit) | 27.12 MB single D1 database (<=10 GB limit) | PASS both
rows_read / reads per query | 11 reads per cold isolate (1 manifest + 10 shards), 0 warm; measured | 2.45 avg (49 total for frozen 20, measured via D1 API meta; range 2-5) | measured both

## 2. Operational cost (Cloudflare list rates, official docs, Apr 2026)

KV (Workers Paid): 10M reads/month included, +$0.50/M; 1M writes/month
included, +$5.00/M; 1 GB storage included, +$0.50/GB-mo.
D1 (Workers Paid): 25B rows read/month included, +$0.001/M rows; 50M
rows written/month included, +$1.00/M; 5 GB storage included,
+$0.75/GB-mo. No egress charges on either.

At HARZ's CURRENT scale: both candidates cost $0 — KV 19.0 MB and D1
27.12 MB storage and all query traffic sit far inside the included
allowances. Cost is not a discriminator today; the arithmetic below is
the scale headroom, assumptions stated:

- D1 at 1M queries/day: ~2.45M rows read/day = ~74M/month, inside the
  25B included — marginal $0.
- KV steady-state (warm isolates): ~0 reads/query — marginal $0.
- KV worst-case (every query on a cold isolate): 11 reads/query;
  1M queries/day = 330M reads/month = ~$160/month beyond included.
  Isolates stay warm under continuous traffic, so reality sits between
  $0 and this ceiling.
- Corpus update (full 20K rebuild): KV = 10 shard writes per wave
  (within included); D1 = ~20K rows written (within included).

## 3. Durability and consistency (documented platform properties,
labeled as such — not measured today)

- D1: strongly consistent (single primary write point); Time Travel
  point-in-time restore documented (30-day window). Server-side index
  and device kit share ONE engine (SQLite+FTS5) — same ranking
  semantics on server and phone.
- KV: eventually consistent across edge locations (documented up to 60s
  propagation); no point-in-time restore. Shards are plain JSON —
  universally parseable, and the phone kit is phone-PROVEN.

## 4. Phone / offline capability (gate 7) — the honest asymmetry

- KV kit (fs-shim JSON shards): PROVEN ON THE PHONE (Oct 11 phone gate,
  record 3e68e8a): install 4.57 MB, cold 207 ms, warm 163 ms, peak RSS
  113.57 MB, airplane-mode offline proven, 14/14 artifact hash match.
- D1 kit (node:sqlite file-backed FTS5): exists and is committed
  (tools/bench/d1-offline-kit.mjs); SANDBOX-VALIDATED (x64, Node
  24.1.0): one 24.05 MB .sqlite file, battery 19/20+19/20 identical,
  first query 1 ms, warm 1 ms, JS heap 4.49 MB, 200-query soak RSS flat
  83 MB. Phone run UNMEASURED — one command (node kit-phone.mjs) if D1
  is selected; node:sqlite is experimental-flagged in Node 24
  (recorded). Per the frozen gate text (kit exists or probed green),
  D1 qualifies with the phone confirmation pending.

SCALE FLAG for the owner's own gate: the 15 MB phone-install limit was
frozen for the 5K kit. At 20K BOTH kits exceed it (KV JSON 19.0 MB;
D1 .sqlite 24.05 MB). This is not a tiebreaker between candidates —
it is a gate the owner must re-rule for 20K (accept larger install,
chunk the kit, or measure what compression recovers). No decision
made here.

## 5. Per-workload winners (owner's condition honored — no universal
winner declared)

- Server-side retrieval at 20K (cold start + memory scaling):
  D1 wins — 18 ms vs 1684 ms cold-cold; ~0 vs 65.3 MB linear heap
  (KV hits the 128 MB isolate wall near ~40K docs).
- Warm steady-state latency: KV wins — sub-ms vs 13 ms (both far
  under the 500 ms gate; not decision-critical at this scale).
- Phone/offline TODAY (evidence weight): KV wins — device-PROVEN vs
  sandbox-validated. If D1 is selected, one command confirms the
  device row before the 20K kit ships.
- Consistency + durability + restore: D1 wins (strong consistency,
  Time Travel restore, one engine everywhere) — documented platform
  properties, labeled as such.
- Operating cost: TIE at current scale ($0 both, inside included
  allowances). Headroom at scale favors D1 (arithmetic in §2,
  assumptions stated).
- Accuracy: TIE — identical 19/20 top-1 and top-3, identical single
  honest tie miss, 100% byte-exact citations, same-day-verified
  refusal honesty, zero AI providers.

## 6. Unmeasured properties (explicit, per the ruling)

1. D1 phone run (device latency/RSS/battery) — one command, staged.
2. R2 entirely — WAIVED by owner ruling, may be tested later.
3. 20K-scale phone kit on EITHER candidate (phone gate was 5K; install
   sizes at 20K exceed the frozen 15 MB gate on both).
4. Battery telemetry (termux-api absent on device) — 5K soak showed no
   heating report and stable battery icon only.
5. D1 FTS5 ranking beyond the frozen 20 cases (adversarial/junk
   queries) — the frozen battery is the accuracy record.
6. Production traffic-pattern cold-start frequency (assumption-driven
   cost ceiling in §2 is the honest bounding, not a measurement).

## 7. Desk recommendation (owner rules the winner — no auto-selection)

D1+FTS5 for the 20K server-side expansion: 100x better cold start,
flat memory vs a documented ~40K ceiling, stronger consistency and
restore, and one engine (SQLite+FTS5) shared by server and device kit.
Keep the KV fs-shim kit as the proven offline artifact and rollback
path — the live 5K core is KV today and stays untouched until the
owner's storage ruling. If the owner confirms D1, the single-command
phone confirmation closes the last device gap before any 20K kit
ships. 20K expansion remains BLOCKED until the owner's ruling.

All receipts in this directory; benches re-run same-day per the
frozen protocol's day-of-variance clause.
