local ReplicatedStorage = game:GetService("ReplicatedStorage")
local NumberFormatter = require(ReplicatedStorage:WaitForChild("NumberFormatter"))

local db = true

local function getRandomNumber(min, max)
	return math.random(min, max)
end

local function getRandomTime(min, max)
	return math.random() * (max - min) + min
end

script.Parent.Touched:Connect(function(hit)
	local character = hit.Parent
	if character:FindFirstChild("Humanoid") then
		if db then
			-- 1. Ensure it's an actual player who touched the coin
			local player = game.Players:GetPlayerFromCharacter(character)
			if not player then return end
			
			-- 2. Locate their HiddenStats
			local hiddenStats = player:FindFirstChild("HiddenStats")
			if not hiddenStats then return end
			
			local rawCash = hiddenStats:FindFirstChild("RawCash")
			if not rawCash then return end

			-- 3. Check for a Multiplier (defaults to "1" if they haven't bought any)
			local multiObj = hiddenStats:FindFirstChild("Multiplier")
			local currentMultiplier = multiObj and multiObj.Value or "1"

			db = false
			script.Parent.Transparency = 1

			-- 4. Calculate base reward and multiply it
			local baseReward = tostring(getRandomNumber(1, 100)) -- e.g., "50"
			
			-- STRING MATH: totalReward = baseReward * currentMultiplier
			local totalReward = NumberFormatter.Multiply(baseReward, currentMultiplier)
			
			-- STRING MATH: rawCash = rawCash + totalReward
			rawCash.Value = NumberFormatter.Add(rawCash.Value, totalReward)

			if script:FindFirstChild("Sound") then
				script.Sound:Play()
			end

			-- 5. Handle the coin respawn fading
			local randomTransparencyTime = getRandomTime(1, 10)
			local transparencyStartTime = tick()

			while tick() - transparencyStartTime < randomTransparencyTime do
				local lerpedTransparency = (tick() - transparencyStartTime) / randomTransparencyTime
				script.Parent.Transparency = 1 - lerpedTransparency
				task.wait(0.1) 
			end

			db = true
			script.Parent.Transparency = 0
		end
	end	
end)