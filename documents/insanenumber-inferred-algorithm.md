# Inferred Algorithm From insanenumber.md

This is an inferred model from the list in scripts/insanenumber.md.
It is not fully canonical Conway-Wechsler. Parts of the list are custom coinages.

## 1) Base layer (standard short-scale -illion)

For index n >= 1:

- million = n=1
- billion = n=2
- ...
- name(n) has exponent E = 3n + 3

So:

- million => 10^6
- sextillion => 10^21
- nonillion => 10^30

## 2) Core constructor used repeatedly

A dominant pattern in the file is:

- 10^(3 * 10^X + 3)

Define:

- Phi(X) = 3 * 10^X + 3

Many listed names are of the form:

- 10^Phi(X)
where X is the exponent of another named number.

Examples from list:

- Micrillion ~ 10^3000003 = 10^Phi(6)
- Zeptillion line indicates 10^Phi(21) (based on sextillion = 10^21)
- Quectillion line indicates 10^Phi(30) (based on nonillion = 10^30)

## 3) Second-order recursion pattern

Another repeated pattern is effectively:

- 10^Phi(Phi(X))

That shows up in entries like zettillion/yottillion style rows where the exponent references a prior "3...3" construction.

## 4) Family structure seen in names

The names are grouped into families by prefix systems:

- SI-like family: micro/nano/pico/femto/atto/zepto/yocto/ronto/quecto inspired forms
- Greek-count families: triacont-, tetracont-, pentacont-, ...
- k/meg/gig/ter/pet/ex/... inspired families at higher recursion depth

These families map to chosen seed exponents X, then apply Phi once or multiple times.

## 5) Why exact name generation is hard from this file alone

The list mixes:

- standard forms,
- custom invented forms,
- old-name aliases,
- inconsistent shorthand formatting (spaces, 3name3 notation, x vs * usage).

So a fully deterministic name generator cannot be uniquely recovered from this one file without an explicit mapping table for the custom families.

## 6) Practical implementation strategy

Use a hybrid approach:

1. Numeric backbone (deterministic):

- Implement E(name) and Phi(X).
- Compute giant exponents recursively from seed names.

1. Naming layer (table-driven):

- Keep standard Conway-Wechsler for normal -illion names.
- Add custom family dictionaries from this list for nonstandard coined names.

1. Round-trip safety:

- Prefer parsing expression forms to numeric towers first.
- Then attach display labels from the custom dictionary only when exact match exists.

## 7) Minimum data needed to make it reliable

To make this generator robust, define explicitly:

- seed set: {million, billion, ..., tredecillion, ...}
- each custom family rule: prefix, seed mapping, recursion depth
- whether each family uses Phi(X), Phi(Phi(X)), or another constructor
- canonical spelling to use when aliases exist

Without those declarations, only the exponent-construction pattern is stable, not all output names.
