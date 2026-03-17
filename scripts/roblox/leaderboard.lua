local DataStoreService = game:GetService("DataStoreService")
local dataStores = DataStoreService:GetDataStore("Data")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

-- Require our new math and formatting module
local NumberFormatter = require(ReplicatedStorage:WaitForChild("NumberFormatter"))

local playersOnline = 0
local bindableEvent = Instance.new("BindableEvent")

local function createLeaderstats(player, rawCashData)
	-- 1. Sanitize loaded data: default to "0e0" if they have no save data
	if not rawCashData then
		rawCashData = "0e0"
	else
		rawCashData = tostring(rawCashData) -- Ensures old number saves convert safely to strings
	end

	-- 2. Create HIDDEN stats for the raw scientific math
	local hiddenStats = Instance.new("Folder")
	hiddenStats.Name = "HiddenStats"
	hiddenStats.Parent = player

	local rawCash = Instance.new("StringValue")
	rawCash.Name = "RawCash"
	rawCash.Value = rawCashData
	rawCash.Parent = hiddenStats

	-- 3. Create VISIBLE leaderstats for the top-right Roblox leaderboard
	local stats = Instance.new("Folder")
	stats.Name = "leaderstats"
	stats.Parent = player

	local displayCash = Instance.new("StringValue")
	displayCash.Name = "Cash" -- Standardizing the name to "Cash"
	displayCash.Parent = stats
	
	-- Initialize the display value
	displayCash.Value = NumberFormatter.FormatAbbrev(rawCash.Value)

	-- 4. Automatically update the Leaderboard display when RawCash changes
	rawCash:GetPropertyChangedSignal("Value"):Connect(function()
		displayCash.Value = NumberFormatter.FormatAbbrev(rawCash.Value)
	end)
end

game.Players.PlayerAdded:Connect(function(p)
	playersOnline = playersOnline + 1
	local cashData
	
	local success, err = pcall(function()
		-- Unified Key: We now load using "-Cash"
		cashData = dataStores:GetAsync(p.UserId .. "-Cash")
	end)
	
	if not success then
		p:Kick("Data Store couldn't be loaded! Please wait 5 Minutes before you rejoin!")
		return
	end
	
	createLeaderstats(p, cashData)
end)

game.Players.PlayerRemoving:Connect(function(p)
	playersOnline = playersOnline - 1
	
	local hiddenStats = p:FindFirstChild("HiddenStats")
	if hiddenStats and hiddenStats:FindFirstChild("RawCash") then
		local success, err = pcall(function()
			-- Unified Key: We now save using "-Cash" (Fixed from your old "-Bucks")
			dataStores:SetAsync(p.UserId .. "-Cash", hiddenStats.RawCash.Value)
		end)
		if not success then
			warn("Failed to save data for " .. p.Name .. ": " .. tostring(err))
		end
	end
	
	bindableEvent:Fire()
end)

game:BindToClose(function()
	if playersOnline > 0 then
		bindableEvent.Event:Wait()
	end
end)