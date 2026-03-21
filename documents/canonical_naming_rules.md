# Canonical Naming Rules for Infinite Number Formatter

This document is the Phase 1 source of truth for the current formatter implementation in `templates/js/scripts.js`. It does not attempt to define every possible googology extension. It defines the exact naming behavior that the repository currently supports from `1e0` through `1e2999999` so later phases can test against one deterministic standard.

## Scope and Supported Ceiling

The formatter derives a name group from the exponent using the exact runtime formula:

`suffixIndex = floor(exponent / 3) - 1`

That yields the following project boundaries:

- Exponents below `1e3` do not receive an `-illion` name and are treated as `Under a Thousand`.
- Tier 1 covers suffix indices `0` through `999`.
- Tier 2 covers suffix indices `1000` through `999998` within this project.
- The maximum supported exponent in scope is `1e2999999`.

At the ceiling:

- `suffixIndex = floor(2999999 / 3) - 1 = 999998`
- `t2Index = floor(999998 / 1000) = 999`
- `t1Index = 999998 % 1000 = 998`

This means the supported range never requires a Tier 3 naming layer. `1e3000003` is out of scope for Phase 1, because that is where a third naming group would begin.

## Tier 1 Reference Names

The formatter uses the following direct names for the first ten groups:

- `10^0` -> One
- `10^3` -> Thousand
- `10^6` -> Million
- `10^9` -> Billion
- `10^12` -> Trillion
- `10^15` -> Quadrillion
- `10^18` -> Quintillion
- `10^21` -> Sextillion
- `10^24` -> Septillion
- `10^27` -> Octillion
- `10^30` -> Nonillion

For larger Tier 1 names, the formatter builds a Latin stem from these arrays in `templates/js/scripts.js`:

- `units`: `Un`, `Duo`, `Tre`, `Quattuor`, `Quin`, `Sex`, `Septen`, `Octo`, `Novem`
- `tens`: `Deci`, `Viginti`, `Triginta`, `Quadraginta`, `Quinquaginta`, `Sexaginta`, `Septuaginta`, `Octoginta`, `Nonaginta`
- `hundreds`: `Centi`, `Ducenti`, `Trecenti`, `Quadringenti`, `Quingenti`, `Sescenti`, `Septingenti`, `Octingenti`, `Nongenti`

The runtime concatenates unit, tens, and hundreds stems, normalizes repeated vowels with `.replace(/ii/g, "i").replace(/aa/g, "a").replace(/oo/g, "o").replace(/ao/g, "o")`, removes a trailing vowel if present, and then appends `illion`.

## Canonical Full-Name Algorithm

The canonical full-name behavior matches `getFullNameFromExponent(exponent)` exactly.

1. If `exponent < 3`, the full-name category is `Under a Thousand`.
2. Compute `suffixIndex = floor(exponent / 3) - 1`.
3. If `suffixIndex < 1000`, return `getTier1Name(suffixIndex + 1)`.
4. If `suffixIndex >= 1000`, split into:
	- `t2Index = floor(suffixIndex / 1000)`
	- `t1Index = suffixIndex % 1000`
5. Build the Tier 2 prefix with `getMilliPrefix(t2Index)`:
	- `t2Index === 1` -> `milli`
	- `2` through `9` -> `milliOnes[t2Index] + "milli"`
	- `10` and above -> `milliOnes[o] + tens[t].toLowerCase() + hundreds[h].toLowerCase() + "milli"`
6. Build the suffix:
	- if `t1Index === 0`, append `llion`
	- otherwise append `getTier1Name(t1Index + 1).toLowerCase()`
7. Capitalize the first character of the finished string.

This is a two-layer system across the supported range. No Tier 3 naming is required inside project scope.

## Worked Full-Name Examples

- `10^3 -> Thousand`
- `10^6 -> Million`
- `10^33 -> Decillion`
- `10^3003 -> Millillion`
- `10^6003 -> Dumillillion`

## Canonical Abbreviation Algorithm

The canonical abbreviation behavior matches `getLuaStyleAbbreviationSuffix(exponent)` exactly.

1. If `exponent < 3`, the abbreviation suffix is empty.
2. Compute `suffixIndex = floor(exponent / 3) - 1`.
3. If `suffixIndex < 0`, the abbreviation suffix is empty.
4. If `suffixIndex` is `0`, `1`, or `2`, use the direct short suffix table:
	- `0 -> K`
	- `1 -> M`
	- `2 -> B`
5. If `suffixIndex` is from `3` through `999`, use `getSmallSuffixChunk(index)` built from:
	- `firstOnes = ["", "U", "D", "T", "Qd", "Qn", "Sx", "Sp", "Oc", "No"]`
	- `secondOnes = ["", "De", "Vt", "Tg", "qg", "Qg", "sg", "Sg", "Og", "Ng"]`
	- `thirdOnes = ["", "Ce", "Du", "Tr", "Qa", "Qi", "Se", "Si", "Ot", "Ni"]`
6. If `suffixIndex` is from `1000` through `999998`, the supported range never exceeds a single higher group, so the canonical construction is:

`getLargeSuffixChunk(floor(suffixIndex / 1000) - 1) + "Mi" + getSmallSuffixChunk(suffixIndex % 1000)`

7. Inside the supported range, only the `Mi` tier token appears because `maxGroup` never exceeds `1` below `1e3000000`.

`getLargeSuffixChunk(index)` first increments positive values by `1`, reduces values above `1000` modulo `1000`, and then returns `getSmallSuffixChunk(adjusted)`.

## Name-to-Abbreviation Parity Rules

Every documented example must resolve to one full name and one abbreviation. The parity rule is strict: if the full-name example appears in this document, the abbreviation example listed beside it is the only canonical shorthand for the same exponent.

| Exponent | Full name | Abbreviation |
|----------|-----------|--------------|
| `10^3` | `Thousand` | `K` |
| `10^6` | `Million` | `M` |
| `10^33` | `Decillion` | `De` |
| `10^3003` | `Millillion` | `Mi` |
| `10^6003` | `Dumillillion` | `DMi` |

No alternate abbreviations are canonical for these boundary cases.

## Worked Abbreviation Examples

- `10^3 -> K`
- `10^6 -> M`
- `10^33 -> De`
- `10^3003 -> Mi`
- `10^6003 -> DMi`


