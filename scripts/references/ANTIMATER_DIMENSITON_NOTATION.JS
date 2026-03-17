/**
 * Minified by jsDelivr using Terser v5.37.0.
 * Original file: /npm/@antimatter-dimensions/notations@3.2.0/dist/ad-notations.umd.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
// ============================================================
// AD NOTATIONS - Number Formatting Library (Reference Version)
// ============================================================

// ── GLOBAL CONFIG ────────────────────────────────────────────
const settings = {
    isInfinite: (num) => num >= MAX_VALUE,
    exponentCommas: {
        show: true,
        min: 100_000,   // below this: plain number
        max: 1_000_000_000  // above this: formatted as Decimal
    },
    exponentDefaultPlaces: 3
};


// ── COMMA FORMATTING ─────────────────────────────────────────
// "1234567" → "1,234,567"
function addCommasToChunk(chunk) { /* splits into groups of 3, joins with comma */ }
function addCommas(numStr) { /* applies addCommasToChunk to integer part */ }


// ── SUFFIX NAME GENERATION ───────────────────────────────────
// Generates names like K, M, B, T, Qa, ... Ce, Dc, ...
const simpleSuffixes = ["K", "M", "B", "T", "Qa", "Qt", "Sx", "Sp", "Oc", "No"];

const suffixParts = [
    ["", "U", "D", "T", "Qa", "Qt", "Sx", "Sp", "O", "N"],   // ones
    ["", "Dc", "Vg", "Tg", "Qd", "Qi", "Se", "St", "Og", "Nn"],  // tens
    ["", "Ce", "Dn", "Tc", "Qe", "Qu", "Sc", "Si", "Oe", "Ne"],  // hundreds
];

const magnitudePrefixes = ["", "MI-", "MC-", "NA-", "PC-", "FM-", "AT-", "ZP-"];

// Returns suffix string for tier `n` (1 = K, 2 = M, ...)
function getSuffix(n) {
    const index = n - 1;
    if (index === -1) return "";
    if (index < simpleSuffixes.length) return simpleSuffixes[index];

    // Build compound suffix from digits
    const digits = [];
    let remaining = index;
    while (remaining > 0) {
        digits.push(suffixParts[digits.length % 3][remaining % 10]);
        remaining = Math.floor(remaining / 10);
    }
    while (digits.length % 3 !== 0) digits.push("");

    let result = "";
    for (let i = digits.length / 3 - 1; i >= 0; i--) {
        result += digits.slice(3 * i, 3 * i + 3).join("") + magnitudePrefixes[i];
    }

    // Cleanup: collapse double separators, remove redundant U prefix, trim trailing dash
    return result
        .replace(/-[A-Z]{2}-/g, "-")
        .replace(/U([A-Z]{2}-)/g, "$1")
        .replace(/-$/, "");
}


// ── EXPONENT HELPERS ─────────────────────────────────────────
const isSmallExponent = (exp) => exp < settings.exponentCommas.min;
const shouldUseCommas = (exp) => settings.exponentCommas.show && exp < settings.exponentCommas.max;


// ── GENERIC EXPONENTIAL FORMATTER (factory) ──────────────────
// Returns a formatter function for a given base/step/separator
//
// formatMantissa : (value, decimalPlaces) → string
// formatExponent : (exp, places) → string
// base           : number base (usually 10)
// step           : exponent grouping size (1 = Scientific, 3 = Engineering)
// hideSmallMantissa : if true, hide mantissa when exponent is large
// separator      : character between mantissa and exponent (default "e")
// noNegativeExp  : if true, clamp exponent to minimum 0
//
function makeExponentialFormatter(
    formatMantissa,
    formatExponent,
    base,
    step,
    hideSmallMantissa,
    separator = "e",
    noNegativeExp = false
) {
    return function (value, decimalPlaces, exponentPlaces) {
        const groupSize = Math.pow(base, step);
        let exp = Math.floor(value.log(groupSize)) * step;
        if (noNegativeExp) exp = Math.max(exp, 0);

        let mantissa = value.div(Decimal.pow(base, exp)).toNumber();

        // Correct floating point drift
        if (!(1 <= mantissa && mantissa < groupSize)) {
            const correction = Math.floor(Math.log(mantissa) / Math.log(groupSize));
            mantissa /= Math.pow(groupSize, correction);
            exp += step * correction;
        }

        let mantissaStr = formatMantissa(mantissa, decimalPlaces);

        // If mantissa rounds up to groupSize, carry into exponent
        if (mantissaStr === formatMantissa(groupSize, decimalPlaces)) {
            mantissaStr = formatMantissa(1, decimalPlaces);
            exp += step;
        }

        if (exp === 0) return mantissaStr;

        const exponentStr = formatExponent(exp, exponentPlaces);

        // Optionally hide mantissa for very large exponents
        if (hideSmallMantissa && !isSmallExponent(exp) && !shouldUseCommas(exp)) {
            mantissaStr = "";
        }

        return `${mantissaStr}${separator}${exponentStr}`;
    };
}


// ── BASE NOTATION CLASS ──────────────────────────────────────
class BaseNotation {

    get infinite() { return "Infinite"; }
    get negativeInfinite() { return `-${this.infinite}`; }

    // Main entry point
    format(value, places = 0, smallPlaces = 0, exponentPlaces = places) {
        if (typeof value === "number" && !isFinite(value)) return this.infinite;

        const num = Decimal.fromValue(value);

        if (num.exponent < -300) {
            return num.sign() < 0
                ? `-${this.formatVerySmallDecimal(num.abs(), smallPlaces)}`
                : this.formatVerySmallDecimal(num, smallPlaces);
        }

        if (num.exponent < 3) {
            const n = num.toNumber();
            return n < 0
                ? `-${this.formatUnder1000(Math.abs(n), smallPlaces)}`
                : this.formatUnder1000(n, smallPlaces);
        }

        if (settings.isInfinite(num.abs())) {
            return num.sign() < 0 ? this.negativeInfinite : this.infinite;
        }

        return num.sign() < 0
            ? `-${this.formatDecimal(num.abs(), places, exponentPlaces)}`
            : this.formatDecimal(num, places, exponentPlaces);
    }

    formatVerySmallDecimal(num, places) { return this.formatUnder1000(num.toNumber(), places); }
    formatUnder1000(n, places) { return n.toFixed(places); }

    // Format the exponent part (with comma or decimal logic)
    formatExponent(
        exp,
        places = settings.exponentDefaultPlaces,
        formatter = (n, p) => n.toString(),
        largePlaces = Math.max(2, places)
    ) {
        if (isSmallExponent(exp)) return formatter(exp, Math.max(places, 1));
        if (shouldUseCommas(exp)) return addCommas(formatter(exp, 0));
        return this.formatDecimal(new Decimal(exp), largePlaces, largePlaces);
    }

    // Subclasses must implement:
    formatDecimal(num, places, exponentPlaces) { throw new Error("Not implemented"); }
}


// ── SCIENTIFIC NOTATION  (e.g. 1.23e456) ────────────────────
class ScientificNotation extends BaseNotation {
    get name() { return "Scientific"; }

    formatDecimal(num, places, exponentPlaces) {
        return makeExponentialFormatter(
            (n, p) => n.toFixed(Math.max(0, p)),   // mantissa formatter
            this.formatExponent.bind(this),          // exponent formatter
            10,   // base
            1,    // step (groups of 1 → standard scientific)
            false // show mantissa always
        )(num, places, exponentPlaces);
    }
}


// ── ENGINEERING NOTATION  (e.g. 1.23e456, exp always multiple of 3) ──
class EngineeringNotation extends BaseNotation {
    get name() { return "Engineering"; }

    formatDecimal(num, places, exponentPlaces) {
        return makeExponentialFormatter(
            (n, p) => n.toFixed(Math.max(0, p)),
            this.formatExponent.bind(this),
            10,
            3,    // step = 3 → exponent always a multiple of 3
            false
        )(num, places, exponentPlaces);
    }
}


// ── CUSTOM LETTER NOTATION (base class) ──────────────────────
// Uses a custom alphabet to label magnitude tiers
// e.g. with "abc...z": 1.23a, 4.56b, ...
class CustomLetterNotation extends EngineeringNotation {
    constructor(letters, mantissaSeparator = "", tierSeparator = "") {
        if (letters.length < 2) throw new Error("Need at least 2 letters");
        super();
        this.letters = letters;
        this.mantissaSeparator = mantissaSeparator;  // between number and letters
        this.tierSeparator = tierSeparator;      // between letter tiers
    }

    get name() { return "Custom"; }

    formatDecimal(num, places) {
        // Normalize to engineering form (exponent multiple of 3)
        const eRemainder = num.exponent % 3;
        const normalized = Decimal.fromMantissaExponent(
            num.mantissa * Math.pow(10, eRemainder),
            num.exponent - eRemainder
        );

        const mantissaStr = normalized.mantissa.toFixed(places);
        const lettersStr = this.getLetters(normalized.exponent).join(this.tierSeparator);
        return mantissaStr + this.mantissaSeparator + lettersStr;
    }

    // Convert an exponent (multiple of 3) → array of letter labels
    // exponent 3 → tier 1, exponent 6 → tier 2, etc.
    getLetters(exponent) {
        let tier = exponent / 3;
        const base = this.letters.length;

        if (tier <= base) return [this.letters[tier - 1]];

        const result = [];
        while (tier > base) {
            const mod = tier % base;
            const index = (mod === 0 ? base : mod) - 1;
            result.push(this.letters[index]);
            tier = Math.floor(tier / base);  // (with correction if mod === 0)
        }
        result.push(this.letters[tier - 1]);
        return result.reverse();
    }
}


// ── LETTERS NOTATION  (a, b, c, ... z, aa, ab, ...) ─────────
class LettersNotation extends CustomLetterNotation {
    constructor() { super("abcdefghijklmnopqrstuvwxyz"); }
    get name() { return "Letters"; }
}