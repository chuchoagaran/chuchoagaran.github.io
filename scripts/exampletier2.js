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

        // Calculate the illion index (e.g., 10^6 -> 6/3 - 1 = 1 = Million)
        let index = Math.floor(exponent / 3) - 1;

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

    // Helper for testing
    test(exponent) {
        let name = this.getFullNameFromExponent(exponent);
        console.log(`10^${exponent} = ONE ${name}`);
    }
}

// ==========================================
// 🚀 THE TESTING ZONE 
// ==========================================
const formatter = new InfiniteNumberFormatter();

console.log("--- BASIC NUMBERS ---");
formatter.test(6);     // 10^6 (Million)
formatter.test(33);    // 10^33 (Decillion)

console.log("\n--- TIER 1 COMBOS (The Slap) ---");
formatter.test(36);    // 10^36 (Undecillion)
formatter.test(66);    // 10^66 (Unvigintillion)
formatter.test(303);   // 10^303 (Centillion)
formatter.test(336);   // 10^336 (Undecicillion)
formatter.test(3000);  // 10^3000 (Noven-nonaginta-nongentillion) -> Wait, let's see!

console.log("\n--- TIER 2 'INFINITE' TERRITORY ---");
formatter.test(3003);  // 10^3003 (Millillion)
formatter.test(3036);  // 10^3036 (Milli-undecillion)
formatter.test(6003);  // 10^6003 (Micrillion)
formatter.test(24003); // 10^24003 (Zeptillion)