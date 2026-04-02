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
	OwnedPets = {},                    -- array of {Name, Rarity, PickupMultiplier}
	EquippedPet = nil,                 -- currently active pet name (or nil)
	Rebirths = 0,                      -- number of rebirths completed
	DuelWins = 0,                      -- total battle arena wins
	TotalRobuxSpent = 0,               -- total Robux spent in shop
	CurrentWorld = 1,                  -- which world they're in (index)
	WorldUpgrades = {},                -- {["WorldName_UpgradeName"] = level}
}

function PlayerDataManager.GetData(player)
	return PlayerDataManager.Data[player.UserId]
end

-- Get the rebirth multiplier: 1.0 + (rebirths * 0.02)
function PlayerDataManager.GetRebirthMultiplier(player)
	local data = PlayerDataManager.GetData(player)
	if not data then return 1.0 end
	return 1.0 + (data.Rebirths * GameConfig.Rebirth.BoostPerRebirth)
end

-- Get food required for next rebirth
function PlayerDataManager.GetRebirthCost(player)
	local data = PlayerDataManager.GetData(player)
	if not data then return GameConfig.Rebirth.BaseFoodRequired end
	return math.floor(GameConfig.Rebirth.BaseFoodRequired * (GameConfig.Rebirth.FoodMultiplierPerRebirth ^ data.Rebirths))
end

-- Perform a rebirth
function PlayerDataManager.DoRebirth(player)
	local data = PlayerDataManager.GetData(player)
	if not data then return false, "No data" end

	if data.Rebirths >= GameConfig.Rebirth.MaxRebirths then
		return false, "Max rebirths reached"
	end

	local cost = PlayerDataManager.GetRebirthCost(player)
	if data.FoodLevel < cost then
		return false, "Need " .. cost .. " food to rebirth"
	end

	-- Increment rebirth count
	data.Rebirths = data.Rebirths + 1

	-- Reset food
	if GameConfig.Rebirth.ResetsFood then
		data.FoodLevel = 0
		Remotes.FoodLevelUpdated:FireClient(player, 0)
		PlayerDataManager.UpdatePlayerScale(player)
	end

	-- Reset upgrades
	if GameConfig.Rebirth.ResetsUpgrades then
		for upgradeName, _ in pairs(data.Upgrades) do
			data.Upgrades[upgradeName] = 0
		end
		-- Reset walk speed
		local character = player.Character
		if character then
			local humanoid = character:FindFirstChildOfClass("Humanoid")
			if humanoid then
				humanoid.WalkSpeed = 16
			end
		end
	end

	-- Clear backpack
	data.Backpack = {}
	Remotes.BackpackUpdated:FireClient(player, data.Backpack)

	-- Notify client
	Remotes.RebirthComplete:FireClient(player, {
		NewRebirthCount = data.Rebirths,
		NewMultiplier = PlayerDataManager.GetRebirthMultiplier(player),
		NextCost = PlayerDataManager.GetRebirthCost(player),
	})

	return true
end

function PlayerDataManager.AddDuelWin(player)
	local data = PlayerDataManager.GetData(player)
	if not data then return end
	data.DuelWins = data.DuelWins + 1
end

function PlayerDataManager.AddRobuxSpent(player, amount)
	local data = PlayerDataManager.GetData(player)
	if not data then return end
	data.TotalRobuxSpent = data.TotalRobuxSpent + amount
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

-- Get current world config for a player
function PlayerDataManager.GetCurrentWorld(player)
	local data = PlayerDataManager.GetData(player)
	if not data then return GameConfig.Worlds[1] end
	return GameConfig.Worlds[data.CurrentWorld] or GameConfig.Worlds[1]
end

-- Get world upgrade level
function PlayerDataManager.GetWorldUpgradeLevel(player, worldName, upgradeName)
	local data = PlayerDataManager.GetData(player)
	if not data then return 0 end
	local key = worldName .. "_" .. upgradeName
	return data.WorldUpgrades[key] or 0
end

-- Get total bonus from world upgrades of a specific type
function PlayerDataManager.GetWorldUpgradeBonus(player, boostType)
	local data = PlayerDataManager.GetData(player)
	if not data then return 0 end

	local totalBonus = 0
	for _, world in ipairs(GameConfig.Worlds) do
		if world.Upgrades then
			for upgName, upgConfig in pairs(world.Upgrades) do
				if upgConfig.BoostType == boostType then
					local key = world.Name .. "_" .. upgName
					local level = data.WorldUpgrades[key] or 0
					totalBonus = totalBonus + (level * upgConfig.BonusPerLevel)
				end
			end
		end
	end
	return totalBonus
end

-- Purchase a world-specific upgrade
function PlayerDataManager.PurchaseWorldUpgrade(player, worldIndex, upgradeName)
	local data = PlayerDataManager.GetData(player)
	if not data then return false, "No data" end

	local world = GameConfig.Worlds[worldIndex]
	if not world then return false, "Invalid world" end
	if not world.Upgrades or not world.Upgrades[upgradeName] then
		return false, "Invalid upgrade"
	end

	-- Must have enough rebirths to access this world
	if data.Rebirths < world.RequiredRebirths then
		return false, "Need " .. world.RequiredRebirths .. " rebirths"
	end

	local config = world.Upgrades[upgradeName]
	local key = world.Name .. "_" .. upgradeName
	local currentLevel = data.WorldUpgrades[key] or 0

	if currentLevel >= config.MaxLevel then
		return false, "Max level reached"
	end

	local cost = math.floor(config.BaseCost * (config.CostMultiplier ^ currentLevel))
	if not PlayerDataManager.SpendCoins(player, cost) then
		return false, "Not enough coins"
	end

	data.WorldUpgrades[key] = currentLevel + 1
	Remotes.WorldUpgradeUpdated:FireClient(player, worldIndex, upgradeName, data.WorldUpgrades[key])
	return true
end

-- Switch world
function PlayerDataManager.SetWorld(player, worldIndex)
	local data = PlayerDataManager.GetData(player)
	if not data then return false end

	local world = GameConfig.Worlds[worldIndex]
	if not world then return false end
	if data.Rebirths < world.RequiredRebirths then return false end

	data.CurrentWorld = worldIndex
	Remotes.WorldChanged:FireClient(player, worldIndex, world.Name)
	return true
end

function PlayerDataManager.GetCollectRange(player)
	local data = PlayerDataManager.GetData(player)
	if not data then return GameConfig.Collection.BaseCollectRange end

	local base = GameConfig.Collection.BaseCollectRange
	local upgradeLevel = data.Upgrades.CollectRange
	local bonus = upgradeLevel * GameConfig.Upgrades.CollectRange.BonusPerLevel
	-- Add world upgrade bonus (CollectRange type)
	local worldBonus = PlayerDataManager.GetWorldUpgradeBonus(player, "CollectRange")
	return base + bonus + worldBonus
end

function PlayerDataManager.GetCollectSpeed(player)
	local data = PlayerDataManager.GetData(player)
	if not data then return GameConfig.Collection.BaseCollectSpeed end

	local base = GameConfig.Collection.BaseCollectSpeed
	local upgradeLevel = data.Upgrades.CollectSpeed
	local bonus = upgradeLevel * GameConfig.Upgrades.CollectSpeed.BonusPerLevel
	-- Add world upgrade bonus (CollectSpeed type)
	local worldBonus = PlayerDataManager.GetWorldUpgradeBonus(player, "CollectSpeed")
	return base + bonus + worldBonus
end

-- Get total food value multiplier from world kitchen tool upgrades
function PlayerDataManager.GetFoodValueMultiplier(player)
	return 1.0 + PlayerDataManager.GetWorldUpgradeBonus(player, "FoodValue")
end

-- Get total coin value multiplier from world kitchen tool upgrades
function PlayerDataManager.GetCoinValueMultiplier(player)
	return 1.0 + PlayerDataManager.GetWorldUpgradeBonus(player, "CoinValue")
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

	-- Apply rebirth multiplier
	local rebirthMult = PlayerDataManager.GetRebirthMultiplier(player)
	local boostedAmount = math.floor(amount * rebirthMult)

	data.FoodLevel = data.FoodLevel + boostedAmount
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

	-- Apply rebirth multiplier to coin gains
	local rebirthMult = PlayerDataManager.GetRebirthMultiplier(player)
	local boostedAmount = math.floor(amount * rebirthMult)

	data.Coins = data.Coins + boostedAmount
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

function PlayerDataManager.GetPickupMultiplier(player)
	local data = PlayerDataManager.GetData(player)
	if not data then return 1.0 end
	if not data.EquippedPet then return 1.0 end

	-- Find the equipped pet's multiplier
	for _, pet in ipairs(data.OwnedPets) do
		if pet.Name == data.EquippedPet then
			return pet.PickupMultiplier
		end
	end
	return 1.0
end

function PlayerDataManager.AddPet(player, petData)
	local data = PlayerDataManager.GetData(player)
	if not data then return end

	table.insert(data.OwnedPets, {
		Name = petData.Name,
		Rarity = petData.Rarity,
		PickupMultiplier = petData.PickupMultiplier,
	})
	Remotes.PetsUpdated:FireClient(player, data.OwnedPets, data.EquippedPet)
end

function PlayerDataManager.EquipPet(player, petName)
	local data = PlayerDataManager.GetData(player)
	if not data then return false end

	if petName == nil then
		data.EquippedPet = nil
		Remotes.PetEquipped:FireClient(player, nil)
		return true
	end

	-- Verify they own it
	for _, pet in ipairs(data.OwnedPets) do
		if pet.Name == petName then
			data.EquippedPet = petName
			Remotes.PetEquipped:FireClient(player, petName)
			return true
		end
	end
	return false
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

-- Remote: equip pet
Remotes.EquipPet.OnServerEvent:Connect(function(player, petName)
	PlayerDataManager.EquipPet(player, petName)
end)

-- Remote: rebirth
Remotes.RequestRebirth.OnServerEvent:Connect(function(player)
	PlayerDataManager.DoRebirth(player)
end)

-- Remote: select world
Remotes.SelectWorld.OnServerEvent:Connect(function(player, worldIndex)
	PlayerDataManager.SetWorld(player, worldIndex)
end)

-- Remote: purchase world upgrade
Remotes.PurchaseWorldUpgrade.OnServerEvent:Connect(function(player, worldIndex, upgradeName)
	PlayerDataManager.PurchaseWorldUpgrade(player, worldIndex, upgradeName)
end)

return PlayerDataManager
