/**
 * Node.js verification test for InfiniteNumberFormatter
 * Tests that abbreviation and readable names are unique and consistent.
 *
 * Run: node scripts/test_formatter.js
 */

const vm = require('vm');
const fs = require('fs');
const path = require('path');

// Load the formatter class from scripts.js
const scriptPath = path.join(__dirname, '..', 'templates', 'js', 'scripts.js');
let source = fs.readFileSync(scriptPath, 'utf8');

// Strip browser-only code (everything from "const formatter = ..." onward)
source = source.replace(/^const formatter = new InfiniteNumberFormatter\(\);[\s\S]*$/m, '');

// Execute in this context to define InfiniteNumberFormatter
vm.runInThisContext(source);

const formatter = new InfiniteNumberFormatter();

// ── Test helpers ──────────────────────────────────────────────
let passed = 0;
let failed = 0;

function assert(cond, msg) {
    if (cond) {
        passed++;
    } else {
        failed++;
        console.log(`  FAIL: ${msg}`);
    }
}

function section(title) {
    console.log(`\n=== ${title} ===`);
}

// ── 1) Known-value tests ─────────────────────────────────────
section("Known readable values");

const knownReadable = [
    [6, "Million"],
    [9, "Billion"],
    [12, "Trillion"],
    [33, "Decillion"],
    [303, "Centillion"],
    [3000, "NovemNonagintaNongentillion"],
    [3003, "Millillion"],
    [3006, "Millimillion"],
    [3009, "Millibillion"],
    [3012, "Millitrillion"],
    [6003, "Dumillillion"],
    [6006, "Dumillimillion"],
    [9003, "Trimillillion"],
    [9006, "Trimillimillion"],
    [12003, "Quadrimillillion"],
    [15003, "Quinmillillion"],
    [18003, "Sexmillillion"],
    [21003, "Septimillillion"],
    [24003, "Octimillillion"],
    [27003, "Nonimillillion"],
    [30003, "Decimillillion"],
];

for (const [exp, expected] of knownReadable) {
    const actual = formatter.getFullNameFromExponent(exp);
    assert(actual === expected,
        `10^${exp}: expected readable "${expected}", got "${actual}"`);
}

section("Known abbreviation values");

const knownAbbrev = [
    [3, "K"],
    [6, "M"],
    [9, "B"],
    [12, "T"],
    [15, "Qd"],      // suffixIndex=4
    [33, "De"],       // suffixIndex=10
    [303, "Ce"],     // suffixIndex=100 -> ones=0,tens=0,hundreds=1 -> "Ce"
    [3003, "Mi"],       // suffixIndex=1000
    [3006, "MiU"],      // suffixIndex=1001 (FIXED: was "Mi")
    [3009, "MiD"],      // suffixIndex=1002
    [3012, "MiT"],      // suffixIndex=1003
    [6003, "DMi"],      // suffixIndex=2000
    [6006, "DMiU"],     // suffixIndex=2001 (FIXED)
];

for (const [exp, expected] of knownAbbrev) {
    const actual = formatter.getAbbreviationFromExponent(exp);
    assert(actual === expected,
        `10^${exp}: expected abbreviation "${expected}", got "${actual}"`);
}

// ── 2) Uniqueness tests ──────────────────────────────────────
section("Abbreviation uniqueness around tier-2 boundaries");

function testUniqueness(label, start, end) {
    const abbrevMap = new Map();
    const readableMap = new Map();
    let dupeAbbrev = 0;
    let dupeReadable = 0;

    for (let exp = start; exp <= end; exp += 3) {
        const suffIdx = Math.floor(exp / 3) - 1;
        const abbrev = formatter.getAbbreviationFromExponent(exp);
        const readable = formatter.getFullNameFromExponent(exp);

        if (abbrevMap.has(abbrev)) {
            dupeAbbrev++;
            console.log(`  DUP abbreviation "${abbrev}": 10^${abbrevMap.get(abbrev)} and 10^${exp}`);
        } else {
            abbrevMap.set(abbrev, exp);
        }

        if (readableMap.has(readable)) {
            dupeReadable++;
            console.log(`  DUP readable "${readable}": 10^${readableMap.get(readable)} and 10^${exp}`);
        } else {
            readableMap.set(readable, exp);
        }
    }

    assert(dupeAbbrev === 0, `${label}: ${dupeAbbrev} duplicate abbreviations found`);
    assert(dupeReadable === 0, `${label}: ${dupeReadable} duplicate readable names found`);
}

// Test around each tier-2 boundary (exponents around 3003, 6003, 9003, ...)
testUniqueness("Tier1→Tier2 boundary (e2994..e3015)", 2994, 3015);
testUniqueness("Milli group (e3003..e3300)", 3003, 3300);
testUniqueness("Dumilli boundary (e5994..e6015)", 5994, 6015);
testUniqueness("Trimilli boundary (e8994..e9015)", 8994, 9015);
testUniqueness("Octimilli boundary (e23994..e24015)", 23994, 24015);
testUniqueness("Nonimilli boundary (e26994..e27015)", 26994, 27015);
testUniqueness("Decimilli boundary (e29994..e30015)", 29994, 30015);

// ── 3) Side-by-side dump of key ranges ───────────────────────
section("Side-by-side: abbreviation vs readable (e2997..e3030)");

for (let exp = 2997; exp <= 3030; exp += 3) {
    const abbrev = formatter.getAbbreviationFromExponent(exp);
    const readable = formatter.getFullNameFromExponent(exp);
    console.log(`  10^${exp.toString().padStart(5)}  abbrev=${abbrev.padEnd(12)}  readable=${readable}`);
}

section("Side-by-side: tier-2 boundaries");

for (const exp of [3003, 3006, 3009, 6003, 6006, 9003, 9006, 12003, 15003, 18003, 21003, 24003, 27003, 30003]) {
    const abbrev = formatter.getAbbreviationFromExponent(exp);
    const readable = formatter.getFullNameFromExponent(exp);
    console.log(`  10^${exp.toString().padStart(5)}  abbrev=${abbrev.padEnd(12)}  readable=${readable}`);
}

section("Side-by-side: compound tier-2 indices (10+, 41, 100, 200)");

// t2Index=10 → decimilli, t2Index=41 → unquadragintamilli, t2Index=100 → centimilli
for (const t2 of [10, 11, 20, 41, 100, 200, 500, 999]) {
    const exp = t2 * 3000 + 3;  // base exponent for that tier2 index
    const abbrev = formatter.getAbbreviationFromExponent(exp);
    const readable = formatter.getFullNameFromExponent(exp);
    console.log(`  t2=${String(t2).padStart(3)}  10^${exp.toString().padStart(8)}  abbrev=${abbrev.padEnd(16)}  readable=${readable}`);
}

// ── 4) Verify buildReadableText and buildAbbreviationText work end-to-end ──
section("End-to-end: buildReadableText + buildAbbreviationText");

const e2eTests = [
    { mantissa: 1, exponent: 3006, expectReadable: "1 Millimillion", expectAbbrev: "1 MiU" },
    { mantissa: 1, exponent: 3009, expectReadable: "1 Millibillion", expectAbbrev: "1 MiD" },
    { mantissa: 5, exponent: 6003, expectReadable: "5 Dumillillion", expectAbbrev: "5 DMi" },
    { mantissa: 1, exponent: 3005, expectReadable: "100 Millillion", expectAbbrev: "100 Mi" },
];

for (const t of e2eTests) {
    const readable = formatter.buildReadableText(t.mantissa, t.exponent);
    const abbrev = formatter.buildAbbreviationText(t.mantissa, t.exponent);
    assert(readable === t.expectReadable,
        `buildReadableText(${t.mantissa}, ${t.exponent}): expected "${t.expectReadable}", got "${readable}"`);
    assert(abbrev === t.expectAbbrev,
        `buildAbbreviationText(${t.mantissa}, ${t.exponent}): expected "${t.expectAbbrev}", got "${abbrev}"`);
}

// ── Summary ──────────────────────────────────────────────────
section("Summary");
console.log(`  Passed: ${passed}`);
console.log(`  Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
