-- RemoteEvents.lua
-- Creates and returns all RemoteEvents / RemoteFunctions used by the game

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local function getOrCreate(className, name, parent)
	local existing = parent:FindFirstChild(name)
	if existing then
		return existing
	end
	local obj = Instance.new(className)
	obj.Name = name
	obj.Parent = parent
	return obj
end

local folder = getOrCreate("Folder", "GameRemotes", ReplicatedStorage)

local Remotes = {}

-- Ingredient collection
Remotes.CollectIngredient = getOrCreate("RemoteEvent", "CollectIngredient", folder)

-- Backpack
Remotes.BackpackUpdated = getOrCreate("RemoteEvent", "BackpackUpdated", folder)

-- Diner / Chef
Remotes.CookIngredients = getOrCreate("RemoteEvent", "CookIngredients", folder)       -- cook backpack into food
Remotes.SellForCoins = getOrCreate("RemoteEvent", "SellForCoins", folder)              -- sell backpack for coins
Remotes.ChefCookingStarted = getOrCreate("RemoteEvent", "ChefCookingStarted", folder)
Remotes.ChefCookingProgress = getOrCreate("RemoteEvent", "ChefCookingProgress", folder)
Remotes.ChefCookingDone = getOrCreate("RemoteEvent", "ChefCookingDone", folder)
Remotes.SkipCookQueue = getOrCreate("RemoteEvent", "SkipCookQueue", folder)

-- Growth
Remotes.FoodLevelUpdated = getOrCreate("RemoteEvent", "FoodLevelUpdated", folder)

-- Coins
Remotes.CoinsUpdated = getOrCreate("RemoteEvent", "CoinsUpdated", folder)

-- Upgrades
Remotes.PurchaseUpgrade = getOrCreate("RemoteEvent", "PurchaseUpgrade", folder)
Remotes.UpgradeUpdated = getOrCreate("RemoteEvent", "UpgradeUpdated", folder)

-- Attacks
Remotes.UnlockAttack = getOrCreate("RemoteEvent", "UnlockAttack", folder)
Remotes.AttackUnlocked = getOrCreate("RemoteEvent", "AttackUnlocked", folder)
Remotes.UseAttack = getOrCreate("RemoteEvent", "UseAttack", folder)
Remotes.AttackHit = getOrCreate("RemoteEvent", "AttackHit", folder)

-- Battle Arena
Remotes.JoinBattleQueue = getOrCreate("RemoteEvent", "JoinBattleQueue", folder)
Remotes.LeaveBattleQueue = getOrCreate("RemoteEvent", "LeaveBattleQueue", folder)
Remotes.BattleStarted = getOrCreate("RemoteEvent", "BattleStarted", folder)
Remotes.BattleEnded = getOrCreate("RemoteEvent", "BattleEnded", folder)
Remotes.BattleDamage = getOrCreate("RemoteEvent", "BattleDamage", folder)
Remotes.BattleHealthUpdated = getOrCreate("RemoteEvent", "BattleHealthUpdated", folder)

-- Pets / Togo Containers
Remotes.OpenTogoContainer = getOrCreate("RemoteEvent", "OpenTogoContainer", folder)
Remotes.TogoOpening = getOrCreate("RemoteEvent", "TogoOpening", folder)
Remotes.PetHatched = getOrCreate("RemoteEvent", "PetHatched", folder)
Remotes.EquipPet = getOrCreate("RemoteEvent", "EquipPet", folder)
Remotes.PetEquipped = getOrCreate("RemoteEvent", "PetEquipped", folder)
Remotes.PetsUpdated = getOrCreate("RemoteEvent", "PetsUpdated", folder)

-- Shop / Gamepasses
Remotes.PurchaseBooster = getOrCreate("RemoteEvent", "PurchaseBooster", folder)
Remotes.BoosterActivated = getOrCreate("RemoteEvent", "BoosterActivated", folder)
Remotes.PurchaseCoinPack = getOrCreate("RemoteEvent", "PurchaseCoinPack", folder)

-- Player data sync
Remotes.GetPlayerData = getOrCreate("RemoteFunction", "GetPlayerData", folder)

return Remotes
