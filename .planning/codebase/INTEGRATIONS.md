# External Integrations

**Analysis Date:** 2026-03-20

## APIs & External Services

**Runtime Service Integrations:**

- None detected in application runtime code (`templates/js/scripts.js`, `templates/js/game.js`, `index.html`, `game.html`).
- No `fetch`, `XMLHttpRequest`, websocket, or third-party SDK usage detected in app code.

**Reference/Documentation Links (non-runtime):**

- External links to Googology wiki and reference projects exist in `README.md` and `documents/tier2-readable-research-checklist.md`.
- These are informational references, not programmatic API integrations.

## Data Storage

**Databases:**

- Not applicable. No database client or connection layer detected.

**File Storage:**

- Local browser storage only.

**Caching:**

- No dedicated cache service detected.
- Browser `localStorage` is used for game save state in `templates/js/game.js`.

## Authentication & Identity

**Auth Provider:**

- None detected.
- No login/session/auth flow found in `index.html`, `game.html`, `templates/js/scripts.js`, or `templates/js/game.js`.

## Monitoring & Observability

**Error Tracking:**

- None detected.

**Logs:**

- Browser console logging only (`console.error` in `templates/js/game.js`).

## CI/CD & Deployment

**Hosting:**

- GitHub Pages (documented in `README.md`).

**CI Pipeline:**

- None detected (no workflow files in `.github/workflows/`).

## Environment Configuration

**Required env vars:**

- None detected.

**Secrets location:**

- Not applicable (no secret-based integrations detected).

## Webhooks & Callbacks

**Incoming:**

- None detected.

**Outgoing:**

- None detected.

## Internal Integrations

- `game.html` loads shared formatter logic from `templates/js/scripts.js` before loading `templates/js/game.js`, creating an in-browser dependency on the global `formatter` instance.
- `index.html` integrates only with `templates/js/scripts.js` for number conversion UI behavior.

---

*Integration audit: 2026-03-20*
