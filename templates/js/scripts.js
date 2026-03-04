class InfiniteNumberFormatter {
    constructor() {
        // Base numbers (Index 1 = 10^3, Index 2 = 10^6)
        this.basics = [
            "", "Thousand", "Million", "Billion", "Trillion", "Quadrillion",
            "Quintillion", "Sextillion", "Septillion", "Octillion", "Nonillion"
        ];

        // Tier 1: The standard Conway-Guy system (up to index 999)
        this.units = ["", "Un", "Duo", "Tre", "Quattuor", "Quin", "Sex", "Septen", "Octo", "Novem"];
        this.tens = ["", "Deci", "Viginti", "Triginta", "Quadraginta", "Quinquaginta", "Sexaginta", "Septuaginta", "Octoginta", "Nonaginta"];
        this.hundreds = ["", "Centi", "Ducenti", "Trecenti", "Quadringenti", "Quingenti", "Sescenti", "Septingenti", "Octingenti", "Nongenti"];

        // Tier 2: For indices 1000+ (Millions of groups)
        this.tier2 = ["", "Milli", "Micri", "Nanoni", "Picco", "Femto", "Atto", "Zepto"];
    }

    // Handles the core 10 to 999 combinations
    getTier1Name(index) {
        if (index <= 10) return this.basics[index] || "Decillion";

        let u = index % 10;
        let t = Math.floor(index / 10) % 10;
        let h = Math.floor(index / 100) % 10;

        // Slap them together: Units + Tens + Hundreds
        let name = this.units[u] + this.tens[t] + this.hundreds[h];

        // Clean up double vowels for proper spelling
        name = name.replace(/ii/g, "i").replace(/aa/g, "a").replace(/oo/g, "o").replace(/ao/g, "o");

        // Strip trailing vowel before adding "llion"
        if (name.match(/[aeiou]$/i)) {
            name = name.slice(0, -1);
        }

        return name + "llion";
    }

    // Handles going "Infinite" by combining Tier 2 with Tier 1
    getFullNameFromExponent(exponent) {
        if (exponent < 3) return "Under a Thousand";

        // Calculate the illion index (e.g., 10^6 -> 2 = Million)
        let index = Math.floor(exponent / 3);

        // If under 1000, just use Tier 1
        if (index < 1000) return this.getTier1Name(index);

        // If 1000 or over, bring in Tier 2
        let t1Index = index % 1000;
        let t2Index = Math.floor(index / 1000);

        let t2Prefix = this.tier2[t2Index] || `Tier${t2Index}-`;
        let t1Prefix = t1Index === 0 ? "llion" : this.getTier1Name(t1Index).toLowerCase();

        // Connect them smoothly
        return t2Prefix + (t1Index === 0 ? t1Prefix : "-" + t1Prefix);
    }

    buildReadableText(mantissa, exponent) {
        if (exponent < 3) {
            return `${mantissa} (under a thousand)`;
        }

        const name = this.getFullNameFromExponent(exponent);
        return `${mantissa} ${name}`;
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
            fullText: this.buildReadableText(parsed.mantissa, parsed.exponent)
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
            `Readable: ${result.fullText}`
        ].join("\n");
    };

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const value = input.value.trim();
        renderResult(formatter.convertInput(value));
    });
}

document.addEventListener("DOMContentLoaded", setupMiniReader);