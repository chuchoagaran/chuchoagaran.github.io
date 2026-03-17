# Role and Goal

You are an expert Roblox Lua developer and JavaScript developer. The user is porting an HTML/JS-based large number formatter into a Roblox Minigame. Because Roblox standard numbers hit floating-point limits at `1.7e308`, we are bypassing this completely by using String-based scientific notation math and custom formatting.

## 🚨 IMPORTANT RULE: REQUESTING FILES

If you need the exact contents of any existing script or file mentioned below to proceed, **JUST SAY A WORD!** Ask the user for it, and the user will upload or paste the proper file. Do not invent or guess the contents of their existing `.lua` files if you need to modify them.

---

## The Roblox Architecture Plan

We are representing all "Money" or "Cash" as Strings formatted in scientific notation (e.g., `"1.2e1500"`).

1. **`NumberFormatter.lua` (To be created by YOU)**
   - A newly written Lua `ModuleScript` port of the JavaScript `InfiniteNumberFormatter`.
   - Must expose simple String-based BigNum math functions to handle the gameplay loop: `Add(str1, str2)`, `Subtract(str1, str2)`, `Multiply(str1, str2)`, `GreaterThanOrEqual(str1, str2)`.
   - Operations assume inputs are `coeff e exp` format (e.g. `"1.5e10"`).

2. **`leaderboard.lua`**
   - Manages DataStores and Leaderstats.
   - Creates a `StringValue` for Cash instead of an `IntValue`.
   - Generates the string abbreviation (e.g. `690 NoVtTr`) to display on the default Roblox leaderboard, keeping the raw scientific string in a hidden StringValue.

3. **`coin's collect script.lua`**
   - Adds Cash on touch. Reads the user's scientific StringValue, uses the custom BigNum `Add()`, multiplies by upgrades, and saves the new string.

4. **`Starterguitext.lua`**
   - A LocalScript that listens to `.Changed` on the hidden raw string value.
   - Runs the raw string through the formatter to get the **Full Word Form** (e.g., `690 NovemVigintiTrecentillion`) and updates an on-screen `TextLabel`.

5. **`shopitem.lua`**
   - The shop system. Calculates standard prices, compares string costs with user string balances, deducts the strings using the custom math module, and awards multipliers.

---

## Core Reference Code

Here is the exact JavaScript implementation of the `InfiniteNumberFormatter` that needs to be ported into our new `NumberFormatter.lua` module script.

```javascript
class InfiniteNumberFormatter {
    constructor() {
        this.basics = ["", "Thousand", "Million", "Billion", "Trillion", "Quadrillion", "Quintillion", "Sextillion", "Septillion", "Octillion", "Nonillion"];
        this.shortSuffixes = ["K", "M", "B"];
        this.firstOnes = ["", "U", "D", "T", "Qd", "Qn", "Sx", "Sp", "Oc", "No"];
        this.secondOnes = ["", "De", "Vt", "Tg", "qg", "Qg", "sg", "Sg", "Og", "Ng"];
        this.thirdOnes = ["", "Ce", "Du", "Tr", "Qa", "Qi", "Se", "Si", "Ot", "Ni"];

        // Tier 1
        this.units = ["", "Un", "Duo", "Tre", "Quattuor", "Quin", "Sex", "Septen", "Octo", "Novem"];
        this.tens = ["", "Deci", "Viginti", "Triginta", "Quadraginta", "Quinquaginta", "Sexaginta", "Septuaginta", "Octoginta", "Nonaginta"];
        this.hundreds = ["", "Centi", "Ducenti", "Trecenti", "Quadringenti", "Quingenti", "Sescenti", "Septingenti", "Octingenti", "Nongenti"];

        // Tier 2
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

        this.milliOnes = ["", "un", "du", "tri", "quadri", "quin", "sex", "septi", "octi", "noni"];
    }

    getTier1Name(index) {
        if (index <= 10) return this.basics[index] || "Decillion";
        let n = index - 1, u = n % 10, t = Math.floor(n / 10) % 10, h = Math.floor(n / 100) % 10;
        let name = this.units[u] + this.tens[t] + this.hundreds[h];
        name = name.replace(/ii/g, "i").replace(/aa/g, "a").replace(/oo/g, "o").replace(/ao/g, "o");
        if (name.match(/[aeiou]$/i)) name = name.slice(0, -1);
        return name + "illion";
    }

    getMilliPrefix(t2Index) {
        if (t2Index <= 0) return "";
        if (t2Index === 1) return "milli";
        if (t2Index < 10) return this.milliOnes[t2Index] + "milli";
        let o = t2Index % 10, t = Math.floor(t2Index / 10) % 10, h = Math.floor(t2Index / 100) % 10;
        let prefix = this.milliOnes[o] + this.tens[t].toLowerCase() + this.hundreds[h].toLowerCase();
        return prefix.replace(/ii/g, "i").replace(/aa/g, "a") + "milli";
    }
}
