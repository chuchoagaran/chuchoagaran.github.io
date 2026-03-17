# Project Guidelines

## Code Style
- Primary stack is plain HTML/CSS/JavaScript; CSS and JS are correctly located in the `templates/` folder (`templates/css/styles.css` and `templates/js/scripts.js`).
- Keep code framework-free (Vanilla JS/CSS) unless explicitly requested.
- Follow the existing JS pattern (e.g., `InfiniteNumberFormatter` class): class-based structure, descriptive method names, and readable logic blocks. 
- Use `const`/`let` (not `var`) in new JavaScript.
- Preserve current naming/files as-is, even if misspelled in references, unless the task explicitly asks to rename.
- Keep browser-targeted code dependency-light; no build tooling is currently configured.

## Architecture
- This is a static GitHub Pages project.
- Entry point is `index.html` which contains the input form and result display.
- Styling is in `templates/css/styles.css` and main logic connects in `templates/js/scripts.js`.
- Core conversion logic lives in `templates/js/scripts.js`.
- Reference material is in `scripts/references/` (e.g. `ANTIMATER_DIMENSITON_NOTATION.JS` and `ETERNITYNUM.LUA`).

## Build and Test
- No package manager or automated test runner is configured.
- Local preview (from repo root):
  - `python -m http.server 8000`
  - then open `http://localhost:8000`
- Alternative quick check: open `index.html` directly in a browser.
- If adding tooling in the future, document exact install/run commands in `README.md` in the same change.

## Conventions
- Project goal: convert very large number notation (e.g., `1Qa`, `1e1920`) to readable full text + notation.
- Treat `.js` and `.lua` files in `scripts/references/` purely as reference material; do not edit them. Adapt ideas into main project code instead.
- Validation: Ensure inputs are properly sanitized before running conversion logic (specifically checking for valid scientific notation `XeY`).
- Security: Do not introduce `eval`, dynamic script injection, or untrusted HTML insertion when parsing user-entered strings.

# Version Number
- When the user agrees to update the version, they will modify it manually or ask the AI to do it. Currently explicitly written in `index.html`.