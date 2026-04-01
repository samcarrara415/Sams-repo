-- GamepassService.lua
-- Handles Robux gamepass purchases and timed booster activation

local MarketplaceService = game:GetService("MarketplaceService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local GameConfig = require(ReplicatedStorage:WaitForChild("GameConfig"))
local Remotes = require(ReplicatedStorage:WaitForChild("RemoteEvents"))

local GamepassService = {}

-- Activate a timed booster for a player
local function activateBooster(player, boosterName, duration)
	local PlayerDataManager = require(script.Parent:WaitForChild("PlayerDataManager"))
	local data = PlayerDataManager.GetData(player)
	if not data then return end

	data.ActiveBoosters[boosterName] = tick() + duration

	Remotes.BoosterActivated:FireClient(player, {
		BoosterName = boosterName,
		ExpiresAt = data.ActiveBoosters[boosterName],
		Duration = duration,
	})
end

-- Handle purchase request from client
Remotes.PurchaseBooster.OnServerEvent:Connect(function(player, boosterName)
	local passConfig = GameConfig.Gamepasses[boosterName]
	if not passConfig then return end

	if passConfig.GamepassId == 0 then
		-- Dev mode: activate for free (replace with real gamepass check)
		activateBooster(player, boosterName, passConfig.DurationSeconds)
		return
	end

	-- Prompt the purchase through Roblox
	MarketplaceService:PromptGamePassPurchase(player, passConfig.GamepassId)
end)

-- Listen for completed purchases
MarketplaceService.PromptGamePassPurchaseFinished:Connect(function(player, gamePassId, wasPurchased)
	if not wasPurchased then return end

	-- Find which booster this gamepass ID corresponds to
	for boosterName, config in pairs(GameConfig.Gamepasses) do
		if config.GamepassId == gamePassId then
			activateBooster(player, boosterName, config.DurationSeconds)
			break
		end
	end
end)

-- Handle Robux-for-Coins purchases (Developer Products)
Remotes.PurchaseCoinPack.OnServerEvent:Connect(function(player, packName)
	local pack = nil
	for _, p in ipairs(GameConfig.CoinPacks) do
		if p.Name == packName then
			pack = p
			break
		end
	end
	if not pack then return end

	-- In dev mode (no real product IDs), give coins directly
	-- Replace with MarketplaceService:PromptProductPurchase for production
	local PlayerDataManager = require(script.Parent:WaitForChild("PlayerDataManager"))
	PlayerDataManager.AddCoins(player, pack.Coins)
end)

-- Periodic cleanup of expired boosters
task.spawn(function()
	while true do
		task.wait(60)
		local PlayerDataManager = require(script.Parent:WaitForChild("PlayerDataManager"))
		for _, data in pairs(PlayerDataManager.Data) do
			for boosterName, expiry in pairs(data.ActiveBoosters) do
				if tick() > expiry then
					data.ActiveBoosters[boosterName] = nil
				end
			end
		end
	end
end)

return GamepassService
