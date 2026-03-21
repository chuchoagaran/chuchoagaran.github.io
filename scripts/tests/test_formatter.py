"""Fixture-driven Python parity helper for the formatter runtime."""

from __future__ import annotations

import json
import math
import sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
FIXTURE_PATH = REPO_ROOT / "scripts" / "tests" / "formatter_vectors.json"

BASICS = [
    "", "Thousand", "Million", "Billion", "Trillion", "Quadrillion",
    "Quintillion", "Sextillion", "Septillion", "Octillion", "Nonillion",
]

SHORT_SUFFIXES = ["K", "M", "B"]
FIRST_ONES = ["", "U", "D", "T", "Qd", "Qn", "Sx", "Sp", "Oc", "No"]
SECOND_ONES = ["", "De", "Vt", "Tg", "qg", "Qg", "sg", "Sg", "Og", "Ng"]
THIRD_ONES = ["", "Ce", "Du", "Tr", "Qa", "Qi", "Se", "Si", "Ot", "Ni"]

UNITS = ["", "Un", "Duo", "Tre", "Quattuor", "Quin", "Sex", "Septen", "Octo", "Novem"]
TENS = ["", "Deci", "Viginti", "Triginta", "Quadraginta", "Quinquaginta", "Sexaginta", "Septuaginta", "Octoginta", "Nonaginta"]
HUNDREDS = ["", "Centi", "Ducenti", "Trecenti", "Quadringenti", "Quingenti", "Sescenti", "Septingenti", "Octingenti", "Nongenti"]

TIER2 = [
    "", "Mi", "Mc", "Na", "Pi", "Fm", "At", "Zp", "Yc", "Xo", "Ve", "Me",
    "Due", "Tre", "Te", "Pt", "He", "Hp", "Oct", "En", "Ic", "Mei",
    "Dui", "Tri", "Teti", "Pti", "Hei", "Hp", "Oci", "Eni", "Tra", "TeC",
    "MTc", "DTc", "TrTc", "TeTc", "PeTc", "HTc", "HpT", "OcT", "EnT", "TetC",
    "MTetc", "DTetc", "TrTetc", "TeTetc", "PeTetc", "HTetc", "HpTetc", "OcTetc", "EnTetc", "PcT",
    "MPcT", "DPcT", "TPCt", "TePCt", "PePCt", "HePCt", "HpPct", "OcPct", "EnPct", "HCt",
    "MHcT", "DHcT", "THCt", "TeHCt", "PeHCt", "HeHCt", "HpHct", "OcHct", "EnHct", "HpCt",
    "MHpcT", "DHpcT", "THpCt", "TeHpCt", "PeHpCt", "HeHpCt", "HpHpct", "OcHpct", "EnHpct",
    "OCt", "MOcT", "DOcT", "TOCt", "TeOCt", "PeOCt", "HeOCt", "HpOct", "OcOct", "EnOct", "Ent", "MEnT",
    "DEnT", "TEnt", "TeEnt", "PeEnt", "HeEnt", "HpEnt", "OcEnt", "EnEnt", "Hect", "MeHect",
]

MILLI_ONES = ["", "un", "du", "tri", "quadri", "quin", "sex", "septi", "octi", "noni"]


def get_tier1_name(index: int) -> str:
    if index <= 10:
        return BASICS[index] if index < len(BASICS) else "Decillion"

    number = index - 1
    units = number % 10
    tens = (number // 10) % 10
    hundreds = (number // 100) % 10

    name = UNITS[units] + TENS[tens] + HUNDREDS[hundreds]
    name = name.replace("ii", "i").replace("aa", "a").replace("oo", "o").replace("ao", "o")

    if name and name[-1].lower() in "aeiou":
        name = name[:-1]

    return name + "illion"


def get_milli_prefix(t2_index: int) -> str:
    if t2_index <= 0:
        return ""
    if t2_index == 1:
        return "milli"
    if t2_index < 10:
        return MILLI_ONES[t2_index] + "milli"

    ones = t2_index % 10
    tens = (t2_index // 10) % 10
    hundreds = (t2_index // 100) % 10

    prefix = MILLI_ONES[ones] + TENS[tens].lower() + HUNDREDS[hundreds].lower()
    prefix = prefix.replace("ii", "i").replace("aa", "a")
    return prefix + "milli"


def get_full_name_from_exponent(exponent: int) -> str:
    if exponent < 3:
        return "Under a Thousand"

    suffix_index = exponent // 3 - 1
    if suffix_index < 0:
        return "Under a Thousand"
    if suffix_index < 1000:
        return get_tier1_name(suffix_index + 1)

    t1_index = suffix_index % 1000
    t2_index = suffix_index // 1000
    prefix = get_milli_prefix(t2_index)

    if t1_index == 0:
        suffix = "llion"
    else:
        suffix = get_tier1_name(t1_index + 1).lower()

    name = prefix + suffix
    return name[:1].upper() + name[1:]


def normalize_display_value(mantissa: float, exponent: int) -> tuple[float, int]:
    adjusted_exponent = exponent
    display_mantissa = mantissa * (10 ** (adjusted_exponent % 3))

    while abs(display_mantissa) >= 1000:
        display_mantissa /= 1000
        adjusted_exponent += 3

    return display_mantissa, adjusted_exponent


def round_like_js(value: float) -> float | int:
    rounded = round(value * 1000) / 1000
    if isinstance(rounded, float) and rounded.is_integer():
        return int(rounded)
    return rounded


def build_readable_text(mantissa: float, exponent: int) -> str:
    display_mantissa, adjusted_exponent = normalize_display_value(mantissa, exponent)
    display_value = round_like_js(display_mantissa)

    if adjusted_exponent < 3:
        return f"{display_value} (under a thousand)"

    return f"{display_value} {get_full_name_from_exponent(adjusted_exponent)}"


def get_small_suffix_chunk(index: int) -> str:
    hundreds = index // 100
    tens = (index % 100) // 10
    ones = index % 10
    return f"{FIRST_ONES[ones]}{SECOND_ONES[tens]}{THIRD_ONES[hundreds]}"


def get_large_suffix_chunk(index: int) -> str:
    adjusted = index
    if adjusted > 0:
        adjusted += 1
    if adjusted > 1000:
        adjusted %= 1000
    return get_small_suffix_chunk(adjusted)


def get_lua_style_abbreviation(exponent: int) -> str:
    if exponent < 3:
        return ""

    suffix_index = exponent // 3 - 1
    if suffix_index < 0:
        return ""
    if suffix_index < len(SHORT_SUFFIXES):
        return SHORT_SUFFIXES[suffix_index]
    if suffix_index < 1000:
        return get_small_suffix_chunk(suffix_index)

    original_index = suffix_index
    output = ""
    max_group = int(math.log10(suffix_index) / 3)

    for group_index in range(max_group, -1, -1):
        group_divisor = 10 ** (group_index * 3)
        if suffix_index >= group_divisor:
            if group_index == 0:
                output += get_small_suffix_chunk(suffix_index)
                suffix_index = 0
            else:
                part = suffix_index // group_divisor - 1
                output += get_large_suffix_chunk(part)
                output += TIER2[group_index] if group_index < len(TIER2) else f"T{group_index}"
                suffix_index %= group_divisor

    return output or f"T{original_index}"


def get_abbreviation_from_exponent(exponent: int) -> str:
    return get_lua_style_abbreviation(exponent)


def build_abbreviation_text(mantissa: float, exponent: int) -> str:
    display_mantissa, adjusted_exponent = normalize_display_value(mantissa, exponent)
    display_value = round_like_js(display_mantissa)
    suffix = get_abbreviation_from_exponent(adjusted_exponent)

    if not suffix:
        return f"{display_value}"

    return f"{display_value} {suffix}"


def load_fixtures() -> dict:
    return json.loads(FIXTURE_PATH.read_text(encoding="utf-8"))


def evaluate_case(test_case: dict) -> list[str]:
    mismatches = []

    actual_values = {
        "expectedFullName": get_full_name_from_exponent(test_case["exponent"]),
        "expectedAbbreviation": get_abbreviation_from_exponent(test_case["exponent"]),
        "expectedReadableText": build_readable_text(test_case["mantissa"], test_case["exponent"]),
        "expectedAbbreviationText": build_abbreviation_text(test_case["mantissa"], test_case["exponent"]),
    }

    for expected_field, actual_value in actual_values.items():
        expected_value = test_case[expected_field]
        if actual_value != expected_value:
            mismatches.append(
                f"{test_case['id']} {expected_field}: expected {expected_value!r}, got {actual_value!r}"
            )

    return mismatches


def run_tests() -> int:
    fixtures = load_fixtures()
    failures: list[str] = []

    for test_case in fixtures["cases"]:
        failures.extend(evaluate_case(test_case))

    if failures:
        print("PYTHON FIXTURE FAILURES")
        for failure in failures:
            print(f"- {failure}")
        return 1

    print(f"PYTHON FIXTURES OK ({len(fixtures['cases'])} cases)")
    return 0


if __name__ == "__main__":
    sys.exit(run_tests())
