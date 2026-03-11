class InfiniteNumberFormatter {
    constructor() {
        // Base numbers (Index 1 = 10^3, Index 2 = 10^6)
        this.basics = [
            "", "Thousand", "Million", "Billion", "Trillion", "Quadrillion",
            "Quintillion", "Sextillion", "Septillion", "Octillion", "Nonillion"
        ];

        this.shortSuffixes = ["K", "M", "B"];
        this.firstOnes = ["", "U", "D", "T", "Qd", "Qn", "Sx", "Sp", "Oc", "No"];
        this.secondOnes = ["", "De", "Vt", "Tg", "qg", "Qg", "sg", "Sg", "Og", "Ng"];
        this.thirdOnes = ["", "Ce", "Du", "Tr", "Qa", "Qi", "Se", "Si", "Ot", "Ni"];

        // Tier 1: The standard Conway-Guy system (up to index 999)
        this.units = ["", "Un", "Duo", "Tre", "Quattuor", "Quin", "Sex", "Septen", "Octo", "Novem"];
        this.tens = ["", "Deci", "Viginti", "Triginta", "Quadraginta", "Quinquaginta", "Sexaginta", "Septuaginta", "Octoginta", "Nonaginta"];
        this.hundreds = ["", "Centi", "Ducenti", "Trecenti", "Quadringenti", "Quingenti", "Sescenti", "Septingenti", "Octingenti", "Nongenti"];

        // Tier 2+: prefixes inspired by ETERNITYNUM.LUA MultOnes table
        this.tier2 = [
            "", "Mi", "Mc", "Na", "Pi", "Fm", "At", "Zp", "Yc", "Xo", "Ve", "Me",
            "Due", "Tre", "Te", "Pt", "He", "Hp", "Oct", "En", "Ic", "Mei",
            "Dui", "Tri", "Teti", "Pti", "Hei", "Hp", "Oci", "Eni", "Tra", "TeC",
            "MTc", "DTc", "TrTc", "TeTc", "PeTc", "HTc", "HpT", "OcT", "EnT", "TetC",
            "MTetc", "DTetc", "TrTetc", "TeTetc", "PeTetc", "HTetc", "HpTetc", "OcTetc", "EnTetc", "PcT",
            "MPcT", "DPcT", "TPCt", "TePCt", "PePCt", "HePCt", "HpPct", "OcPct", "EnPct", "HCt",
            "MHcT", "DHcT", "THCt", "TeHCt", "PeHCt", "HeHCt", "HpHct", "OcHct", "EnHct", "HpCt",
            "MHpcT", "DHpcT", "THpCt", "TeHpCt", "PeHpCt", "HeHpCt", "HpHpct", "OcHpct", "EnHpct",
            "OCt", "MOcT", "DOcT", "TOCt", "TeOCt", "PeOCt", "HeOCt", "HpOct", "OcOct", "EnOct", "Ent", "MEnT",
            "DEnT", "TEnt", "TeEnt", "PeEnt", "HeEnt", "HpEnt", "OcEnt", "EnEnt", "Hect", "MeHect"
        ];

        // Latin ones-place prefixes for building milli-tier compound names
        // e.g. index 2 → "du" + "milli" = "dumilli" → "Dumillillion"
        this.milliOnes = ["", "un", "du", "tri", "quadri", "quin", "sex", "septi", "octi", "noni"];
    }

    // Handles the core 10 to 999 combinations
    getTier1Name(index) {
        if (index <= 10) return this.basics[index] || "Decillion";

        let n = index - 1;
        let u = n % 10;
        let t = Math.floor(n / 10) % 10;
        let h = Math.floor(n / 100) % 10;

        // Slap them together: Units + Tens + Hundreds
        let name = this.units[u] + this.tens[t] + this.hundreds[h];

        // Clean up double vowels for proper spelling
        name = name.replace(/ii/g, "i").replace(/aa/g, "a").replace(/oo/g, "o").replace(/ao/g, "o");

        // Strip trailing vowel before adding "llion"
        if (name.match(/[aeiou]$/i)) {
            name = name.slice(0, -1);
        }

        return name + "illion";
    }

    // Builds the Latin prefix for a tier-2 index (e.g. 2 → "dumilli", 41 → "unquadragintamilli")
    getMilliPrefix(t2Index) {
        if (t2Index <= 0) return "";
        if (t2Index === 1) return "milli";
        if (t2Index < 10) return this.milliOnes[t2Index] + "milli";

        // Compose ones+tens+hundreds for t2Index >= 10
        let o = t2Index % 10;
        let t = Math.floor(t2Index / 10) % 10;
        let h = Math.floor(t2Index / 100) % 10;

        let prefix = this.milliOnes[o]
            + this.tens[t].toLowerCase()
            + this.hundreds[h].toLowerCase();

        // Clean up double vowels
        prefix = prefix.replace(/ii/g, "i").replace(/aa/g, "a");

        return prefix + "milli";
    }

    // Handles going "Infinite" by combining Tier 2 with Tier 1
    getFullNameFromExponent(exponent) {
        if (exponent < 3) return "Under a Thousand";

        // suffixIndex = group - 1
        // e.g. 10^3 → 0 (Thousand), 10^6 → 1 (Million), 10^3003 → 1000 (Millillion)
        let suffixIndex = Math.floor(exponent / 3) - 1;

        if (suffixIndex < 0) return "Under a Thousand";

        // Under 1000: standard tier-1 names
        if (suffixIndex < 1000) return this.getTier1Name(suffixIndex + 1);

        // 1000 or over: split into tier-2 prefix + tier-1 suffix
        let t1Index = suffixIndex % 1000;
        let t2Index = Math.floor(suffixIndex / 1000);

        const prefix = this.getMilliPrefix(t2Index);

        // t1Index 0 → pure tier2 word: "milli"+"llion" = "millillion"
        // t1Index 1+ → tier2 + tier1 name: "milli"+"million" = "millimillion"
        let suffix;
        if (t1Index === 0) {
            suffix = "llion";
        } else {
            suffix = this.getTier1Name(t1Index + 1).toLowerCase();
        }

        const name = prefix + suffix;
        return name.charAt(0).toUpperCase() + name.slice(1);
    }

    normalizeDisplayValue(mantissa, exponent) {
        let adjustedExponent = exponent;
        let displayMantissa = mantissa * (10 ** (adjustedExponent % 3));

        // Keep display mantissa in [1, 1000) by carrying powers of 1000 into exponent.
        while (Math.abs(displayMantissa) >= 1000) {
            displayMantissa /= 1000;
            adjustedExponent += 3;
        }

        return { displayMantissa, exponent: adjustedExponent };
    }

    buildReadableText(mantissa, exponent) {
        const normalized = this.normalizeDisplayValue(mantissa, exponent);
        let displayMantissa = normalized.displayMantissa;
        displayMantissa = Math.round(displayMantissa * 1000) / 1000; // avoid floating point issues

        if (normalized.exponent < 3) {
            return `${displayMantissa} (under a thousand)`;
        }

        const name = this.getFullNameFromExponent(normalized.exponent);
        return `${displayMantissa} ${name}`;
    }

    getSmallSuffixChunk(index) {
        const hundreds = Math.floor(index / 100);
        const tens = Math.floor((index % 100) / 10);
        const ones = index % 10;

        return `${this.firstOnes[ones]}${this.secondOnes[tens]}${this.thirdOnes[hundreds]}`;
    }

    getLargeSuffixChunk(index) {
        let adjusted = index;
        if (adjusted > 0) {
            adjusted += 1;
        }
        if (adjusted > 1000) {
            adjusted %= 1000;
        }
        return this.getSmallSuffixChunk(adjusted);
    }

    getLuaStyleAbbreviationSuffix(exponent) {
        if (exponent < 3) {
            return "";
        }

        let suffixIndex = Math.floor(exponent / 3) - 1;

        if (suffixIndex < 0) {
            return "";
        }

        if (suffixIndex < this.shortSuffixes.length) {
            return this.shortSuffixes[suffixIndex];
        }

        if (suffixIndex < 1000) {
            return this.getSmallSuffixChunk(suffixIndex);
        }

        const originalIndex = suffixIndex;
        let out = "";
        const maxGroup = Math.floor(Math.log10(suffixIndex) / 3);

        for (let i = maxGroup; i >= 0; i--) {
            const groupDivisor = 10 ** (i * 3);

            if (suffixIndex >= groupDivisor) {
                if (i === 0) {
                    // Lowest group: use direct suffix to avoid SuffixPartTwo(0) → empty ambiguity
                    out += this.getSmallSuffixChunk(suffixIndex);
                    suffixIndex = 0;
                } else {
                    const part = Math.floor(suffixIndex / groupDivisor) - 1;
                    out += this.getLargeSuffixChunk(part);
                    const tier2Token = this.tier2[i];
                    out += tier2Token !== undefined ? tier2Token : `T${i}`;
                    suffixIndex %= groupDivisor;
                }
            }
        }

        return out || `T${originalIndex}`;
    }

    getAbbreviationFromExponent(exponent) {
        return this.getLuaStyleAbbreviationSuffix(exponent);
    }

    buildAbbreviationText(mantissa, exponent) {
        const normalized = this.normalizeDisplayValue(mantissa, exponent);
        let displayMantissa = normalized.displayMantissa;
        displayMantissa = Math.round(displayMantissa * 1000) / 1000; // avoid floating point issues

        const suffix = this.getAbbreviationFromExponent(normalized.exponent);

        if (!suffix) {
            return `${displayMantissa}`;
        }

        return `${displayMantissa} ${suffix}`;
    }

    parseNotationInput(rawInput) {
        const input = rawInput.trim();

        if (!input) {
            return { ok: false, error: "Please enter a value." };
        }

        const scientificMatch = input.match(/^([+-]?\d*\.?\d+)\s*[eE]\s*([+-]?\d+)$/);
        if (scientificMatch) {
            const mantissa = Number(scientificMatch[1]);
            const exponent = Number(scientificMatch[2]);

            if (!Number.isFinite(mantissa) || !Number.isInteger(exponent)) {
                return { ok: false, error: "Invalid scientific notation." };
            }

            return {
                ok: true,
                mantissa,
                exponent,
                normalized: `${mantissa}e${exponent}`
            };
        }

        const suffixMatch = input.match(/^([+-]?\d*\.?\d+)\s*([a-zA-Z]{1,3})$/);
        if (suffixMatch) {
            const mantissa = Number(suffixMatch[1]);
            const suffixInput = suffixMatch[2].toLowerCase();

            if (!Number.isFinite(mantissa)) {
                return { ok: false, error: "Invalid number before suffix." };
            }

            const suffixTable = {
                k: { group: 1, label: "K" },
                m: { group: 2, label: "M" },
                b: { group: 3, label: "B" },
                t: { group: 4, label: "T" },
                qa: { group: 5, label: "Qa" },
                qt: { group: 6, label: "Qt" },
                qn: { group: 6, label: "Qn" },
                sx: { group: 7, label: "Sx" },
                sp: { group: 8, label: "Sp" },
                oc: { group: 9, label: "Oc" },
                no: { group: 10, label: "No" },
                dc: { group: 11, label: "Dc" }
            };

            const suffixInfo = suffixTable[suffixInput];
            if (!suffixInfo) {
                return {
                    ok: false,
                    error: "Unsupported suffix. Try K, M, B, T, Qa, Qn, Sx, Sp, Oc, No, Dc."
                };
            }

            const mantissaExponent = mantissa === 0 ? 0 : Math.floor(Math.log10(Math.abs(mantissa)));
            const exponent = suffixInfo.group * 3 + mantissaExponent;

            return {
                ok: true,
                mantissa,
                exponent,
                normalized: `${mantissa}${suffixInfo.label}`
            };
        }

        return {
            ok: false,
            error: "Unsupported format. Examples: 1e1920, 388Qn, 1Qa"
        };
    }

    convertInput(rawInput) {
        const parsed = this.parseNotationInput(rawInput);

        if (!parsed.ok) {
            return parsed;
        }

        return {
            ok: true,
            normalized: parsed.normalized,
            exponent: parsed.exponent,
            fullText: this.buildReadableText(parsed.mantissa, parsed.exponent),
            abbreviation: this.buildAbbreviationText(parsed.mantissa, parsed.exponent)
        };
    }

    // Helper for testing
    test(exponent) {
        let name = this.getFullNameFromExponent(exponent);
        console.log(`10^${exponent} = ONE ${name}`);
    }
}

const formatter = new InfiniteNumberFormatter();

function setupMiniReader() {
    const form = document.getElementById("reader-form");
    const input = document.getElementById("notation-input");
    const output = document.getElementById("reader-output");

    if (!form || !input || !output) {
        return;
    }

    const renderResult = (result) => {
        if (!result.ok) {
            output.textContent = `Error: ${result.error}`;
            return;
        }

        output.textContent = [
            `Input: ${result.normalized}`,
            `Exponent (base 10): ${result.exponent}`,
            `Readable: ${result.fullText}`,
            `Abbviration: ${result.abbreviation}`
        ].join("\n");
    };

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const value = input.value.trim();
        renderResult(formatter.convertInput(value));
    });
}

document.addEventListener("DOMContentLoaded", setupMiniReader);