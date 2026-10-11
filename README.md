# E1-CORE-CONTRACT v0.1 (Oct 11, 2026)

Sovereign Brain E1 Stage 2 — isolated provider-free edge core.

1. ISOLATION: worker harz-e1-core (hamzarabiu390 account). Touches no existing service.
2. BOUNDARY: zero fetch, zero external AI, zero secrets in core modules. Hosted models exist only as labeled interface stub, never called.
3. MODULES: arithmetic (shunting-yard), datetime (WAT), convert (FROZEN rate 1600:1, labeled NOT-LIVE), logic (contradiction detection), knowledge (sha-sealed frozen HARZ fact pack, chunk citations), greet, KV memory.
4. RECEIPTS: every task stores input/output/module/evidence/providers_called/ts; readable at /receipt/:id.
5. BENCHMARK: extended nine-test suite + honesty test (T10), live at /test/suite, per-test control/inference/capability labels.
6. HONESTY: deterministic answers labeled deterministic; unknowns refused (UNSUPPORTED), never fabricated.
7. PORTABILITY: single file, plain JS, no SDK; proven on Cloudflare Worker AND plain Node with byte-identical knowledge-pack sha (5333dc8a53a9ca55...).
8. NO production replacement; no hardware purchase; Render service and Oct 9 laptop GO untouched.
