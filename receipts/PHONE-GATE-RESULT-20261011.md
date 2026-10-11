# E1-KNOWLEDGE-2 PHONE GATE — OWNER RUN RESULT (2026-10-11, ~07:41 UTC)

Owner ran tools/phone-run.mjs on his phone (Termux, nodejs-lts 24.18.0,
repo cloned fresh from GitHub). Transcript delivered by the owner in the
ruling conversation. VERDICT: PASS, failures: 0.

Device: owner's Android phone (Infinix-class), arm64, Termux.
Full JSON receipt exists on the phone at
receipts/PHONE-RUN-2026-10-11T07-41-42-140Z.json (to be committed when
supplied; transcript below is the delivered evidence).

## Measured vs predeclared limits (thresholds NOT changed after results)
Metric                  Limit        Measured      Verdict
Install size            <= 15 MB     4.6 MB        PASS
Cold full load          <= 3000 ms   207 ms        PASS
Peak resident memory    <= 250 MB    113.57 MB     PASS
Battery/telemetry       recorded     kit ran to completion, no crash  PASS (JSON note pending)
Frozen battery top-1    >= 19/20     19/20         PASS
Frozen battery top-3    >= 19/20     19/20         PASS
Citations byte-exact    100% of      19/19         PASS
                        retrievals
Refusal honesty         UNSUPPORTED  honest        PASS
Physical disconnection  interfaces   TCP REFUSED + DNS FAIL (airplane mode)
                        dead                       PASS — strongest offline claim established
Corpus identity         5,000 docs   5,000, seal 0a5c75d4  PASS
Receipts                seal +       seal match,   PASS
                        providers    providers_called: []
Seal                    0a5c75d4     verified on-phone, matches server  PASS

## Owner transcript (as delivered)
STEP 0 ok: 14 artifacts hashed
STEP 1 ok: seal MATCH, 5000 docs
STEP 2 ok: 5,000-doc corpus confirmed, seal 0a5c75d4
STEP 3 ok: install 4.6MB <= 15MB
STEP 4 ok: cold load 207ms <= 3000ms
STEP 4 ok: frozen battery: top1 19/20, top3 19/20, citations 19/19, refusal honest
STEP 6 (airplane mode): tcp: REFUSED, dns: DNS-FAIL, offline query providers_called: []
STEP 7 ok: receipts clean, seal 0a5c75d4
STEP 8 ok: peak RSS 113.57MB <= 250MB
VERDICT: PASS | failures: 0

## Gate status
The phone gate (5th predeclared decision gate) is PASSED on owner-delivered
evidence. Server-side gates 4/5 already PASS. All five gates now measured.
20K EXPANSION ITSELF REMAINS BLOCKED until the owner accepts this evidence
AND the required storage-strategy comparison (KV sharding vs R2 vs
D1-backed index, on equivalent data/cases/costs) is delivered and reviewed.
