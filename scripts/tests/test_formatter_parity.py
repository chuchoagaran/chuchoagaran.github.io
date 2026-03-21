"""Cross-language parity runner for the formatter test harness."""

from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

import test_formatter as py_formatter


REPO_ROOT = Path(__file__).resolve().parents[2]
FIXTURE_PATH = REPO_ROOT / "scripts" / "tests" / "formatter_vectors.json"

NODE_SAMPLE_SCRIPT = r"""
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repoRoot = process.cwd();
const scriptPath = path.join(repoRoot, 'templates', 'js', 'scripts.js');
const exponents = JSON.parse(process.env.FORMATTER_SAMPLE_EXPONENTS || '[]');

let source = fs.readFileSync(scriptPath, 'utf8');
source = source.replace(/^const formatter = new InfiniteNumberFormatter\(\);[\s\S]*$/m, '');
vm.runInThisContext(source);

const formatter = new InfiniteNumberFormatter();
const results = exponents.map((exponent) => ({
  exponent,
  fullName: formatter.getFullNameFromExponent(exponent),
  abbreviation: formatter.getAbbreviationFromExponent(exponent)
}));

process.stdout.write(JSON.stringify(results));
"""


def load_fixtures() -> dict:
    return json.loads(FIXTURE_PATH.read_text(encoding="utf-8"))


def run_node_case_harness() -> dict:
    completed = subprocess.run(
        ["node", "scripts/references/test_formatter.js", "--json"],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
        check=False,
    )

    if completed.returncode != 0:
        print("JS HARNESS FAILED")
        if completed.stdout.strip():
            print(completed.stdout.strip())
        if completed.stderr.strip():
            print(completed.stderr.strip())
        raise SystemExit(1)

    try:
        return json.loads(completed.stdout)
    except json.JSONDecodeError as error:
        print(f"Could not parse JS harness JSON: {error}")
        if completed.stdout.strip():
            print(completed.stdout.strip())
        raise SystemExit(1)


def run_node_sample_snapshot(exponents: list[int]) -> dict[int, dict[str, str]]:
    env = os.environ.copy()
    env["FORMATTER_SAMPLE_EXPONENTS"] = json.dumps(exponents)

    completed = subprocess.run(
        ["node", "-e", NODE_SAMPLE_SCRIPT],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
        check=False,
        env=env,
    )

    if completed.returncode != 0:
        print("JS SAMPLE SNAPSHOT FAILED")
        if completed.stdout.strip():
            print(completed.stdout.strip())
        if completed.stderr.strip():
            print(completed.stderr.strip())
        raise SystemExit(1)

    try:
        parsed = json.loads(completed.stdout)
    except json.JSONDecodeError as error:
        print(f"Could not parse JS sample JSON: {error}")
        if completed.stdout.strip():
            print(completed.stdout.strip())
        raise SystemExit(1)

    return {entry["exponent"]: entry for entry in parsed}


def compare_fixture_cases(fixtures: dict, js_results: dict) -> list[str]:
    mismatches: list[str] = []
    js_cases = {entry["id"]: entry for entry in js_results["caseResults"]}

    for test_case in fixtures["cases"]:
        js_case = js_cases.get(test_case["id"])
        if js_case is None:
            mismatches.append(f"Missing JS case result for {test_case['id']}")
            continue

        python_values = {
            "fullName": py_formatter.get_full_name_from_exponent(test_case["exponent"]),
            "abbreviation": py_formatter.get_abbreviation_from_exponent(test_case["exponent"]),
            "readableText": py_formatter.build_readable_text(test_case["mantissa"], test_case["exponent"]),
            "abbreviationText": py_formatter.build_abbreviation_text(test_case["mantissa"], test_case["exponent"]),
        }

        for field, python_value in python_values.items():
            js_value = js_case[field]
            if python_value != js_value:
                mismatches.append(
                    f"fixture {test_case['id']} exponent {test_case['exponent']} field {field}: JS={js_value!r} Python={python_value!r}"
                )

    return mismatches


def collect_sample_exponents(fixtures: dict) -> list[int]:
    exponents: list[int] = []
    for sample_range in fixtures["sampleRanges"]:
        current = sample_range["startExponent"]
        while current <= sample_range["endExponent"]:
            exponents.append(current)
            current += sample_range["step"]
    return exponents


def compare_sample_ranges(fixtures: dict) -> list[str]:
    mismatches: list[str] = []
    sample_exponents = collect_sample_exponents(fixtures)
    js_samples = run_node_sample_snapshot(sample_exponents)

    for exponent in sample_exponents:
        js_result = js_samples[exponent]
        python_full_name = py_formatter.get_full_name_from_exponent(exponent)
        python_abbreviation = py_formatter.get_abbreviation_from_exponent(exponent)

        if python_full_name != js_result["fullName"]:
            mismatches.append(
                f"sample exponent {exponent} fullName: JS={js_result['fullName']!r} Python={python_full_name!r}"
            )

        if python_abbreviation != js_result["abbreviation"]:
            mismatches.append(
                f"sample exponent {exponent} abbreviation: JS={js_result['abbreviation']!r} Python={python_abbreviation!r}"
            )

    return mismatches


def main() -> int:
    fixtures = load_fixtures()
    js_results = run_node_case_harness()
    mismatches = compare_fixture_cases(fixtures, js_results)
    mismatches.extend(compare_sample_ranges(fixtures))

    if mismatches:
        print("PARITY FAIL")
        for mismatch in mismatches:
            print(f"- {mismatch}")
        return 1

    print("PARITY OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())