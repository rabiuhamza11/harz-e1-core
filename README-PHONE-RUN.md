# E1-KNOWLEDGE-2 PHONE GATE — OWNER RUN INSTRUCTIONS (Oct 11, 2026)

Ruling: Phase 1 ACCEPTED, Phase 2 PROVISIONALLY ACCEPTED, 20K BLOCKED until
this phone receipt is accepted. Thresholds are FROZEN — do not change them
after observing results.

## Setup (Termux on the phone, once)
1. Install Termux, then run:
   pkg update && pkg install -y nodejs-lts git
2. Optional (battery telemetry): install the Termux:API app, then:
   pkg install -y termux-api
3. Get the repo on the phone:
   git clone https://github.com/rabiuhamza11/harz-e1-core.git
   cd harz-e1-core

## The run (one command)
   node tools/phone-run.mjs

The kit executes the approved 8-step protocol in order, prints each step,
and writes receipts/PHONE-RUN-<timestamp>.json:

1. Hashes all artifacts BEFORE testing (preserved in the receipt).
2. Verifies manifest + shard seal (5000 docs, 0a5c75d4...).
3. Confirms it is the 5,000-doc corpus, NOT the 1,015 baseline
   (fails closed if the wrong corpus is present).
4. Measures install size (<=15MB), cold full-load (<=3s) separately
   from warm query latency.
5. Runs the frozen 20-case retrieval battery + the frozen refusal
   case (thresholds: top-1 19/20, top-3 19/20, citations 100% of
   retrievals, honest refusal).
6. PAUSES and asks you to enable airplane mode / disable WiFi, then
   probes TCP + DNS to PROVE interfaces are truly dead before the
   offline queries (the strongest offline claim Rabiu required).
7. Confirms receipts carry the correct corpus seal and
   providers_called remains empty.
8. Records peak RSS (<=250MB), battery telemetry (if termux-api
   installed), duration, and every failure honestly.

VERDICT line at the end: PASS / PASS with offline caveat / FAIL.

## Send back
Send the whole receipts/PHONE-RUN-*.json file (not a photo of the
terminal) plus a one-line note on battery behavior if termux-api was
not installed.
