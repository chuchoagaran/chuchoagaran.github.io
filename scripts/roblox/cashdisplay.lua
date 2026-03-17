local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

-- 1. Get our custom NumberFormatter module
local NumberFormatter = require(ReplicatedStorage:WaitForChild("NumberFormatter"))

local player = Players.LocalPlayer

-- 2. Wait for the Server to load the player's HiddenStats and Database values
local hiddenStats = player:WaitForChild("HiddenStats")
local rawCash = hiddenStats:WaitForChild("RawCash")

local textLabel = script.Parent

-- 3. Function to calculate and update the UI with Full Words
local function updateUI()
	-- This turns "1.5e6" into "1.50 Million" and "1e3003" into "1.00 Millillion"
	textLabel.Text = "$" .. NumberFormatter.FormatFull(rawCash.Value)
end

-- 4. Set the text immediately when the player joins
updateUI()

-- 5. Sync the UI perfectly whenever the player gets or spends cash
rawCash:GetPropertyChangedSignal("Value"):Connect(updateUI)