# Architecture

**Analysis Date:** 2026-03-20

## Pattern Overview

**Overall:** Static client-side web app with page-level script composition.

**Key Characteristics:**
- Multi-page HTML entry points (`index.html` and `game.html`) with no server runtime.
- Shared domain logic in `templates/js/scripts.js` reused by both pages.
- Game-specific simulation/runtime in `templates/js/game.js`, layered on top of shared formatter APIs.

## Layers

**Presentation Layer:**
- Purpose: Render input forms, stats, shop controls, and graph canvas; expose DOM anchors for script binding.
- Location: `index.html`, `game.html`, `templates/css/styles.css`, `templates/css/game.css`
- Contains: Markup, semantic sections, element IDs/classes, visual styling.
- Depends on: Browser DOM/CSS engine.
- Used by: `templates/js/scripts.js` (`setupMiniReader`) and `templates/js/game.js` (UI updates + event listeners).

**Shared Domain Logic Layer:**
- Purpose: Parse notation input and convert exponents to readable names/abbreviations.
- Location: `templates/js/scripts.js`
- Contains: `InfiniteNumberFormatter` class, parsing/normalization methods, text builders, abbreviation logic.
- Depends on: JavaScript built-ins (`Math`, `Number`, regex).
- Used by: Reader form flow in `index.html` and game number formatting in `templates/js/game.js` via global `formatter`.

**Game Domain + Runtime Layer:**
- Purpose: Model very large numeric values, progression mechanics, upgrade economy, save/load, and render loop.
- Location: `templates/js/game.js`
- Contains: `BigNum` arithmetic class, `state` object, purchase estimators, shop handlers, `gameLoop`, localStorage persistence.
- Depends on: Shared global `formatter` from `templates/js/scripts.js`, browser APIs (`requestAnimationFrame`, `localStorage`, canvas).
- Used by: `game.html` only.

**Reference and Research Layer:**
- Purpose: Hold external algorithm references and exploratory docs not loaded into production pages.
- Location: `scripts/references/`, `documents/`
- Contains: Lua/JS reference implementations and notation research markdown.
- Depends on: Local file access for developers.
- Used by: Human development process; not imported by runtime scripts.

## Data Flow

**Number Reader Flow (`index.html`):**

1. User submits `#reader-form` with notation text.
2. `setupMiniReader()` intercepts submit and calls `formatter.convertInput(value)`.
3. `parseNotationInput()` validates scientific/suffix formats and derives mantissa+exponent.
4. Formatter builds readable text and abbreviation, then renderer writes output via `textContent` to `#reader-output`.

**Game Runtime Flow (`game.html`):**

1. Page loads `templates/js/scripts.js` first, then `templates/js/game.js`.
2. `game.js` initializes `state`, binds DOM events, and calls `loadGame()` from localStorage.
3. `requestAnimationFrame(gameLoop)` updates growth, applies bonuses, computes passive gains, and samples history.
4. `updateUI()` refreshes cost/state displays; shop handlers mutate `state`; autosave persists every 10 seconds.

**State Management:**
- In-memory singleton-style object `state` in `templates/js/game.js`.
- Durable state persisted in `localStorage` under `SAVE_KEY`.
- Reader page has no durable state; it performs stateless per-submit conversion.

## Key Abstractions

**`InfiniteNumberFormatter`:**
- Purpose: Canonical notation parsing and number-name formatting engine.
- Examples: `templates/js/scripts.js`
- Pattern: Stateful class with static lookup tables and pure-ish transformation methods.

**`BigNum`:**
- Purpose: Mantissa+exponent representation for very large game values.
- Examples: `templates/js/game.js`
- Pattern: Value-object-like class with normalization, arithmetic, compare, and power operations.

**Global `state`:**
- Purpose: Central game state container.
- Examples: `templates/js/game.js`
- Pattern: Mutable object updated by event handlers and frame loop.

## Entry Points

**Reader Page:**
- Location: `index.html`
- Triggers: Browser navigation to root page.
- Responsibilities: Collect notation input and display formatter output.

**Game Page:**
- Location: `game.html`
- Triggers: User follows game link or direct navigation.
- Responsibilities: Render clicker interface and run simulation loop.

**Reader Bootstrap:**
- Location: `templates/js/scripts.js` (`document.addEventListener("DOMContentLoaded", setupMiniReader)`)
- Triggers: DOM ready event.
- Responsibilities: Bind form submit and render conversion result.

**Game Bootstrap:**
- Location: `templates/js/game.js` (top-level bindings + `requestAnimationFrame(gameLoop)`)
- Triggers: Script evaluation after page load.
- Responsibilities: Bind controls, load save, start continuous updates.

## Error Handling

**Strategy:** Guard-and-return for invalid states, with user-facing messages for input/save failures.

**Patterns:**
- Input validation returns structured `{ ok: false, error }` results (`parseNotationInput`).
- Save import/load uses `try/catch`; recover with alerts/console errors (`loadGame`, import handler).

## Cross-Cutting Concerns

**Logging:** Minimal runtime logging (`console.error` in save-load failure path).
**Validation:** Regex-based notation validation in formatter, plus numeric finiteness/integer checks.
**Authentication:** Not applicable (static client-only app with no user accounts).

---

*Architecture analysis: 2026-03-20*
