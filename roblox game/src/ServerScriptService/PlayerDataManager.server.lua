-- PlayerDataManager.lua
-- Manages all player data: backpack, food level, coins, upgrades, unlocked attacks

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local GameConfig = require(ReplicatedStorage:WaitForChild("GameConfig"))
local Remotes = require(ReplicatedStorage:WaitForChild("RemoteEvents"))

local PlayerDataManager = {}
PlayerDataManager.Data = {} -- [player.UserId] = data table

local DEFAULT_DATA = {
	FoodLevel = 0,
	Coins = 0,
	Backpack = {},             -- array of ingredient names
	Upgrades = {               -- current level of each upgrade
		CollectSpeed = 0,
		CollectRange = 0,
		BackpackSize = 0,
		WalkSpeed = 0,
	},
	UnlockedAttacks = {"Belly Bump"},  -- starter attack is free
	EquippedAttacks = {"Belly Bump"},  -- attacks in your hotbar
	ActiveBoosters = {},               -- {boosterName = expireTick}
}

function PlayerDataManager.GetData(player)
	return PlayerDataManager.Data[player.UserId]
end

function PlayerDataManager.GetBackpackCapacity(player)
	local data = PlayerDataManager.GetData(player)
	if not data then return GameConfig.Backpack.MaxCapacity end

	local base = GameConfig.Backpack.MaxCapacity
	local upgradeLevel = data.Upgrades.BackpackSize
	local upgradeBonus = upgradeLevel * GameConfig.Upgrades.BackpackSize.BonusPerLevel

	-- Check for active double capacity booster
	local boosterBonus = 0
	if data.ActiveBoosters.DoubleCapacity and tick() < data.ActiveBoosters.DoubleCapacity then
		boosterBonus = GameConfig.Gamepasses.DoubleCapacity.BackpackBonus
	end

	return base + upgradeBonus + boosterBonus
end

function PlayerDataManager.GetCollectRange(player)
	local data = PlayerDataManager.GetData(player)
	if not data then return GameConfig.Collection.BaseCollectRange end

	local base = GameConfig.Collection.BaseCollectRange
	local upgradeLevel = data.Upgrades.CollectRange
	local bonus = upgradeLevel * GameConfig.Upgrades.CollectRange.BonusPerLevel
	return base + bonus
end

function PlayerDataManager.GetCollectSpeed(player)
	local data = PlayerDataManager.GetData(player)
	if not data then return GameConfig.Collection.BaseCollectSpeed end

	local base = GameConfig.Collection.BaseCollectSpeed
	local upgradeLevel = data.Upgrades.CollectSpeed
	local bonus = upgradeLevel * GameConfig.Upgrades.CollectSpeed.BonusPerLevel
	return base + bonus
end

function PlayerDataManager.AddToBackpack(player, ingredientName)
	local data = PlayerDataManager.GetData(player)
	if not data then return false end

	local capacity = PlayerDataManager.GetBackpackCapacity(player)
	if #data.Backpack >= capacity then
		return false -- backpack full
	end

	table.insert(data.Backpack, ingredientName)
	Remotes.BackpackUpdated:FireClient(player, data.Backpack)
	return true
end

function PlayerDataManager.ClearBackpack(player)
	local data = PlayerDataManager.GetData(player)
	if not data then return {} end

	local items = data.Backpack
	data.Backpack = {}
	Remotes.BackpackUpdated:FireClient(player, data.Backpack)
	return items
end

function PlayerDataManager.AddFoodLevel(player, amount)
	local data = PlayerDataManager.GetData(player)
	if not data then return end

	data.FoodLevel = data.FoodLevel + amount
	Remotes.FoodLevelUpdated:FireClient(player, data.FoodLevel)
	PlayerDataManager.UpdatePlayerScale(player)
end

function PlayerDataManager.SetFoodLevel(player, amount)
	local data = PlayerDataManager.GetData(player)
	if not data then return end

	data.FoodLevel = math.max(0, amount)
	Remotes.FoodLevelUpdated:FireClient(player, data.FoodLevel)
	PlayerDataManager.UpdatePlayerScale(player)
end

function PlayerDataManager.AddCoins(player, amount)
	local data = PlayerDataManager.GetData(player)
	if not data then return end

	data.Coins = data.Coins + amount
	Remotes.CoinsUpdated:FireClient(player, data.Coins)
end

function PlayerDataManager.SpendCoins(player, amount)
	local data = PlayerDataManager.GetData(player)
	if not data then return false end

	if data.Coins < amount then
		return false
	end

	data.Coins = data.Coins - amount
	Remotes.CoinsUpdated:FireClient(player, data.Coins)
	return true
end

function PlayerDataManager.UpdatePlayerScale(player)
	local data = PlayerDataManager.GetData(player)
	if not data then return end

	local character = player.Character
	if not character then return end

	local humanoid = character:FindFirstChildOfClass("Humanoid")
	if not humanoid then return end

	local scale = GameConfig.Growth.BaseScale + (data.FoodLevel * GameConfig.Growth.ScalePerFoodLevel)
	scale = math.min(scale, GameConfig.Growth.MaxScale)

	-- Scale the character
	local bodyScale = humanoid:FindFirstChild("BodyWidthScale")
	if bodyScale then bodyScale.Value = scale end
	local bodyHeight = humanoid:FindFirstChild("BodyHeightScale")
	if bodyHeight then bodyHeight.Value = scale end
	local bodyDepth = humanoid:FindFirstChild("BodyDepthScale")
	if bodyDepth then bodyDepth.Value = scale end
	local headScale = humanoid:FindFirstChild("HeadScale")
	if headScale then headScale.Value = scale end
end

function PlayerDataManager.PurchaseUpgrade(player, upgradeName)
	local data = PlayerDataManager.GetData(player)
	if not data then return false, "No data" end

	local upgradeConfig = GameConfig.Upgrades[upgradeName]
	if not upgradeConfig then return false, "Invalid upgrade" end

	local currentLevel = data.Upgrades[upgradeName] or 0
	if currentLevel >= upgradeConfig.MaxLevel then
		return false, "Max level reached"
	end

	local cost = math.floor(upgradeConfig.BaseCost * (upgradeConfig.CostMultiplier ^ currentLevel))
	if not PlayerDataManager.SpendCoins(player, cost) then
		return false, "Not enough coins"
	end

	data.Upgrades[upgradeName] = currentLevel + 1
	Remotes.UpgradeUpdated:FireClient(player, upgradeName, data.Upgrades[upgradeName])

	-- Apply walk speed upgrade immediately
	if upgradeName == "WalkSpeed" then
		local character = player.Character
		if character then
			local humanoid = character:FindFirstChildOfClass("Humanoid")
			if humanoid then
				humanoid.WalkSpeed = 16 + (data.Upgrades.WalkSpeed * GameConfig.Upgrades.WalkSpeed.BonusPerLevel)
			end
		end
	end

	return true
end

function PlayerDataManager.UnlockAttack(player, attackName)
	local data = PlayerDataManager.GetData(player)
	if not data then return false, "No data" end

	-- Find the attack config
	local attackConfig = nil
	for _, attack in ipairs(GameConfig.Attacks) do
		if attack.Name == attackName then
			attackConfig = attack
			break
		end
	end

	if not attackConfig then return false, "Invalid attack" end

	-- Check if already unlocked
	for _, name in ipairs(data.UnlockedAttacks) do
		if name == attackName then
			return false, "Already unlocked"
		end
	end

	-- Check food level requirement
	if data.FoodLevel < attackConfig.RequiredFoodLevel then
		return false, "Need food level " .. attackConfig.RequiredFoodLevel
	end

	-- Check cost
	if not PlayerDataManager.SpendCoins(player, attackConfig.UnlockCost) then
		return false, "Not enough coins"
	end

	table.insert(data.UnlockedAttacks, attackName)
	Remotes.AttackUnlocked:FireClient(player, attackName)
	return true
end

-- Player join / leave
local function onPlayerAdded(player)
	-- Deep copy default data
	local data = {}
	for key, value in pairs(DEFAULT_DATA) do
		if type(value) == "table" then
			if value[1] then -- array
				data[key] = {}
				for i, v in ipairs(value) do data[key][i] = v end
			else -- dictionary
				data[key] = {}
				for k, v in pairs(value) do data[key][k] = v end
			end
		else
			data[key] = value
		end
	end

	PlayerDataManager.Data[player.UserId] = data

	-- TODO: Load saved data from DataStore here

	-- When character spawns, apply scale and walk speed
	player.CharacterAdded:Connect(function(character)
		character:WaitForChild("Humanoid")
		task.wait(0.5)
		PlayerDataManager.UpdatePlayerScale(player)

		local humanoid = character:FindFirstChildOfClass("Humanoid")
		if humanoid and data.Upgrades.WalkSpeed > 0 then
			humanoid.WalkSpeed = 16 + (data.Upgrades.WalkSpeed * GameConfig.Upgrades.WalkSpeed.BonusPerLevel)
		end
	end)
end

local function onPlayerRemoving(player)
	-- TODO: Save data to DataStore here
	PlayerDataManager.Data[player.UserId] = nil
end

Players.PlayerAdded:Connect(onPlayerAdded)
Players.PlayerRemoving:Connect(onPlayerRemoving)

-- Handle existing players (in case script loads late)
for _, player in ipairs(Players:GetPlayers()) do
	task.spawn(onPlayerAdded, player)
end

-- Remote function: client requests their data
Remotes.GetPlayerData.OnServerInvoke = function(player)
	return PlayerDataManager.GetData(player)
end

-- Remote: purchase upgrade
Remotes.PurchaseUpgrade.OnServerEvent:Connect(function(player, upgradeName)
	PlayerDataManager.PurchaseUpgrade(player, upgradeName)
end)

-- Remote: unlock attack
Remotes.UnlockAttack.OnServerEvent:Connect(function(player, attackName)
	PlayerDataManager.UnlockAttack(player, attackName)
end)

return PlayerDataManager
