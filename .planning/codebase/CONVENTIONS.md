# Coding Conventions

**Analysis Date:** 2026-03-20

## Naming Patterns

**Files:**

- Entry pages use lowercase HTML names: `index.html`, `game.html`.
- Browser source files use lowercase JS names in `templates/js/`: `scripts.js`, `game.js`.
- Test/reference scripts use snake_case and `test_` prefixes in `scripts/tests/` and `scripts/references/`: `test_formatter.py`, `test_formatter.js`.

**Functions:**

- Methods and functions use camelCase: `getFullNameFromExponent`, `buildReadableText`, `estimateMaxPurchases`, `setupMiniReader`.
- Constructors/classes use PascalCase: `InfiniteNumberFormatter`, `BigNum`.

**Variables:**

- Local mutable values typically use `let`; constants use `const`.
- Global constants often use UPPER_SNAKE_CASE: `UPGRADE_CONFIG`, `AUTO_COST`, `SAVE_KEY`.

**Types:**

- Not applicable (no TypeScript detected).

## Code Style

**Formatting:**

- Tool used: Not detected (no Prettier/Biome config found).
- Key settings: Style is hand-formatted with 4-space indentation and semicolons in JS files (`templates/js/scripts.js`, `templates/js/game.js`).

**Linting:**

- Tool used: Not detected (no ESLint config found).
- Key rules: Conventions are enforced informally through existing code and project instructions in `.github/copilot-instructions.md`.

## Import Organization

**Order:**

1. Browser runtime code has no `import`/`export`; scripts are loaded via `<script>` order in `index.html` and `game.html`.
2. Node reference test uses CommonJS `require` in `scripts/references/test_formatter.js`.
3. Python test uses standard library imports at file top in `scripts/tests/test_formatter.py`.

**Path Aliases:**

- None detected.

## Error Handling

**Patterns:**

- Input parsing returns structured status objects instead of throwing for user input: `{ ok: false, error: ... }` from `parseNotationInput` and `convertInput` in `templates/js/scripts.js`.
- Guard-clause style is common (`if (!form || !input || !output) return;`, `if (num <= 0) return;`).
- `try/catch` is used for save import/load parsing in `templates/js/game.js` with user-visible fallback alerts.

## Logging

**Framework:** console

**Patterns:**

- `console.error` is used for failed save-load parsing in `templates/js/game.js`.
- `console.log` is used in test/reporting contexts (`scripts/references/test_formatter.js`, `scripts/tests/test_formatter.py` output equivalent).

## Comments

**When to Comment:**

- Comments are used for sectioning and non-obvious math/game logic (`// Save & Load System`, geometric-series cost comments, tier naming notes).
- Most simple operations are left uncommented.

**JSDoc/TSDoc:**

- Not used in production JS.
- Docstring-style module header exists in `scripts/tests/test_formatter.py`.

## Function Design

**Size:**

- Mixed; utility methods are compact in `InfiniteNumberFormatter`, while UI/game orchestration functions are long (`updateUI`, `gameLoop` in `templates/js/game.js`).

**Parameters:**

- Numeric-heavy helpers pass explicit primitive arguments (`mantissa`, `exponent`, `ratio`) and small value objects (`BigNum`).

**Return Values:**

- Formatter/parsing functions return strings or structured status objects.
- Game mutation handlers mostly return nothing and update shared `state`.

## Module Design

**Exports:**

- No module exports in frontend runtime files; globals are created by script inclusion order.

**Barrel Files:**

- Not used.

---

*Convention analysis: 2026-03-20*
