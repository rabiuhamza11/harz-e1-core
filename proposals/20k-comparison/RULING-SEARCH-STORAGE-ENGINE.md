# E1-KNOWLEDGE-2 — RULING: SEARCH STORAGE ENGINE (2026-10-11)

Owner ruling issued 09:45 WAT, Oct 11, 2026, on evidence record c09d69d.

## DECISION

| Role | Ruling |
|---|---|
| Server-side engine | D1 + FTS5 — SELECTED |
| Offline fallback | KV — RETAINED, PROTECTED |
| R2 | Waived for this comparison; untested, NOT presumed inferior |
| 20K expansion | BLOCKED pending acceptance gates |
| Frozen 15 MB phone-install limit | STILL ENFORCED |

## BASIS (owner's own findings, from c09d69d)

1. Accuracy: TIE — 19/20 top-1 and top-3 both, 100% byte-exact citations.
2. Cold start: D1 — 18 ms vs KV 1,684 ms.
3. Warm queries: KV — sub-ms vs D1 13 ms average.
4. Memory: D1 — corpus stays outside the Worker isolate (server growth).
5. Cost: TIE at measured scale, within included allowances.
6. Offline proof: KV — device-level evidence today; D1 has sandbox-level only.

## PROTECTIONS

- KV offline artifact must NOT be deleted, replaced, or invalidated. It is
  the proven fallback and rollback path.
- Frozen 20-case corpus, thresholds, citations, and reproducible evidence
  are preserved.

## ACCEPTANCE GATES FOR 20K PROMOTION (all five required)

1. Phone size: explicit install-size ruling, or package reduced to
   <= 15 MB. No silent waiver.
2. D1 device proof: actual phone test with recorded receipt. Sandbox
   success does not establish device success.
3. Offline behavior: D1-backed search usable under intended no-internet
   conditions.
4. Rollback: switching back to KV preserves the accepted offline
   capability.
5. Integrity: frozen corpus, thresholds, citations, and reproducible
   evidence preserved throughout.

## GOVERNING DISTINCTION (owner's words, binding)

Selecting D1 is not the same as authorizing its 20K promotion. The
architecture is chosen; the deployment must still earn acceptance.
"HARZ Search moves forward without pretending an untested phone is a
tested phone."

20K promotion remains BLOCKED until every gate above passes. The live
5K KV core is untouched by this ruling.
