---
phase: 3
---
# Phase 3 Validation Strategy

## Dimension 8 Coverage (Nyquist)

- Must verify that `templates/js/scripts.js` remains the single production source for names and abbreviations after refactor.
- Must verify that all canonical fixture cases and boundary windows still pass through the Node harness.
- Must verify that Python parity stays green after the JS refactor, proving no hidden drift was introduced.
- Must verify that supported-ceiling behavior is enforced in runtime parsing for both scientific and suffix input forms.
- Must verify that unsupported or unsafe integer exponents fail automatically with deterministic errors instead of producing undefined formatter output.
- Must provide automated commands for every plan so Phase 3 can close without manual inspection.
