"""
test_formatter.py
=================
Python port of templates/js/scripts.js — tests readable names and abbreviations
across a large range of exponents and reports every kind of desync / error.

Run from repo root:
    python scripts/test_formatter.py
"""

import math
import re

# ---------------------------------------------------------------------------
# Data tables (mirrors scripts.js exactly)
# ---------------------------------------------------------------------------

BASICS = [
    "", "Thousand", "Million", "Billion", "Trillion", "Quadrillion",
    "Quintillion", "Sextillion", "Septillion", "Octillion", "Nonillion",
]

SHORT_SUFFIXES = ["K", "M", "B"]

FIRST_ONES  = ["", "U",  "D",   "T",  "Qd",  "Qn",  "Sx",  "Sp",  "Oc",  "No"]
SECOND_ONES = ["", "De", "Vt",  "Tg", "qg",  "Qg",  "sg",  "Sg",  "Og",  "Ng"]
THIRD_ONES  = ["", "Ce", "Du",  "Tr", "Qa",  "Qi",  "Se",  "Si",  "Ot",  "Ni"]

UNITS    = ["", "Un",       "Duo",    "Tre",       "Quattuor", "Quin",
            "Sex",  "Septen",  "Octo",  "Novem"]
TENS     = ["", "Deci",     "Viginti","Triginta",  "Quadraginta","Quinquaginta",
            "Sexaginta","Septuaginta","Octoginta","Nonaginta"]
HUNDREDS = ["", "Centi",    "Ducenti","Trecenti",  "Quadringenti","Quingenti",
            "Sescenti","Septingenti","Octingenti","Nongenti"]

TIER2 = [
    "", "Mi", "Mc", "Na", "Pi", "Fm", "At", "Zp", "Yc", "Xo", "Ve", "Me",
    "Due", "Tre", "Te", "Pt", "He", "Hp", "Oct", "En", "Ic", "Mei",
    "Dui", "Tri", "Teti", "Pti", "Hei", "Hp", "Oci", "Eni", "Tra", "TeC",
    "MTc", "DTc", "TrTc", "TeTc", "PeTc", "HTc", "HpT", "OcT", "EnT", "TetC",
    "MTetc", "DTetc", "TrTetc", "TeTetc", "PeTetc", "HTetc", "HpTetc", "OcTetc", "EnTetc", "PcT",
    "MPcT", "DPcT", "TPCt", "TePCt", "PePCt", "HePCt", "HpPct", "OcPct", "EnPct", "HCt",
    "MHcT", "DHcT", "THCt", "TeHCt", "PeHCt", "HeHCt", "HpHct", "OcHct", "EnHct", "HpCt",
    "MHpcT", "DHpcT", "THpCt", "TeHpCt", "PeHpCt", "HeHpCt", "HpHpct", "OcHpct", "EnHpct",
    "OCt", "MOcT", "DOcT", "TOCt", "TeOCt", "PeOCt", "HeOCt", "HpOct", "OcOct", "EnOct",
    "Ent", "MEnT", "DEnT", "TEnt", "TeEnt", "PeEnt", "HeEnt", "HpEnt", "OcEnt", "EnEnt",
    "Hect", "MeHect",
]

# ---------------------------------------------------------------------------
# Readable name
# ---------------------------------------------------------------------------

def get_tier1_name(index: int) -> str:
    if index <= 10:
        return BASICS[index] if index < len(BASICS) else "Decillion"
    u = index % 10
    t = (index // 10) % 10
    h = (index // 100) % 10
    name = UNITS[u] + TENS[t] + HUNDREDS[h]
    name = (name.replace("ii", "i").replace("aa", "a")
                .replace("oo", "o").replace("ao", "o"))
    if name and name[-1].lower() in "aeiou":
        name = name[:-1]
    return name + "illion"


def get_full_name_from_exponent(exponent: int) -> str:
    if exponent < 3:
        return "Under a Thousand"
    index = exponent // 3
    if index < 1000:
        return get_tier1_name(index)
    t1_index = index % 1000
    t2_index = index // 1000
    t2_prefix = TIER2[t2_index] if t2_index < len(TIER2) else f"Tier{t2_index}"
    # t1_index 0 → pure tier2 word (e.g. Millillion)
    # t1_index 1 → tier2 + million
    # t1_index 2+ → full Conway-Guy name
    if t1_index == 0:
        t1_suffix = "illion"
    elif t1_index == 1:
        t1_suffix = "million"
    else:
        t1_suffix = get_tier1_name(t1_index).lower()
    if not t2_prefix:
        return t1_suffix
    return f"{t2_prefix}-{t1_suffix}"


def build_readable(mantissa, exponent: int) -> str:
    if exponent < 3:
        return f"{mantissa} (under a thousand)"
    return f"{mantissa} {get_full_name_from_exponent(exponent)}"

# ---------------------------------------------------------------------------
# Abbreviation (Lua-style suffix)
# ---------------------------------------------------------------------------

def get_small_suffix_chunk(index: int) -> str:
    hundreds = index // 100
    tens     = (index % 100) // 10
    ones     = index % 10
    return FIRST_ONES[ones] + SECOND_ONES[tens] + THIRD_ONES[hundreds]


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
    si              = suffix_index
    out             = ""
    max_group       = int(math.log10(si)) // 3

    for i in range(max_group, -1, -1):
        group_divisor = 10 ** (i * 3)
        if si >= group_divisor:
            part = si // group_divisor - 1
            out += get_large_suffix_chunk(part)
            out += TIER2[i] if i < len(TIER2) else f"T{i}"
            si  %= group_divisor

    return out if out else f"T{original_index}"


def build_abbreviation(mantissa, exponent: int) -> str:
    suffix = get_lua_style_abbreviation(exponent)
    return f"{mantissa}" if not suffix else f"{mantissa} {suffix}"

# ---------------------------------------------------------------------------
# Test runner
# ---------------------------------------------------------------------------

def diagnose_abbreviation(suffix: str, exponent: int) -> list[str]:
    issues = []
    if re.search(r"T\d+", suffix):
        issues.append("FALLBACK: numeric tier in abbreviation")
    if re.search(r"-\d+", suffix):
        issues.append("FALLBACK: raw numeric index in abbreviation")
    # Empty abbreviation is expected for exponents < 3 (under 1000)
    if suffix == "" and exponent >= 3:
        issues.append("EMPTY: abbreviation is blank for exponent >= 3")
    return issues


def run_tests():
    # Build a broad set of exponents to probe
    test_exponents = list(range(1, 100))                     # every step 1-99
    test_exponents += list(range(100, 1000, 3))              # multiples of 3 up to 999
    test_exponents += list(range(1000, 10_000, 30))          # hundreds of points 1k-10k
    test_exponents += list(range(10_000, 100_000, 300))      # 10k-100k sparse
    test_exponents += list(range(100_000, 1_000_000, 3000))  # 100k-1M very sparse
    test_exponents = sorted(set(test_exponents))

    print(f"{'='*72}")
    print(f"  Infinite Number Formatter — test report ({len(test_exponents)} exponents)")
    print(f"{'='*72}\n")

    issues_found = []
    prev_readable  = None
    prev_abbr      = None

    for exp in test_exponents:
        readable  = build_readable(1, exp)
        abbr_full = build_abbreviation(1, exp)
        suffix    = get_lua_style_abbreviation(exp)

        row_issues = diagnose_abbreviation(suffix, exp)

        # Check consecutive desync (same name for adjacent exponents when they shouldn't be)
        if prev_readable is not None and readable == prev_readable and exp % 3 == 0:
            row_issues.append("DESYNC: readable unchanged from previous 3-step")
        if prev_abbr is not None and abbr_full == prev_abbr and exp % 3 == 0 and exp > 9:
            row_issues.append("DESYNC: abbreviation unchanged from previous 3-step")

        if row_issues:
            issues_found.append((exp, readable, abbr_full, row_issues))

        prev_readable = readable
        prev_abbr     = abbr_full

    # --- Detailed issue report ---
    if issues_found:
        print(f"  ISSUES ({len(issues_found)} found):\n")
        for exp, readable, abbr, row_issues in issues_found:
            print(f"  1e{exp}")
            print(f"    Readable    : {readable}")
            print(f"    Abbviration : {abbr}")
            for iss in row_issues:
                print(f"    !! {iss}")
            print()
    else:
        print("  No issues detected.\n")

    # --- Spot-check table (always printed) ---
    spot_check = [
        3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33,
        36, 66, 99, 102, 303, 306, 999, 1002, 1920, 1921,
        3003, 6003, 9000, 9003, 28456, 30000, 99999,
    ]
    print(f"{'='*72}")
    print(f"  SPOT-CHECK TABLE")
    print(f"  {'Exponent':<12} {'Readable':<48} Abbviration")
    print(f"  {'-'*12} {'-'*48} {'-'*20}")
    for exp in spot_check:
        readable = get_full_name_from_exponent(exp)
        abbr     = get_lua_style_abbreviation(exp)
        print(f"  1e{exp:<10} {readable:<48} {abbr}")

    print(f"\n{'='*72}")
    print(f"  Done.")


if __name__ == "__main__":
    run_tests()
