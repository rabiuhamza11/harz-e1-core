# E1-KNOWLEDGE-2 RULING 3 (owner, Oct 11) — RECORDED

1. Phone evidence: FORMALLY ACCEPTED (record 3e68e8a; 14/14 artifact
   hashes independently verified).
2. Battery observation: OPEN — 22s test does not establish sustained
   stability; must be recorded without inventing telemetry.
   Response: tools/phone-soak.mjs staged (repeated load+battery cycles;
   manual battery-note template; the accepted frozen kit untouched).
   Optional: pkg install termux-api + Termux:API app for real %.
3. D1 + SQLite FTS5: PROVISIONAL ARCHITECTURAL SELECTION for 20K —
   an evaluation selection, not a claimed performance victory.
4. R2: comparison REQUIRED, not waived. Blocker documented precisely:
   API error 10042 on BOTH Cloudflare accounts (c0bea6... and 5ab9477...);
   token permissions verified present; enablement is a one-click
   dashboard action by the owner (dash.cloudflare.com -> R2 -> Enable).
   If unavailable/unacceptable: document blocker + formal waiver request
   with available evidence — waiver only by owner decision.
5. 20K expansion: BLOCKED pending the storage decision.
6. Comparative benchmark = the next milestone, not ingestion. All
   candidates measured on the SAME frozen 20K corpus (29649c8a...) and
   SAME frozen 20-case set. Phone/offline honesty rule recorded: a
   server-side index (D1 or R2) is NOT claimed as independently
   accessible offline; device-offline uses the local artifact, labeled
   CACHED per the HARZ Universal App Contract.

## STAGED SINCE THE RULING (measurement-ready, nothing deployed to prod)
- proposals/20k-comparison/BENCHMARK-THRESHOLDS-FROZEN.md — the
  comparison gates and decision rule, frozen BEFORE any R2 numbers
  (ruling condition 2). KV and D1 numbers already on file from record
  b9ed55b will be re-run alongside R2 under the same protocol.
- tools/bench/bench-r2.js — R2 strategy bench worker (same battery,
  same fail-closed count check, same scoring), ready to deploy on
  enablement.
- tools/bench/r2-upload-helper.js — temporary R2 uploader via Worker
  binding (avoids S3-credential creation; deleted after upload).
- tools/bench/termux-fts5-probe.mjs — D1 phone/offline capability
  probe (does Termux Node 24 node:sqlite support FTS5? plus on-device
  index build + query timings).
- tools/phone-soak.mjs — battery soak kit for the OPEN battery
  observation. Sandbox smoke: 1 iteration, 19/20, no crash.
