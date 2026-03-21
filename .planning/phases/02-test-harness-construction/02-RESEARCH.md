## Testing Harness Research

### Current State

The repository already contains two partial test artifacts:

1. `scripts/references/test_formatter.js`
   - Loads `templates/js/scripts.js` through `vm.runInThisContext`
   - Verifies known readable and abbreviation outputs
   - Includes uniqueness checks around Tier 2 boundaries
   - Currently resolves the runtime file through the wrong path (`scripts/templates/js/scripts.js` instead of `templates/js/scripts.js` from repo root)

2. `scripts/tests/test_formatter.py`
   - Re-implements formatter logic in Python
   - Samples many exponents and prints a report
   - Does not mirror the current JS logic exactly
   - Uses different naming/abbreviation formulas from the current runtime, so it can drift from production behavior

### Canonical Test Oracle

Phase 1 established `documents/canonical_naming_rules.md` as the deterministic oracle for this range. Phase 2 should consume that oracle instead of inventing a second naming standard.

That means the harness must lock these behaviors:

- `suffixIndex = floor(exponent / 3) - 1`
- Supported range stops at `1e2999999`
- `10^3003 -> Millillion / Mi`
- `10^6003 -> Dumillillion / DMi`
- No alternate abbreviations are canonical for documented edge cases

### Practical Implementation Direction

The lowest-risk approach is a shared fixture-driven test harness:

1. Create a shared test vector file under `scripts/tests/` that stores canonical full-name and abbreviation expectations for boundary cases, Tier 1 values, Tier 2 boundary transitions, and normalization cases.
2. Make the Node test the primary execution of production logic by loading `templates/js/scripts.js` and asserting against the shared fixtures.
3. Make the Python script consume the same shared fixtures and either:
   - validate a Python parity implementation against the same outputs, or
   - shell out to the Node harness for direct JS comparison and report mismatches cleanly.

### Required Coverage for Phase 2

To satisfy `TEST-01`, `TEST-02`, and `TEST-03`, the plan must cover:

- Canonical full-name snapshots for representative boundaries and normalization cases
- Canonical abbreviation snapshots for the same cases
- Explicit checks around Tier 1 to Tier 2 transitions (`2994..3015`, `5994..6015`, and similar)
- Cross-language parity from one shared fixture source to prevent Python and JS drift
- One repeatable command path for running all test artifacts from repo root without manual file edits

### Risks and Constraints

- No package manager or formal test runner exists, so phase output should stay script-based
- Browser code is not modularized, so Node tests must continue using source evaluation or an equivalent lightweight load strategy
- Reference files in `scripts/references/` should remain reference-oriented; if production-style test assets are added, prefer `scripts/tests/`
- Avoid building a second naming system into tests; fixtures must point back to the canonical doc and current runtime behavior

## RESEARCH COMPLETE
