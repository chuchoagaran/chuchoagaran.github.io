local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

-- 1. Get our custom NumberFormatter module
local NumberFormatter = require(ReplicatedStorage:WaitForChild("NumberFormatter"))

local player = Players.LocalPlayer

-- 2. Wait for the Server to load the player's HiddenStats
local hiddenStats = player:WaitForChild("HiddenStats")
local rawCash = hiddenStats:WaitForChild("RawCash")

-- Make sure this correctly points to your TextLabel
local textLabel = script.Parent.TextLabel 

local history = {}

-- Initialize the first history record
table.insert(history, {time = tick(), cash = rawCash.Value})

while true do
	task.wait(0.1)
	
	local currentTime = tick()
	local currentCash = rawCash.Value
	
	-- 3. Record the current cash and time
	table.insert(history, {time = currentTime, cash = currentCash})
	
	-- 4. Clean up old records (remove anything older than 1.5 seconds to save memory)
	while #history > 0 and (currentTime - history[1].time) > 1.5 do
		table.remove(history, 1)
	end
	
	-- 5. Find the record from exactly ~1.0 second ago
	local targetTime = currentTime - 1.0
	local pastRecord = history[1]
	
	for i = 1, #history do
		if history[i].time <= targetTime then
			pastRecord = history[i]
		else
			break
		end
	end
	
	-- 6. STRING MATH: Cash Per Second = Current Cash - Cash from 1 second ago
	local cpsString = NumberFormatter.Subtract(currentCash, pastRecord.cash)
	
	-- 7. Update the UI with the Massive Full Word Format!
	textLabel.Text = "$" .. NumberFormatter.FormatFull(cpsString) .. " /s"
end