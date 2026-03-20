# Codebase Structure

**Analysis Date:** 2026-03-20

## Directory Layout

```text
[project-root]/
|-- .github/              # Copilot/project guidance and instructions
|-- .planning/codebase/   # Generated architecture/stack/convention map docs
|-- .vscode/              # Editor workspace settings
|-- documents/            # Human-readable research and algorithm notes
|-- scripts/
|   |-- references/       # External/reference notation implementations (non-runtime)
|   |-- roblox/           # Roblox-specific Lua scripts and plans
|   `-- tests/            # Python verification script(s)
|-- templates/
|   |-- css/              # Shared and page-specific stylesheets
|   |-- js/               # Runtime browser JavaScript
|   `-- favicon.svg       # Site icon
|-- index.html            # Number reader application entry page
|-- game.html             # Coin clicker game entry page
|-- README.md             # Project overview
`-- LICENSE               # License file
```

## Directory Purposes

**`.github/`:**
- Purpose: Repository-level development instructions.
- Contains: `copilot-instructions.md`.
- Key files: `.github/copilot-instructions.md`.

**`templates/js/`:**
- Purpose: Browser runtime logic.
- Contains: Shared formatter (`scripts.js`) and game logic (`game.js`).
- Key files: `templates/js/scripts.js`, `templates/js/game.js`.

**`templates/css/`:**
- Purpose: Site styling.
- Contains: Base site style and game-specific style.
- Key files: `templates/css/styles.css`, `templates/css/game.css`.

**`scripts/references/`:**
- Purpose: Source/reference artifacts used for research and algorithm inspiration.
- Contains: Lua/JS and markdown references.
- Key files: `scripts/references/ETERNITYNUM.LUA`, `scripts/references/ANTIMATER_DIMENSITON_NOTATION.JS`.

**`scripts/tests/`:**
- Purpose: Offline validation helper scripts.
- Contains: Python formatter test harness.
- Key files: `scripts/tests/test_formatter.py`.

**`scripts/roblox/`:**
- Purpose: Roblox-specific scripts and planning docs, separate from website runtime.
- Contains: Lua gameplay scripts and markdown planning notes.
- Key files: `scripts/roblox/cashdisplay.lua`, `scripts/roblox/PLANS.MD`.

**`documents/`:**
- Purpose: Research and naming-system documentation.
- Contains: Markdown notes/checklists.
- Key files: `documents/DOCUMENTATION for inf numnber.md`, `documents/insanenumber-inferred-algorithm.md`.

## Key File Locations

**Entry Points:**
- `index.html`: Main number reader UI and script entry.
- `game.html`: Game UI and script entry.

**Configuration:**
- `.github/copilot-instructions.md`: Development constraints and architecture guidance.
- `.vscode/settings.json`: Workspace editor configuration.

**Core Logic:**
- `templates/js/scripts.js`: `InfiniteNumberFormatter`, parsing, readable text/abbreviation generation, reader bootstrap.
- `templates/js/game.js`: Big number arithmetic, simulation loop, economy, UI binding, save/load.

**Testing:**
- `scripts/tests/test_formatter.py`: Python port-based formatter verification.
- `scripts/references/test_formatter.js`: Node verification script against browser formatter logic.

## Naming Conventions

**Files:**
- HTML entry files are top-level lowercase (`index.html`, `game.html`).
- Runtime JS/CSS files are lowercase in `templates/` (`templates/js/scripts.js`).
- Reference/docs include legacy mixed naming and spaces; preserve existing names (`documents/standard illion .md`).

**Directories:**
- Feature/resource grouping by purpose (`templates/`, `scripts/`, `documents/`).
- Runtime assets are centralized under `templates/`.

## Where to Add New Code

**New Feature:**
- Primary code: `templates/js/` for runtime logic and top-level HTML for entry-page markup.
- Tests: `scripts/tests/` for Python checks, or `scripts/references/` for JS validation helpers.

**New Component/Module:**
- Implementation: Add browser modules beside related runtime file in `templates/js/`.

**Utilities:**
- Shared helpers: `templates/js/scripts.js` when logic must be reused by both reader and game pages.

## Special Directories

**`.planning/codebase/`:**
- Purpose: Generated codebase analysis outputs for GSD workflow.
- Generated: Yes.
- Committed: Yes.

**`scripts/references/`:**
- Purpose: External/reference artifacts for algorithm comparison.
- Generated: No.
- Committed: Yes.

---

*Structure analysis: 2026-03-20*
