# Canonical Naming Rules for Infinite Number Formatter

This document serves as the source of truth for the Infinite Number Formatter (`scripts.js`), formalizing the naming rules from $10^0$ up to $10^{2,999,999}$ (Tier 1, Tier 2, and above). This unifies the Conway-Wechsler system with our implementation.

## Tier 1 (1e0 to 1e30)
- $10^0$: One
- $10^3$: Thousand (k)
- $10^6$: Million (M)
- $10^9$: Billion (B)
- $10^{12}$: Trillion (T)
- $10^{15}$: Quadrillion (Qa)
- $10^{18}$: Quintillion (Qi)
- $10^{21}$: Sextillion (Sx)
- $10^{24}$: Septillion (Sp)
- $10^{27}$: Octillion (Oc)
- $10^{30}$: Nonillion (No)

## Tier 2 (1e33 to 1e3000)
Follows Conway-Wechsler conventions for illions. 
Numbers use base roots combining Units, Tens, and Hundreds.
1. **Units**: un(1), duo(2), tre(3), quattuor(4), quin(5), sex(6), septen(7), octo(8), novem(9)
2. **Tens**: deci(10), viginti(20), triginta(30), quadraginta(40), quinquaginta(50), sexaginta(60), septuaginta(70), octoginta(80), nonaginta(90)
3. **Hundreds**: centi(100), ducenti(200), trecenti(300), quadringenti(400), quingenti(500), sescenti(600), septingenti(700), octingenti(800), nongenti(900)

Current logic exactly reconstructs the illion index $n$ into units and tens and adds an "illion" suffix.

## Abbreviations Parity (1e0 up to 1e2999999)
Abbreviation mappings match exactly to the established notation lengths and structure.
For Tier 2, abbreviation is formed by taking up to three letters from the tier root.
- Un -> U
- Dec -> D
- Cent -> C
- Millillion (1e3003) -> Mi
- Micrillion (1e3000003) -> Mc

### Extreme Edges
- $10^{3003}$: `1 Mi` (1 Millillion)
- $10^{6003}$: `1 DiMi` or `1 BiMi` depending on the tier base (We enforce `1 Ba` or `1 Plat` based on custom `scripts.js` rules). For exact edge examples: $10^{3003}$ uses "Millillion", and $10^{6003}$ uses "Platillion" or "Millillion" equivalent but for Tier 3 logic.
- The standard enforces consistency up to `1e2999999`.

 
