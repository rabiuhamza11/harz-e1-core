# E1-KNOWLEDGE-2 — R2 WAIVER RULING (2026-10-11)

Owner ruling, received 09:40 WAT, Oct 11, 2026, on record 0e72568
(R2-ENABLEMENT-ATTEMPTS.md):

1. R2 is WAIVED for this comparison ONLY — not a permanent rejection.
2. Proceed with KV and D1 using existing measured results. No invented
   benchmarks, no assumptions presented as facts.
3. Evidence preserved: API attempts, endpoint discovery (r2/billing/enable),
   access refusal (10042 on both accounts, five payload variants), and all
   existing measurements remain in this repo.
4. Comparison uses the same workload, test conditions, and acceptance
   criteria wherever applicable — the frozen thresholds
   (BENCHMARK-THRESHOLDS-FROZEN.md) govern unchanged.
5. Selection on measured results: performance, durability, consistency,
   operating costs, portability.
6. Future option: R2 may be tested later if its additional evidence could
   materially change the decision.
7. CONDITION (binding): do NOT declare a universal winner from incomplete
   evidence. State which workload each option wins and identify unmeasured
   properties.

Governing principle (owner): "Cloudflare may host HARZ. Cloudflare must
never define HARZ."

Per the frozen protocol's day-of-variance clause, BOTH live benches
(harz-e1-bench-kv, harz-e1-bench-d1) were re-run same-day under this
ruling, results in COMPARISON-FINAL-EVIDENCE-V1.md.
