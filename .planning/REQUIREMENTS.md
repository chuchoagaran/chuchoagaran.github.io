# Requirements: Infinite Number Framework

**Defined:** 2026-03-20
**Core Value:** Absolute logical correctness and consistency of the number naming algorithm from 1e0 to at least 1e2999999, ensuring mapping against standard Googology wiki patterns, fallbacking to scripts.js conventions where required.

## v1 Requirements

### Documentation and Alignment

- [x] **DOC-01**: Formally catalog the canonical source of truth logic for naming numbers up to `1e2999999`, consulting Googology wiki.
- [x] **DOC-02**: Establish rules for suffixes/abbreviations to strictly match the canonical names.

### Formatting Logic (JS)

- [ ] **FMT-01**: `InfiniteNumberFormatter` matches canonical naming standard for all exponents `1e0` - `1e2999999`
- [ ] **FMT-02**: `InfiniteNumberFormatter` matches canonical abbreviation standard for all exponents `1e0` - `1e2999999`
- [ ] **FMT-03**: Safe integer bounds are enforced during formatting string generation, mitigating float overflow risks.

### Verification Suite

- [x] **TEST-01**: Extensive snapshot boundary/invariant tests created (JS and/or Python) proving full naming logic accuracy.
- [x] **TEST-02**: Extensive snapshot boundary/invariant tests proving full abbreviation mapping accuracy.
- [x] **TEST-03**: Cross-language script parity (Python helper vs JS implementation) is established and automated to prevent drift.

## Out of Scope

| Feature | Reason |
|---------|--------|
| New Game mechanics | Focus is solely on correctness of large numbers in current iteration. |
| Non-JS runtime for the browser | Staying within JS limits the complexity overhead. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DOC-01 | Phase 1 | Complete |
| DOC-02 | Phase 1 | Complete |
| TEST-01 | Phase 2 | Complete |
| TEST-02 | Phase 2 | Complete |
| TEST-03 | Phase 2 | Complete |
| FMT-01 | Phase 3 | Pending |
| FMT-02 | Phase 3 | Pending |
| FMT-03 | Phase 3 | Pending |

---
*Requirements defined: 2026-03-20*
