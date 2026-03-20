# Infinite Number Framework

## What This Is

A JavaScript library and visualization tool for parsing, formatting, and abbreviating extremely large numbers (from $1e0$ up to $1e2999999$). It provides consistent readable names (e.g. "Million", "Millillion") and suffix abbreviations, primarily serving an Infinite number reader and an Infinite number game.

## Core Value

Absolute logical correctness and consistency of the number naming algorithm from $1e0$ to at least $1e2999999$, ensuring that the generated full names and abbreviations map correctly to standard large number conventions (verified against Googology wiki standards where possible).

## Requirements

### Validated

- ✓ Basic number reader UI exists mapping inputs to readable names
- ✓ Clicker game prototype exists leveraging the large number logic
- ✓ `InfiniteNumberFormatter` class exists in `templates/js/scripts.js`

### Active

- [ ] Define the canonical correctness standard (Googology wiki alignment where applicable, fallback to current `scripts.js` behavior).
- [ ] Ensure perfect consistency between generated readable names and short abbreviations across the entire exponent range.
- [ ] Create an exhaustive, invariant-based testing suite that exercises the $1e0$ -> $1e2999999$ range to guarantee safety against precision limits or off-by-one errors.
- [ ] Fix any detected drift between JS runtime behavior and Python verification scripts.
- [ ] Handle scale limits safely (JavaScript Number limitations around maximum large numbers).

### Out of Scope

- Expanding the game mechanics (currently deprioritized in favor of number notation correctness).
- Re-writing the core logic in another language for production (keeping vanilla JS as top priority).

## Context

- The project relies heavily on string mapping, exponent calculation, and custom formatting implementations (`InfiniteNumberFormatter`, `BigNum`).
- Existing tests (Python/Node) are fragmented or broken and missing CI enforcement.
- Number precision inside Javascript natively breaks down for exponents beyond normal limits.

## Constraints

- **Tech Stack**: Vanilla HTML/JS/CSS without heavy build tooling or web frameworks.
- **Accuracy**: Must strictly maintain consistency between readable names and suffixes. Tests must be exhaustive.
- **Architecture**: Ensure game and formatter remain modular, unblocking any future changes.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Current `scripts.js` is the working baseline | Need a fixed target to test against, though research against standard Googology wiki is requested to confirm. | — Pending |
| Verify both readable + abbreviation | Consistency requires mapping outputs to make sense (e.g., if Name is Millillion, Abbreviation must strictly align). | — Pending |
| Exhaustive testing | A limited sampled sweep is not enough; the massive range $1e2999999$ is prone to edge case regressions. | — Pending |

---
*Last updated: 2026-03-20 after project initialization*
