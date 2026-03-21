/**
 * Authoritative Node.js verification harness for InfiniteNumberFormatter.
 *
 * Run from repo root:
 *   node scripts/references/test_formatter.js
 *   node scripts/references/test_formatter.js --json
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const jsonMode = process.argv.includes('--json');
const scriptPath = path.join(__dirname, '..', '..', 'templates', 'js', 'scripts.js');
const fixturePath = path.join(__dirname, '..', 'tests', 'formatter_vectors.json');

let source = fs.readFileSync(scriptPath, 'utf8');
source = source.replace(/^const formatter = new InfiniteNumberFormatter\(\);[\s\S]*$/m, '');
vm.runInThisContext(source);

const formatter = new InfiniteNumberFormatter();
const fixtures = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

let passed = 0;
let failed = 0;
const failures = [];
const caseResults = [];
const windowResults = [];

function log(message = '') {
    if (!jsonMode) {
        console.log(message);
    }
}

function section(title) {
    log(`\n=== ${title} ===`);
}

function assertEqual(actual, expected, label, meta) {
    if (actual === expected) {
        passed += 1;
        return true;
    }

    failed += 1;
    const failure = {
        label,
        expected,
        actual,
        ...meta
    };
    failures.push(failure);
    log(`  FAIL: ${label}`);
    log(`    expected: ${expected}`);
    log(`    actual  : ${actual}`);
    return false;
}

function evaluateCase(testCase) {
    const fullName = formatter.getFullNameFromExponent(testCase.exponent);
    const abbreviation = formatter.getAbbreviationFromExponent(testCase.exponent);
    const readableText = formatter.buildReadableText(testCase.mantissa, testCase.exponent);
    const abbreviationText = formatter.buildAbbreviationText(testCase.mantissa, testCase.exponent);

    const result = {
        id: testCase.id,
        exponent: testCase.exponent,
        fullName,
        abbreviation,
        readableText,
        abbreviationText,
        passed: true
    };

    result.passed = assertEqual(fullName, testCase.expectedFullName, `${testCase.id} full name`, { id: testCase.id, field: 'fullName' }) && result.passed;
    result.passed = assertEqual(abbreviation, testCase.expectedAbbreviation, `${testCase.id} abbreviation`, { id: testCase.id, field: 'abbreviation' }) && result.passed;
    result.passed = assertEqual(readableText, testCase.expectedReadableText, `${testCase.id} readable text`, { id: testCase.id, field: 'readableText' }) && result.passed;
    result.passed = assertEqual(abbreviationText, testCase.expectedAbbreviationText, `${testCase.id} abbreviation text`, { id: testCase.id, field: 'abbreviationText' }) && result.passed;

    caseResults.push(result);
}

function evaluateBoundaryWindow(windowSpec) {
    const seenAbbreviations = new Map();
    const seenNames = new Map();
    const duplicateAbbreviations = [];
    const duplicateNames = [];

    for (let exponent = windowSpec.startExponent; exponent <= windowSpec.endExponent; exponent += windowSpec.step) {
        const abbreviation = formatter.getAbbreviationFromExponent(exponent);
        const fullName = formatter.getFullNameFromExponent(exponent);

        if (seenAbbreviations.has(abbreviation)) {
            duplicateAbbreviations.push({ abbreviation, firstExponent: seenAbbreviations.get(abbreviation), secondExponent: exponent });
        } else {
            seenAbbreviations.set(abbreviation, exponent);
        }

        if (seenNames.has(fullName)) {
            duplicateNames.push({ fullName, firstExponent: seenNames.get(fullName), secondExponent: exponent });
        } else {
            seenNames.set(fullName, exponent);
        }
    }

    const result = {
        id: windowSpec.id,
        startExponent: windowSpec.startExponent,
        endExponent: windowSpec.endExponent,
        duplicateAbbreviations,
        duplicateNames,
        passed: duplicateAbbreviations.length === 0 && duplicateNames.length === 0
    };

    if (!result.passed) {
        failed += 1;
        if (duplicateAbbreviations.length > 0) {
            failures.push({ id: windowSpec.id, field: 'boundaryAbbreviations', duplicates: duplicateAbbreviations });
            log(`  FAIL: ${windowSpec.id} has duplicate abbreviations`);
        }
        if (duplicateNames.length > 0) {
            failures.push({ id: windowSpec.id, field: 'boundaryNames', duplicates: duplicateNames });
            log(`  FAIL: ${windowSpec.id} has duplicate readable names`);
        }
    } else {
        passed += 1;
    }

    windowResults.push(result);
}

function printSampleRanges() {
    section('Sample range snapshots');

    for (const range of fixtures.sampleRanges) {
        log(`  ${range.id} (${range.startExponent}..${range.endExponent} step ${range.step})`);

        for (let exponent = range.startExponent; exponent <= range.endExponent; exponent += range.step) {
            const abbreviation = formatter.getAbbreviationFromExponent(exponent);
            const fullName = formatter.getFullNameFromExponent(exponent);
            log(`    10^${String(exponent).padStart(8)}  abbrev=${abbreviation.padEnd(12)} readable=${fullName}`);
        }
    }
}

function main() {
    section('Fixture cases');
    fixtures.cases.forEach(evaluateCase);

    section('Boundary window uniqueness');
    fixtures.boundaryWindows.forEach(evaluateBoundaryWindow);

    if (!jsonMode) {
        printSampleRanges();
        section('Summary');
        log(`  Passed: ${passed}`);
        log(`  Failed: ${failed}`);
    }

    if (jsonMode) {
        process.stdout.write(JSON.stringify({
            passed,
            failed,
            caseResults,
            windowResults,
            failures
        }));
    }

    process.exit(failed > 0 ? 1 : 0);
}

main();
