# D1 PHONE/OFFLINE ROW — SANDBOX VALIDATION (Oct 11, NOT a phone measurement)

Context: the frozen benchmark requires a device-side artifact kit for
every candidate's phone/offline capability. The KV kit (fs-shim shards)
is phone-PROVEN. The D1 kit needed one question answered before any
phone time is spent: does Node 24's built-in node:sqlite support FTS5?
Answer: YES (Node v24.1.0, x64 sandbox; node:sqlite is experimental
in Node 24 — warning emitted, recorded here honestly).

## Measured (sandbox x64, Node v24.1.0, same sealed 20K sample 29649c8a)
- File-backed SQLite+FTS5 kit: one 24.05 MB .sqlite file replaces the
  19.0 MB of JSON shards. Built in ~1 s (one-time).
- Fresh process, file DB, read-only, frozen 20-case battery:
  top-1 19/20, top-3 19/20 — identical accuracy to the live D1 worker
  and the KV strategy (same known "Monthly Reports" tie).
- First query 1 ms; warm average 1 ms (vs KV fs-shim Node proxy
  battery ~58 ms/query full re-scoring).
- JS heap after battery: 4.49 MB (the corpus never enters JS memory;
  the KV strategy's 65.3 MB heap problem disappears entirely).
  RSS 88.5 MB is dominated by the Node runtime itself, and a 200-query
  soak held peak RSS flat at 83.1 MB.
- In-memory variant rejected for the kit design: 234 MB RSS (would
  nearly breach the phone's 250 MB gate). File-backed is the design.

## Significance for the frozen comparison
The D1 strategy's offline kit would use the SAME engine (SQLite+FTS5)
on device and on the server — one retrieval semantics everywhere, no
re-scoring loop, no compilation, no termux-api dependency. KV fs-shim
remains the proven fallback and the accepted 5K core stays untouched.

## What this is NOT
- NOT a phone (ARM/Termux) measurement. The phone confirmation is one
  command (node kit-phone.mjs) if the owner selects D1 — staged, not
  requested. Per the frozen thresholds, the D1 phone row reads:
  "sandbox-verified green, phone confirmation pending."
- Node 24.1.0 sandbox vs the phone's 24.18.0: same major, FTS5 support
  is a compile-time property of Node's bundled SQLite, not a phone
  variable; recorded as evidence, not proof.
