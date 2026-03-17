class BigNum {
    constructor(mantissa, exponent) {
        if (mantissa === 0) {
            this.mantissa = 0;
            this.exponent = 0;
        } else {
            this.mantissa = mantissa;
            this.exponent = exponent;
            this.normalize();
        }
    }

    static fromNumber(num) {
        if (num === 0) return new BigNum(0, 0);
        const sign = Math.sign(num);
        const absNum = Math.abs(num);
        const exp = Math.floor(Math.log10(absNum));
        const man = sign * (absNum / Math.pow(10, exp));
        return new BigNum(man, exp);
    }

    normalize() {
        if (this.mantissa === 0) {
            this.exponent = 0;
            return;
        }
        const expChange = Math.floor(Math.log10(Math.abs(this.mantissa)));
        if (expChange !== 0) {
            this.mantissa /= Math.pow(10, expChange);
            this.exponent += expChange;
        }
    }

    add(other) {
        if (this.mantissa === 0) return new BigNum(other.mantissa, other.exponent);
        if (other.mantissa === 0) return new BigNum(this.mantissa, this.exponent);

        const expDiff = this.exponent - other.exponent;

        // If the difference is too large, the smaller number is insignificant
        if (expDiff > 15) return new BigNum(this.mantissa, this.exponent);
        if (expDiff < -15) return new BigNum(other.mantissa, other.exponent);

        if (expDiff >= 0) {
            const adjustedOtherM = other.mantissa / Math.pow(10, expDiff);
            return new BigNum(this.mantissa + adjustedOtherM, this.exponent);
        } else {
            const adjustedThisM = this.mantissa / Math.pow(10, -expDiff);
            return new BigNum(other.mantissa + adjustedThisM, other.exponent);
        }
    }

    sub(other) {
        // Simplified subtraction assuming "this" >= "other" (no negative money in this game)
        const expDiff = this.exponent - other.exponent;
        if (expDiff > 15) return new BigNum(this.mantissa, this.exponent);

        if (expDiff >= 0) {
            const adjustedOtherM = other.mantissa / Math.pow(10, expDiff);
            return new BigNum(this.mantissa - adjustedOtherM, this.exponent);
        } else {
            // "this" is smaller, returning 0 for safety in game bounds
            return new BigNum(0, 0);
        }
    }

    mul(other) {
        return new BigNum(this.mantissa * other.mantissa, this.exponent + other.exponent);
    }

    cmp(other) {
        if (this.mantissa === 0 && other.mantissa === 0) return 0;
        if (this.exponent > other.exponent) return 1;
        if (this.exponent < other.exponent) return -1;
        if (this.mantissa > other.mantissa) return 1;
        if (this.mantissa < other.mantissa) return -1;
        return 0;
    }

    pow(n) {
        if (this.mantissa === 0) return new BigNum(0, 0);
        const totalLog = n * (this.exponent + Math.log10(this.mantissa));
        const newExp = Math.floor(totalLog);
        const newMan = Math.pow(10, totalLog - newExp);
        return new BigNum(newMan, newExp);
    }
}

// Math Utility for Exact Bulking
function estimateMaxPurchases(coins, baseCost, ratio) {
    if (coins.cmp(baseCost) < 0) return 0;
    const logCoins = coins.exponent + Math.log10(coins.mantissa);
    const logCost = baseCost.exponent + Math.log10(baseCost.mantissa);
    const logRatio = Math.log10(ratio);
    const logRMinus1 = Math.log10(ratio - 1);
    const logX = logCoins - logCost + logRMinus1;
    if (logX < 15) {
        const X = Math.pow(10, logX);
        return Math.floor(Math.log10(X + 1) / logRatio);
    } else {
        return Math.floor(logX / logRatio);
    }
}

function estimateMaxStrongerAutoExact() {
    if (!state.hasAutoclicker || state.autoPurchases >= 990) return 0;

    let count = 0;
    let probeCoins = new BigNum(state.coins.mantissa, state.coins.exponent);
    let probeCost = new BigNum(state.costStrongerAuto.mantissa, state.costStrongerAuto.exponent);
    const ratio = BigNum.fromNumber(1.15);

    while (count < (990 - state.autoPurchases) && probeCoins.cmp(probeCost) >= 0) {
        probeCoins = probeCoins.sub(probeCost);
        probeCost = probeCost.mul(ratio);
        count += 1;
    }

    return count;
}

// Game State
const state = {
    coins: new BigNum(0, 0),
    multiplier: new BigNum(1, 0), // Base multi is 1
    costPlus1: new BigNum(1, 1),  // Cost: 10
    costTimes1_5: new BigNum(1, 2), // Cost: 100
    hasAutoclicker: false,
    autoPurchases: 0,
    costStrongerAuto: new BigNum(5, 4) // Cost: 50000
};

const AUTO_COST = new BigNum(5, 4);

// Formatter Instance is already provided globally by scripts.js as `formatter`

function formatBigNum(bn) {
    if (bn.exponent < 3) {
        return Math.floor(bn.mantissa * Math.pow(10, bn.exponent)).toString();
    }
    // Returns something like "1.5 Million"
    return formatter.buildReadableText(bn.mantissa, bn.exponent);
}

// UI Elements
const coinDisplay = document.getElementById("coin-display");
const multiDisplay = document.getElementById("multi-display");
const cpsDisplay = document.getElementById("cps-display");
const coinButton = document.getElementById("coin-button");

const costPlusDisplay = document.getElementById("cost-plus");
const btnAddMax = document.getElementById("buy-add-max-btn");
const addCanBuyDisplay = document.getElementById("add-can-buy");

const multSection = document.getElementById("mult-section");
const costTimesDisplay = document.getElementById("cost-times");
const btnMultMax = document.getElementById("buy-mult-max-btn");
const multCanBuyDisplay = document.getElementById("mult-can-buy");

const btnBuyAuto = document.getElementById("buy-auto-btn");
const autoOwnedDisplay = document.getElementById("auto-owned-display");
const autoSpeedDisplay = document.getElementById("auto-speed-display");

const strongerAutoSection = document.getElementById("stronger-auto-section");
const costStrongerAutoDisplay = document.getElementById("cost-stronger-auto");
const btnStrongerAutoMax = document.getElementById("buy-stronger-auto-max-btn");
const strongerAutoCanBuyDisplay = document.getElementById("stronger-auto-can-buy");

// Update UI Function
function updateUI() {
    coinDisplay.innerText = formatBigNum(state.coins);
    multiDisplay.innerText = "x" + formatBigNum(state.multiplier);

    costPlusDisplay.innerText = "Cost: " + formatBigNum(state.costPlus1) + " Coins";
    costTimesDisplay.innerText = "Cost: " + formatBigNum(state.costTimes1_5) + " Coins";
    costStrongerAutoDisplay.innerText = "Cost: " + formatBigNum(state.costStrongerAuto) + " Coins";

    // Max purchases calcs
    const maxAdd = estimateMaxPurchases(state.coins, state.costPlus1, 1.5);
    const maxMult = estimateMaxPurchases(state.coins, state.costTimes1_5, 5);

    let maxStrongerAuto = estimateMaxStrongerAutoExact();

    addCanBuyDisplay.innerText = `(Can buy: ${formatBigNum(BigNum.fromNumber(maxAdd))})`;
    multCanBuyDisplay.innerText = `(Can buy: ${formatBigNum(BigNum.fromNumber(maxMult))})`;

    const intervalMs = Math.max(10, 1000 - state.autoPurchases);
    const intervalSec = intervalMs / 1000;
    strongerAutoCanBuyDisplay.innerText = `(Can buy: ${formatBigNum(BigNum.fromNumber(maxStrongerAuto))})\n-0.001s / upgrade`;

    btnAddMax.disabled = maxAdd <= 0;
    btnMultMax.disabled = maxMult <= 0;
    btnBuyAuto.disabled = state.coins.cmp(AUTO_COST) < 0 || state.hasAutoclicker;
    btnStrongerAutoMax.disabled = maxStrongerAuto <= 0 || !state.hasAutoclicker || state.autoPurchases >= 990;

    // Multiplicative blur
    if (state.multiplier.cmp(new BigNum(1, 0)) <= 0) {
        multSection.style.filter = "blur(4px)";
        multSection.style.pointerEvents = "none";
        multSection.style.opacity = "0.7";
    } else {
        multSection.style.filter = "none";
        multSection.style.pointerEvents = "auto";
        multSection.style.opacity = "1";
    }

    // Auto blur
    if (state.hasAutoclicker) {
        btnBuyAuto.style.filter = "blur(2px)";
        autoOwnedDisplay.innerText = "(Owned)";
        autoSpeedDisplay.innerText = `Current Speed: Click per ${intervalSec.toFixed(3)}s`;
        strongerAutoSection.style.filter = "none";
        strongerAutoSection.style.pointerEvents = "auto";
        strongerAutoSection.style.opacity = "1";
    } else {
        btnBuyAuto.style.filter = "none";
        autoOwnedDisplay.innerText = "(Not Owned)";
        autoSpeedDisplay.innerText = "Current Speed: 0/s";
        strongerAutoSection.style.filter = "blur(4px)";
        strongerAutoSection.style.pointerEvents = "none";
        strongerAutoSection.style.opacity = "0.7";
    }
}

// Click Coin Logic
coinButton.addEventListener("click", () => {
    // Random gain from 1 to 10
    const rawGain = Math.floor(Math.random() * 10) + 1;
    const baseGain = BigNum.fromNumber(rawGain);

    // Multiply by multiplier
    const totalGain = baseGain.mul(state.multiplier);

    // Add to total
    state.coins = state.coins.add(totalGain);
    updateUI();
});

// Shop Logic: Additive
function buyAdditiveMax() {
    const num = estimateMaxPurchases(state.coins, state.costPlus1, 1.5);
    if (num <= 0) return;

    // cost sum = C * (r^n - 1) / (r - 1)
    // ratio is 1.5, r - 1 = 0.5 (so we divide by 0.5 which means multiply by 2)
    const ratioPowN = BigNum.fromNumber(1.5).pow(num);
    const rnMinus1 = ratioPowN.sub(BigNum.fromNumber(1));
    const totalCost = state.costPlus1.mul(rnMinus1).mul(BigNum.fromNumber(2));

    state.coins = state.coins.sub(totalCost);
    state.multiplier = state.multiplier.add(BigNum.fromNumber(num));
    state.costPlus1 = state.costPlus1.mul(ratioPowN);

    updateUI();
}

btnAddMax.addEventListener("click", buyAdditiveMax);

// Shop Logic: Multiplicative
function buyMultiplicativeMax() {
    const num = estimateMaxPurchases(state.coins, state.costTimes1_5, 5);
    if (num <= 0) return;

    // cost sum = C * (r^n - 1) / (r - 1)
    // ratio is 5, r - 1 = 4
    const ratioPowN = BigNum.fromNumber(5).pow(num);
    const rnMinus1 = ratioPowN.sub(BigNum.fromNumber(1));
    const totalCost = state.costTimes1_5.mul(rnMinus1).mul(BigNum.fromNumber(0.25));

    state.coins = state.coins.sub(totalCost);
    // Multiplier increases by x1.5 per buy, so multiply by 1.5^n
    state.multiplier = state.multiplier.mul(BigNum.fromNumber(1.5).pow(num));
    state.costTimes1_5 = state.costTimes1_5.mul(ratioPowN);

    updateUI();
}

btnMultMax.addEventListener("click", buyMultiplicativeMax);

// Autoclicker Shop Logic
btnBuyAuto.addEventListener("click", () => {
    if (!state.hasAutoclicker && state.coins.cmp(AUTO_COST) >= 0) {
        state.coins = state.coins.sub(AUTO_COST);
        state.hasAutoclicker = true;
        updateUI();
    }
});

btnStrongerAutoMax.addEventListener("click", () => {
    let num = estimateMaxStrongerAutoExact();
    if (num <= 0) return;

    const ratioPowN = BigNum.fromNumber(1.15).pow(num);
    const rnMinus1 = ratioPowN.sub(BigNum.fromNumber(1));
    const totalCost = state.costStrongerAuto.mul(rnMinus1).mul(BigNum.fromNumber(1 / 0.15));

    state.coins = state.coins.sub(totalCost);
    state.autoPurchases += num;
    state.costStrongerAuto = state.costStrongerAuto.mul(ratioPowN);

    updateUI();
});

// --- Save & Load System ---

const SAVE_KEY = "infiniteCoinClickerSave";

function saveGame() {
    const saveData = {
        coins: { m: state.coins.mantissa, e: state.coins.exponent },
        multiplier: { m: state.multiplier.mantissa, e: state.multiplier.exponent },
        costPlus1: { m: state.costPlus1.mantissa, e: state.costPlus1.exponent },
        costTimes1_5: { m: state.costTimes1_5.mantissa, e: state.costTimes1_5.exponent },
        hasAutoclicker: state.hasAutoclicker,
        autoPurchases: state.autoPurchases,
        costStrongerAuto: { m: state.costStrongerAuto.mantissa, e: state.costStrongerAuto.exponent }
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
}

function loadGame(saveString) {
    try {
        const dataStr = saveString || localStorage.getItem(SAVE_KEY);
        if (dataStr) {
            const loadData = JSON.parse(dataStr);
            if (loadData.coins) state.coins = new BigNum(loadData.coins.m, loadData.coins.e);
            if (loadData.multiplier) state.multiplier = new BigNum(loadData.multiplier.m, loadData.multiplier.e);
            if (loadData.costPlus1) state.costPlus1 = new BigNum(loadData.costPlus1.m, loadData.costPlus1.e);
            if (loadData.costTimes1_5) state.costTimes1_5 = new BigNum(loadData.costTimes1_5.m, loadData.costTimes1_5.e);
            if (loadData.hasAutoclicker !== undefined) state.hasAutoclicker = loadData.hasAutoclicker;
            if (loadData.autoPurchases !== undefined) state.autoPurchases = loadData.autoPurchases;
            if (loadData.costStrongerAuto) state.costStrongerAuto = new BigNum(loadData.costStrongerAuto.m, loadData.costStrongerAuto.e);
            updateUI();
        }
    } catch (e) {
        console.error("Failed to load save", e);
        if (saveString) alert("Invalid save string!");
    }
}

function resetGame() {
    if (confirm("Are you sure you want to completely reset your progress?")) {
        state.coins = new BigNum(0, 0);
        state.multiplier = new BigNum(1, 0);
        state.costPlus1 = new BigNum(1, 1);
        state.costTimes1_5 = new BigNum(1, 2);
        state.hasAutoclicker = false;
        state.autoPurchases = 0;
        state.costStrongerAuto = new BigNum(5, 4);
        saveGame();
        updateUI();
    }
}

// Auto-save every 10 seconds
setInterval(saveGame, 10000);

// Settings UI Buttons
document.getElementById("save-btn").addEventListener("click", () => {
    saveGame();
    alert("Game Saved!");
});

document.getElementById("export-btn").addEventListener("click", () => {
    saveGame(); // ensure freshest state
    const saveStr = localStorage.getItem(SAVE_KEY);
    const base64 = btoa(saveStr);
    prompt("Copy your output save string:", base64);
});

document.getElementById("import-btn").addEventListener("click", () => {
    const base64 = prompt("Paste your save string:");
    if (base64) {
        try {
            const jsonStr = atob(base64);
            loadGame(jsonStr);
            saveGame(); // save imported data to localStorage
            alert("Save imported successfully!");
        } catch (e) {
            alert("Error parsing save string! Make sure you copied it entirely.");
        }
    }
});

document.getElementById("hard-reset-btn").addEventListener("click", resetGame);

// Real-time CPS tracking and Game Loop
let lastAutoClickTime = performance.now();
let coinHistory = [];

function gameLoop(timestamp) {
    if (state.hasAutoclicker) {
        const intervalMs = Math.max(10, 1000 - state.autoPurchases);
        const delta = timestamp - lastAutoClickTime;

        if (delta >= intervalMs) {
            const numTicks = Math.floor(delta / intervalMs);
            lastAutoClickTime += numTicks * intervalMs;

            const avgGain = BigNum.fromNumber(5.5).mul(state.multiplier);
            const totalGain = avgGain.mul(BigNum.fromNumber(numTicks));

            // Increment logic
            state.coins = state.coins.add(totalGain);
            updateUI();
        }
    } else {
        lastAutoClickTime = timestamp;
    }

    // Keep history pruned to ~1.5 seconds
    const timeNow = timestamp || performance.now();
    coinHistory.push({ time: timeNow, coins: new BigNum(state.coins.mantissa, state.coins.exponent) });
    while (coinHistory.length > 0 && timeNow - coinHistory[0].time > 1500) {
        coinHistory.shift();
    }

    // Find record from ~1.0 seconds ago
    let pastRecord = coinHistory[0];
    for (let i = 0; i < coinHistory.length; i++) {
        if (timeNow - coinHistory[i].time <= 1000) {
            pastRecord = coinHistory[i];
            break;
        }
    }

    if (pastRecord) {
        const exactDiff = state.coins.sub(pastRecord.coins);
        cpsDisplay.innerText = formatBigNum(exactDiff);
    } else {
        cpsDisplay.innerText = "0";
    }

    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);

// Init
loadGame(); // try loading local storage first
updateUI();
