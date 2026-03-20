# Codebase Concerns

**Analysis Date:** 2026-03-20

## Tech Debt

**Game runtime concentrated in one large script:**

- Issue: `templates/js/game.js` contains numeric model (`BigNum`), progression formulas, DOM wiring, save/load, graph rendering, and the full game loop in one 557-line file.
- Files: `templates/js/game.js`
- Impact: High change risk; small edits can create regressions in unrelated behavior because logic and UI concerns are tightly coupled.
- Fix approach: Split by responsibility into separate modules (`bignum`, `progression`, `persistence`, `ui`, `loop`) and keep a small bootstrap file for wiring.

**Reference and test assets mixed in production tree:**

- Issue: `scripts/references/` contains reference implementations and a runnable Node test script that is currently broken, while active tests also exist in `scripts/tests/`.
- Files: `scripts/references/test_formatter.js`, `scripts/tests/test_formatter.py`, `scripts/references/ANTIMATER_DIMENSITON_NOTATION.JS`, `scripts/references/ETERNITYNUM.LUA`
- Impact: Maintainers can run the wrong validation path and get false confidence or immediate failures.
- Fix approach: Move executable tests to one canonical test directory and mark reference files as non-executable archive material.

## Known Bugs

**Node verification script fails due to wrong source path:**

- Symptoms: Running `node scripts/references/test_formatter.js` throws `ENOENT` for `scripts/templates/js/scripts.js`.
- Files: `scripts/references/test_formatter.js`
- Trigger: Execute the script from repo root.
- Workaround: Use `python scripts/tests/test_formatter.py` for current verification until the Node path is corrected.

**Conflicting tier-2 naming logic between JS and Python test implementation:**

- Symptoms: Python spot-check output shows names like `Mi-million` for `1e3003`, while browser JS formatter returns compact forms like `Millillion`.
- Files: `templates/js/scripts.js`, `scripts/tests/test_formatter.py`
- Trigger: Compare formatter behavior around tier-2 boundaries (`>= 1e3003`).
- Workaround: Treat browser-side `templates/js/scripts.js` as source of truth; align Python port logic before using it as acceptance oracle.

## Security Considerations

**Save import accepts unvalidated object shape and numeric ranges:**

- Risk: Imported JSON is trusted and mapped directly into game state (`new BigNum(loadData.*.m, loadData.*.e)`), allowing malformed values (`NaN`, extreme exponents, wrong types) that can destabilize rendering and progression math.
- Files: `templates/js/game.js`
- Current mitigation: Wrapped in `try/catch`, basic clamping only for `hype` and `burstTimer`.
- Recommendations: Add strict schema validation for every imported field, numeric finite checks, and fallback-to-default on invalid entries.

**User-provided save payload is decoded in memory without size limits:**

- Risk: Very large base64 input from `prompt()` can cause large allocations and UI hangs in browser.
- Files: `templates/js/game.js`
- Current mitigation: Exception handling around `atob`/JSON parse.
- Recommendations: Enforce maximum payload length before decoding and reject oversized input with a clear message.

## Performance Bottlenecks

**Per-frame object churn in hot loop:**

- Problem: `gameLoop` creates many temporary `BigNum` objects each frame (`mul`, `add`, `sub`, wrappers around constants).
- Files: `templates/js/game.js`
- Cause: Immutable-style operations on every frame (~60 FPS) allocate repeatedly and trigger GC overhead as playtime increases.
- Improvement path: Cache frequently used constants, reduce intermediate allocations, and batch arithmetic where possible.

**Exact stronger-autoclick bulk estimate is linear simulation:**

- Problem: `estimateMaxStrongerAutoExact` loops one purchase at a time until cap or affordability limit.
- Files: `templates/js/game.js`
- Cause: O(n) iterative probe instead of closed-form estimate.
- Improvement path: Replace with geometric-series based estimate (with correction pass) to reduce repeated subtraction/multiplication in UI refresh paths.

## Fragile Areas

**Global dependency on formatter load order:**

- Files: `templates/js/scripts.js`, `templates/js/game.js`, `game.html`
- Why fragile: `game.js` assumes global `formatter` exists from `scripts.js`; any script reorder or partial-page reuse breaks runtime.
- Safe modification: Keep load order invariant or expose formatter via explicit module boundary/API.
- Test coverage: No automated browser test verifies page boot if script order changes.

**DOM assumptions without null guards in game bootstrap:**

- Files: `templates/js/game.js`, `game.html`
- Why fragile: Many `document.getElementById(...).addEventListener(...)` calls run unguarded; if an element ID changes, startup throws and game stops.
- Safe modification: Guard required nodes at startup and fail fast with explicit diagnostics.
- Test coverage: No UI smoke test catches missing element bindings.

## Scaling Limits

**Numeric correctness limited by JavaScript Number precision:**

- Current capacity: Logic uses Number-backed mantissa/exponent and frequently computes `Math.log10`, `Math.pow`, and integer math on parsed exponents.
- Limit: Very large exponent inputs exceed safe integer precision, causing naming/abbreviation inaccuracies and unstable arithmetic.
- Scaling path: Introduce safe-integer bounds at parse time or migrate exponent handling to bigint/string-based routines.

## Dependencies at Risk

**No third-party runtime dependencies (vanilla stack):**

- Risk: Not applicable for package abandonment, but custom math/notation logic is fully in-house and therefore maintenance burden is internal.
- Impact: Correctness and feature growth depend on local validation quality.
- Migration plan: Not applicable; prioritize stronger automated tests instead.

## Missing Critical Features

**No continuous validation in CI:**

- Problem: Repository has runnable tests but no CI workflow to enforce them on change.
- Blocks: Regressions can merge unnoticed, especially in number formatting rules and save/load behavior.

**No user-facing validation for documented max input bound:**

- Problem: README states a practical maximum (`1e2999999`) but parser does not enforce this bound.
- Blocks: Users can submit extreme inputs that produce unreliable output due to Number precision limits.

## Test Coverage Gaps

**Game loop, save/import, and DOM behavior are untested:**

- What's not tested: Runtime progression loop, shop purchases, serialization/deserialization, and recovery from malformed imports.
- Files: `templates/js/game.js`, `game.html`
- Risk: High-likelihood regressions in core gameplay and persistence with no automated detection.
- Priority: High

**Cross-language formatter parity is not enforced:**

- What's not tested: Exact equivalence between browser formatter (`templates/js/scripts.js`) and Python port (`scripts/tests/test_formatter.py`) for tier-2 naming.
- Files: `templates/js/scripts.js`, `scripts/tests/test_formatter.py`
- Risk: Tests can pass while browser output differs, reducing confidence in correctness.
- Priority: Medium

---

*Concerns audit: 2026-03-20*
