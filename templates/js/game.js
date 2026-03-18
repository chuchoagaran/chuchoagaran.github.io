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
    const ratio = BigNum.fromNumber(UPGRADE_CONFIG.strongerAutoRatio);

    while (count < (990 - state.autoPurchases) && probeCoins.cmp(probeCost) >= 0) {
        probeCoins = probeCoins.sub(probeCost);
        probeCost = probeCost.mul(ratio);
        count += 1;
    }

    return count;
}

function cloneBigNum(bn) {
    return new BigNum(bn.mantissa, bn.exponent);
}

// Progression tuning (made easier).
const UPGRADE_CONFIG = {
    addBaseCost: new BigNum(5, 0),          // 5
    addRatio: 1.25,
    betterAddBaseCost: new BigNum(15, 2),   // 1500
    betterAddRatio: 1.15,
    autoUnlockCost: new BigNum(1, 4),       // 10000
    strongerAutoBaseCost: new BigNum(1, 4), // 10000
    strongerAutoRatio: 1.08
};

// Game State
const state = {
    coins: new BigNum(0, 0),
    multiplier: new BigNum(1, 0), // Base multi is 1
    costPlus1: cloneBigNum(UPGRADE_CONFIG.addBaseCost),
    costBetterAdd: cloneBigNum(UPGRADE_CONFIG.betterAddBaseCost),
    betterAddLevel: 0,
    hasAutoclicker: false,
    autoPurchases: 0,
    costStrongerAuto: cloneBigNum(UPGRADE_CONFIG.strongerAutoBaseCost),
    growthRate: new BigNum(2, 2), // 200 coins/s base
    hype: 0,
    burstTimer: 0
};

const AUTO_COST = cloneBigNum(UPGRADE_CONFIG.autoUnlockCost);

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
const rateDisplay = document.getElementById("rate-display");
const hypeDisplay = document.getElementById("hype-display");
const coinButton = document.getElementById("coin-button");
const vibeText = document.getElementById("vibe-text");
const growthGraph = document.getElementById("growth-graph");
const growthCtx = growthGraph ? growthGraph.getContext("2d") : null;

const costPlusDisplay = document.getElementById("cost-plus");
const btnAddMax = document.getElementById("buy-add-max-btn");
const addCanBuyDisplay = document.getElementById("add-can-buy");

const betterAddSection = document.getElementById("better-add-section");
const costBetterAddDisplay = document.getElementById("cost-better-add");
const betterAddEffectDisplay = document.getElementById("better-add-effect");
const btnBetterAddMax = document.getElementById("buy-better-add-max-btn");
const betterAddCanBuyDisplay = document.getElementById("better-add-can-buy");

const btnBuyAuto = document.getElementById("buy-auto-btn");
const autoOwnedDisplay = document.getElementById("auto-owned-display");
const autoSpeedDisplay = document.getElementById("auto-speed-display");

const strongerAutoSection = document.getElementById("stronger-auto-section");
const costStrongerAutoDisplay = document.getElementById("cost-stronger-auto");
const btnStrongerAutoMax = document.getElementById("buy-stronger-auto-max-btn");
const strongerAutoCanBuyDisplay = document.getElementById("stronger-auto-can-buy");

let graphSamples = [];

function getCoinLog10() {
    if (state.coins.mantissa <= 0) return 0;
    return Math.log10(state.coins.mantissa) + state.coins.exponent;
}

function drawGrowthGraph() {
    if (!growthCtx || !growthGraph || graphSamples.length < 2) return;

    const w = growthGraph.width;
    const h = growthGraph.height;
    growthCtx.clearRect(0, 0, w, h);

    // Background grid
    growthCtx.strokeStyle = "rgba(148, 163, 184, 0.18)";
    growthCtx.lineWidth = 1;
    for (let i = 1; i < 6; i++) {
        const y = (h / 6) * i;
        growthCtx.beginPath();
        growthCtx.moveTo(0, y);
        growthCtx.lineTo(w, y);
        growthCtx.stroke();
    }

    const minV = Math.min(...graphSamples.map((s) => s.v));
    const maxV = Math.max(...graphSamples.map((s) => s.v));
    const spread = Math.max(1e-9, maxV - minV);
    const xStep = w / Math.max(1, graphSamples.length - 1);

    growthCtx.lineWidth = 3;
    growthCtx.strokeStyle = "#38bdf8";
    growthCtx.beginPath();
    for (let i = 0; i < graphSamples.length; i++) {
        const x = i * xStep;
        const t = (graphSamples[i].v - minV) / spread;
        const y = h - (t * (h - 20) + 10);
        if (i === 0) growthCtx.moveTo(x, y);
        else growthCtx.lineTo(x, y);
    }
    growthCtx.stroke();
}

function updateVibeText() {
    if (!vibeText) return;
    const logCoins = getCoinLog10();
    if (state.burstTimer > 0) {
        vibeText.innerText = "Giggle burst active";
    } else if (logCoins > 30) {
        vibeText.innerText = "Absolute chaos";
    } else if (logCoins > 18) {
        vibeText.innerText = "Acceleration is spicy";
    } else if (logCoins > 8) {
        vibeText.innerText = "Steady exponential climb";
    } else {
        vibeText.innerText = "Calm climb";
    }
}

// Update UI Function
function updateUI() {
    coinDisplay.innerText = formatBigNum(state.coins);
    multiDisplay.innerText = "x" + formatBigNum(state.multiplier);
    rateDisplay.innerText = `${formatBigNum(state.growthRate)}/s`;
    hypeDisplay.innerText = `${Math.round(state.hype * 100)}%`;

    costPlusDisplay.innerText = "Cost: " + formatBigNum(state.costPlus1) + " Coins";
    costBetterAddDisplay.innerText = "Cost: " + formatBigNum(state.costBetterAdd) + " Coins";
    betterAddEffectDisplay.innerText = `Will add each upgrade: +1 Multi (Current +${state.betterAddLevel + 1} per buy)`;
    costStrongerAutoDisplay.innerText = "Cost: " + formatBigNum(state.costStrongerAuto) + " Coins";

    // Max purchases calcs
    const maxAdd = estimateMaxPurchases(state.coins, state.costPlus1, UPGRADE_CONFIG.addRatio);
    const maxBetterAdd = estimateMaxPurchases(state.coins, state.costBetterAdd, UPGRADE_CONFIG.betterAddRatio);

    let maxStrongerAuto = estimateMaxStrongerAutoExact();

    addCanBuyDisplay.innerText = `(Can buy: ${formatBigNum(BigNum.fromNumber(maxAdd))})`;
    betterAddCanBuyDisplay.innerText = `(Can buy: ${formatBigNum(BigNum.fromNumber(maxBetterAdd))})`;

    const intervalMs = Math.max(10, 1000 - state.autoPurchases);
    const intervalSec = intervalMs / 1000;
    strongerAutoCanBuyDisplay.innerText = `(Can buy: ${formatBigNum(BigNum.fromNumber(maxStrongerAuto))})\n-0.001s / upgrade`;

    btnAddMax.disabled = maxAdd <= 0;
    btnBetterAddMax.disabled = maxBetterAdd <= 0;
    btnBuyAuto.disabled = state.coins.cmp(AUTO_COST) < 0 || state.hasAutoclicker;
    btnStrongerAutoMax.disabled = maxStrongerAuto <= 0 || !state.hasAutoclicker || state.autoPurchases >= 990;

    betterAddSection.style.filter = "none";
    betterAddSection.style.pointerEvents = "auto";
    betterAddSection.style.opacity = "1";

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
    state.hype = Math.min(1, state.hype + 0.08);
    state.burstTimer = Math.min(6, state.burstTimer + 1.2);

    const burstGain = state.growthRate.mul(BigNum.fromNumber(0.35 + state.hype * 0.5));
    state.coins = state.coins.add(burstGain);

    // Clicking also nudges long-term growth slightly.
    state.growthRate = state.growthRate.mul(BigNum.fromNumber(1.01 + state.hype * 0.01));
    updateUI();
});

// Shop Logic: Additive
function buyAdditiveMax() {
    const num = estimateMaxPurchases(state.coins, state.costPlus1, UPGRADE_CONFIG.addRatio);
    if (num <= 0) return;

    // cost sum = C * (r^n - 1) / (r - 1)
    const ratioPowN = BigNum.fromNumber(UPGRADE_CONFIG.addRatio).pow(num);
    const rnMinus1 = ratioPowN.sub(BigNum.fromNumber(1));
    const totalCost = state.costPlus1.mul(rnMinus1).mul(BigNum.fromNumber(1 / (UPGRADE_CONFIG.addRatio - 1)));
    const additiveGainPerBuy = state.betterAddLevel + 1;

    state.coins = state.coins.sub(totalCost);
    state.multiplier = state.multiplier.add(BigNum.fromNumber(num * additiveGainPerBuy));
    state.costPlus1 = state.costPlus1.mul(ratioPowN);

    updateUI();
}

btnAddMax.addEventListener("click", buyAdditiveMax);

// Shop Logic: Better Additive
function buyBetterAdditiveMax() {
    const num = estimateMaxPurchases(state.coins, state.costBetterAdd, UPGRADE_CONFIG.betterAddRatio);
    if (num <= 0) return;

    const ratioPowN = BigNum.fromNumber(UPGRADE_CONFIG.betterAddRatio).pow(num);
    const rnMinus1 = ratioPowN.sub(BigNum.fromNumber(1));
    const totalCost = state.costBetterAdd.mul(rnMinus1).mul(BigNum.fromNumber(1 / (UPGRADE_CONFIG.betterAddRatio - 1)));

    state.coins = state.coins.sub(totalCost);
    state.betterAddLevel += num;
    state.costBetterAdd = state.costBetterAdd.mul(ratioPowN);

    updateUI();
}

btnBetterAddMax.addEventListener("click", buyBetterAdditiveMax);

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

    const ratioPowN = BigNum.fromNumber(UPGRADE_CONFIG.strongerAutoRatio).pow(num);
    const rnMinus1 = ratioPowN.sub(BigNum.fromNumber(1));
    const totalCost = state.costStrongerAuto.mul(rnMinus1).mul(BigNum.fromNumber(1 / (UPGRADE_CONFIG.strongerAutoRatio - 1)));

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
        costBetterAdd: { m: state.costBetterAdd.mantissa, e: state.costBetterAdd.exponent },
        betterAddLevel: state.betterAddLevel,
        hasAutoclicker: state.hasAutoclicker,
        autoPurchases: state.autoPurchases,
        costStrongerAuto: { m: state.costStrongerAuto.mantissa, e: state.costStrongerAuto.exponent },
        growthRate: { m: state.growthRate.mantissa, e: state.growthRate.exponent },
        hype: state.hype,
        burstTimer: state.burstTimer
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
            if (loadData.costBetterAdd) {
                state.costBetterAdd = new BigNum(loadData.costBetterAdd.m, loadData.costBetterAdd.e);
            } else if (loadData.costTimes1_5) {
                // Backward compatibility with old multiplicative save key.
                state.costBetterAdd = new BigNum(loadData.costTimes1_5.m, loadData.costTimes1_5.e);
            }
            if (loadData.betterAddLevel !== undefined) state.betterAddLevel = loadData.betterAddLevel;
            if (loadData.hasAutoclicker !== undefined) state.hasAutoclicker = loadData.hasAutoclicker;
            if (loadData.autoPurchases !== undefined) state.autoPurchases = loadData.autoPurchases;
            if (loadData.costStrongerAuto) state.costStrongerAuto = new BigNum(loadData.costStrongerAuto.m, loadData.costStrongerAuto.e);
            if (loadData.growthRate) state.growthRate = new BigNum(loadData.growthRate.m, loadData.growthRate.e);
            if (typeof loadData.hype === "number") state.hype = Math.max(0, Math.min(1, loadData.hype));
            if (typeof loadData.burstTimer === "number") state.burstTimer = Math.max(0, loadData.burstTimer);
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
        state.costPlus1 = cloneBigNum(UPGRADE_CONFIG.addBaseCost);
        state.costBetterAdd = cloneBigNum(UPGRADE_CONFIG.betterAddBaseCost);
        state.betterAddLevel = 0;
        state.hasAutoclicker = false;
        state.autoPurchases = 0;
        state.costStrongerAuto = cloneBigNum(UPGRADE_CONFIG.strongerAutoBaseCost);
        state.growthRate = new BigNum(2, 2);
        state.hype = 0;
        state.burstTimer = 0;
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
let lastFrameTime = performance.now();
let coinHistory = [];
let uiRefreshTimer = 0;
let graphSampleTimer = 0;

function gameLoop(timestamp) {
    const dt = Math.min(0.25, Math.max(0, (timestamp - lastFrameTime) / 1000));
    lastFrameTime = timestamp;

    // Hype decays slowly if not actively bursting.
    state.hype = Math.max(0, state.hype - dt * 0.06);

    const wave = 0.12 * (1 + Math.sin(timestamp * 0.0008));
    const accel = 0.22 + wave + state.hype * 0.45;
    state.growthRate = state.growthRate.mul(BigNum.fromNumber(1 + accel * dt));

    const autoBonus = (state.hasAutoclicker ? 0.5 : 0) + state.autoPurchases * 0.01;
    const additiveBonus = state.betterAddLevel * 0.08;
    const burstBonus = state.burstTimer > 0 ? (1 + state.hype * 2.2) : 1;
    const passiveScale = (1 + autoBonus + additiveBonus) * burstBonus;

    const passiveGain = state.growthRate
        .mul(BigNum.fromNumber(dt))
        .mul(BigNum.fromNumber(passiveScale))
        .mul(state.multiplier);

    state.coins = state.coins.add(passiveGain);

    if (state.burstTimer > 0) {
        state.burstTimer = Math.max(0, state.burstTimer - dt);
    }

    uiRefreshTimer += dt;
    if (uiRefreshTimer >= 0.1) {
        updateUI();
        uiRefreshTimer = 0;
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

    graphSampleTimer += dt;
    if (graphSampleTimer >= 0.2) {
        graphSamples.push({ t: timeNow, v: getCoinLog10() });
        if (graphSamples.length > 180) graphSamples.shift();
        graphSampleTimer = 0;
        drawGrowthGraph();
        updateVibeText();
    }

    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);

// Init
loadGame(); // try loading local storage first
updateUI();
