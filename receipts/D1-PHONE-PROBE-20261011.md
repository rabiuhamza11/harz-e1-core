# D1 PHONE CAPABILITY PROBE — RESULT (2026-10-11, ~19:29 WAT)

Owner ran on-device (Termux, Android arm, Node 24, repo at commit
2940dd5): node tools/bench/termux-fts5-probe.mjs
Evidence: owner terminal photo, delivered in the ruling conversation.

## Measured

1. FTS5 AVAILABLE on-device via Node 24 built-in sqlite — virtual
   table created with no error.
2. 5,000 docs indexed in 884 ms.
3. Query avg 2 ms.
4. Probe completed cleanly, no crash.

## NOT claimed (per the probe's own label)

The "1/20" top-1 score is a KNOWN PROBE ARTIFACT: the probe assumes
rowid == doc_id - 1 (probe-only mapping, does not hold), so the
number carries no retrieval-quality meaning. It is NOT a battery
result. The real kit (d1-offline-kit.mjs, explicit doc_ids) scored
19/20 top-1 and 19/20 top-3 in sandbox and must be run on-device for
the actual D1 phone gate.

## Gate status

D1 PHONE GATE: remains OPEN — this probe proves capability
(FTS5 works on-device at 5K scale, fast), not gate satisfaction
(no battery receipt, no airplane-mode proof, no install-size
measurement of the 24MB kit against the frozen 15MB limit).
20K EXPANSION REMAINS BLOCKED.
