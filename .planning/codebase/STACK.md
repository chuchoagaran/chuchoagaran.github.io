# Technology Stack

**Analysis Date:** 2026-03-20

## Languages

**Primary:**

- HTML5 - Page entry points and UI markup in `index.html` and `game.html`.
- CSS3 - Styling in `templates/css/styles.css` and `templates/css/game.css`.
- JavaScript (Vanilla, browser-side) - Core logic in `templates/js/scripts.js` and gameplay logic in `templates/js/game.js`.

**Secondary:**

- Python 3 (utility/testing only) - Script-based formatter checks in `scripts/tests/test_formatter.py`.
- Lua (reference only) - Research/reference sources in `scripts/references/ETERNITYNUM.LUA` and `scripts/roblox/*.lua`.
- Markdown - Project docs in `README.md`, `documents/*.md`, and `.github/copilot-instructions.md`.

## Runtime

**Environment:**

- Browser runtime (client-side only). Scripts are loaded via `<script>` tags in `index.html` and `game.html`.
- No server runtime detected in repository code.

**Package Manager:**

- Not detected (no `package.json`, `requirements.txt`, `pyproject.toml`, `go.mod`, or similar manifest found at repo root).
- Lockfile: missing.

## Frameworks

**Core:**

- Not detected. App uses framework-free HTML/CSS/JavaScript.

**Testing:**

- No formal test framework configuration detected.
- Script-based test harness present in `scripts/tests/test_formatter.py`.

**Build/Dev:**

- No bundler/build pipeline detected (no Vite/Webpack/TS config files).
- Local static preview documented via Python HTTP server in `README.md` and `.github/copilot-instructions.md`.

## Key Dependencies

**Critical:**

- No third-party runtime libraries detected. Business logic appears self-contained in `templates/js/scripts.js` and `templates/js/game.js`.

**Infrastructure:**

- GitHub Pages deployment model documented in `README.md`.

## Configuration

**Environment:**

- No required environment variables detected for local run or deployment.
- No environment file usage detected by code paths.

**Build:**

- No build configuration files detected.
- Editor-only configuration present in `.vscode/settings.json`.

## Platform Requirements

**Development:**

- Modern web browser to run `index.html` / `game.html`.
- Optional Python 3 for local preview command (`python -m http.server 8000`) per `README.md`.

**Production:**

- Static hosting target: GitHub Pages (documented in `README.md`).

---

*Stack analysis: 2026-03-20*
