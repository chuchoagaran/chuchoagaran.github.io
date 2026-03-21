---
phase: 2
---
# Phase 2 Validation Strategy

## Dimension 8 Coverage (Nyquist)
- Must verify that the Node harness executes production formatter logic from `templates/js/scripts.js` without broken path assumptions.
- Must verify that canonical fixtures cover both readable names and abbreviations for Tier 1 values, Tier 2 boundaries, and documented edge cases.
- Must verify that the Python helper consumes the same canonical fixture source or directly compares against the Node harness so cross-language drift is observable.
- Must provide automated commands that exit non-zero on mismatch for `TEST-01`, `TEST-02`, and `TEST-03`.
- Must ensure Phase 3 can rely on test failures as authoritative indicators of formatter drift.