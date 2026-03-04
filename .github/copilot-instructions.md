# Project Guidelines

## Code Style
- Primary stack is plain HTML/CSS/JavaScript;whereas css,js is located in template folder for simple structure.  keep changes framework-free unless explicitly requested (`README.md`).
- Follow existing JS style in `scripts/almost working implementation.js`: class-based structure, descriptive method names, and readable section blocks.
- Use `const`/`let` (not `var`) in new JavaScript.
- Preserve current naming/files as-is, even if misspelled, unless the task explicitly asks to rename.
- Keep browser-targeted code dependency-light; no build tooling is currently configured.

## Architecture
- This is a static GitHub Pages-style project (`README.md`: deploy target is GitHub Pages).
- Current implementation logic lives in `scripts/`:
  - `scripts/almost working implementation.js`: experimental formatter for exponent->name conversion.
  - `scripts/ANTIMATER_DIMENSITON_NOTATION.JS`: local reference copy of AD notation logic.
  - `scripts/ETERNITYNUM.LUA`: Lua reference library (not executed by the web app).
- `index.html` is currently empty and acts as the future integration entry point.
- `templates/css/` and `templates/js/` exist but are empty scaffolding folders.

## Build and Test
- No package manager or test runner is configured.
- Local preview (from repo root):
  - `python -m http.server 8000`
  - open `http://localhost:8000`
- Alternative quick check: open `index.html` directly in a browser.
- If adding tooling, document exact install/run commands in `README.md` in the same change.

## Project Conventions
- Project goal: convert very large number notation (e.g., `1Qa`, `1e1920`) to readable full text + notation (`README.md`).
- Treat `scripts/ANTIMATER_DIMENSITON_NOTATION.JS` and `scripts/ETERNITYNUM.LUA` as reference material; prefer adapting ideas into project code rather than editing references heavily.
- Keep experimental output and quick checks near implementation while prototyping (existing console-based pattern in `scripts/almost working implementation.js`).

## Integration Points
- External conceptual references (from `README.md`):
  - Antimatter Dimensions notation source
  - Roblox Everything Upgrade Tree scripting ideas
  - Googology naming references
- There is currently no API/backend integration.

## Security
- Do not introduce `eval`, dynamic script injection, or untrusted HTML insertion when parsing user-entered number strings.
- Validate and sanitize input formats before conversion logic (scientific notation, suffix notation).
- Keep third-party code provenance clear when importing/adapting external snippets; note source in `README.md`.

# Version number
- when user agreed to update version he will up manually or ask ai again