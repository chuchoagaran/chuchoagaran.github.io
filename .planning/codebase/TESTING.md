# Testing Patterns

**Analysis Date:** 2026-03-20

## Test Framework

**Runner:**

- Python script runner (direct execution) in `scripts/tests/test_formatter.py`.
- Node.js script runner (direct execution) in `scripts/references/test_formatter.js`.
- Config: Not detected (`pytest.ini`, `jest.config.*`, `vitest.config.*` not present).

**Assertion Library:**

- JavaScript: custom `assert(cond, msg)` helper in `scripts/references/test_formatter.js`.
- Python: custom diagnostics and issue collection in `scripts/tests/test_formatter.py`.

**Run Commands:**

```bash
python scripts/tests/test_formatter.py     # Runs formatter report across 1299 sampled exponents
node scripts/references/test_formatter.js  # Currently fails: wrong path to templates/js/scripts.js
python -m http.server 8000                 # Manual browser validation for index/game pages
```

## Test File Organization

**Location:**

- Separate directories, not co-located with runtime source:
  - `scripts/tests/test_formatter.py`
  - `scripts/references/test_formatter.js`

**Naming:**

- `test_*.py` and `test_*.js` naming pattern.

**Structure:**

```
scripts/
├── tests/
│   └── test_formatter.py
└── references/
    └── test_formatter.js
```

## Test Structure

**Suite Organization:**

```typescript
section("Known readable values");
for (const [exp, expected] of knownReadable) {
  const actual = formatter.getFullNameFromExponent(exp);
  assert(actual === expected, `...`);
}
```

**Patterns:**

- Setup pattern: instantiate formatter once, then run grouped checks.
- Teardown pattern: not used.
- Assertion pattern: boolean checks with custom pass/fail counters and process exit code in JS; issue list + report printout in Python.

## Mocking

**Framework:** None

**Patterns:**

```typescript
// No mocks; script loads/evaluates production-like source and checks outputs directly.
vm.runInThisContext(source);
const formatter = new InfiniteNumberFormatter();
```

**What to Mock:**

- Not currently defined in repository.

**What NOT to Mock:**

- Core formatter naming and abbreviation logic is tested as pure computation.

## Fixtures and Factories

**Test Data:**

```typescript
const knownReadable = [
  [6, "Million"],
  [3003, "Millillion"],
  [6003, "Dumillillion"],
];
```

**Location:**

- Inline arrays and exponent ranges inside each test script.

## Coverage

**Requirements:** None enforced

**View Coverage:**

```bash
# Not available: no coverage tooling configured
```

## Test Types

**Unit Tests:**

- Approximate unit-style checks exist for formatter methods (name/abbreviation outputs for selected exponents).

**Integration Tests:**

- None automated for DOM wiring (`setupMiniReader`, form submit flow), save/load behavior, or game loop behavior.

**E2E Tests:**

- Not used.

## Common Patterns

**Async Testing:**

```typescript
// Not used; current checks are synchronous.
```

**Error Testing:**

```typescript
const issues = diagnose_abbreviation(suffix, exponent);
if (issues.length) {
  issues_found.push({ exponent, issues });
}
```

## Current Gaps

- JavaScript Node test path is broken (`scripts/references/test_formatter.js` resolves `scripts/templates/js/scripts.js`, which does not exist).
- Python test is a ported implementation rather than direct execution/import of production JS logic, so drift can occur.
- No automated tests cover input-validation UI messaging in `templates/js/scripts.js`.
- No tests cover game save/import/reset flows in `templates/js/game.js`.
- No CI workflow in `.github/workflows/` and no package-managed test command.

---

*Testing analysis: 2026-03-20*
