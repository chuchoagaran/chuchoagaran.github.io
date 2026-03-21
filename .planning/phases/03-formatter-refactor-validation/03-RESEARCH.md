## Formatter Refactor Research

### Current Starting Point

Phase 2 left the repository with a working canonical test harness:

1. `scripts/tests/formatter_vectors.json`
   - Encodes canonical name, abbreviation, readable-text, and normalization cases.
   - Defines boundary windows around the first Tier 2 transitions.
   - Defines sparse sample ranges that parity tooling already sweeps.

2. `scripts/references/test_formatter.js`
   - Executes the real browser formatter from `templates/js/scripts.js`.
   - Produces machine-readable JSON for higher-level parity checks.

3. `scripts/tests/test_formatter.py` and `scripts/tests/test_formatter_parity.py`
   - Mirror and compare JS behavior from repo root.
   - Fail immediately on cross-language drift.

### Phase 3 Risks Confirmed In Code

The formatter now has reliable tests, but the production implementation still has several refactor targets:

- `templates/js/scripts.js` computes suffix-index math separately in multiple methods instead of routing through one bounded helper path.
- `parseNotationInput()` accepts scientific exponents through `Number(...)` + `Number.isInteger(...)`, but it does not explicitly enforce the documented supported ceiling `1e2999999`.
- The formatter relies on JavaScript `Number` parsing for user-provided exponents, which means unsupported or unsafe values can enter the pipeline before any project-specific bound is applied.
- README and canonical documentation both state the supported ceiling, so Phase 3 must make runtime behavior match those documents instead of relying on convention.

### Implementation Direction

No new dependency or external integration is needed. This is a Level 0 discovery phase:

1. Refactor `InfiniteNumberFormatter` internals so canonical naming and abbreviation logic share one exponent-to-group pipeline.
2. Preserve the public browser API (`getFullNameFromExponent`, `getAbbreviationFromExponent`, `buildReadableText`, `buildAbbreviationText`, `convertInput`).
3. Extend the existing fixture/harness contract to cover supported-ceiling and invalid-input behavior.
4. Enforce the documented maximum exponent and safe-integer checks in runtime parsing, not only in documentation.

### Constraints For The Plan

- Keep the project framework-free and browser-targeted.
- Do not move production logic into the test harness.
- Keep the existing Phase 2 commands authoritative:
  - `node scripts/references/test_formatter.js --json`
  - `python scripts/tests/test_formatter.py`
  - `python scripts/tests/test_formatter_parity.py`

## RESEARCH COMPLETE