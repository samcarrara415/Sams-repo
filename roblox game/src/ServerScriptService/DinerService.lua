-- DinerService.lua
-- Handles the Diner: players can COOK ingredients into food (growth) or SELL for coins

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local GameConfig = require(ReplicatedStorage:WaitForChild("GameConfig"))
local Remotes = require(ReplicatedStorage:WaitForChild("RemoteEvents"))

local DinerService = {}

local cookingPlayers = {} -- tracks who is currently cooking

-- Find ingredient config by name
local function getIngredientConfig(name)
	for _, ingredient in ipairs(GameConfig.Ingredients) do
		if ingredient.Name == name then
			return ingredient
		end
	end
	return nil
end

-- Cook: convert backpack ingredients into food (makes you fatter/chudded)
Remotes.CookIngredients.OnServerEvent:Connect(function(player)
	if cookingPlayers[player.UserId] then return end -- already cooking

	local PlayerDataManager = require(script.Parent:WaitForChild("PlayerDataManager"))
	local data = PlayerDataManager.GetData(player)
	if not data then return end

	local backpackItems = data.Backpack
	if #backpackItems == 0 then return end

	cookingPlayers[player.UserId] = true
	Remotes.ChefCookingStarted:FireClient(player)

	-- Determine cook time (VIP chef booster halves it)
	local cookTime = GameConfig.Diner.CookTimeSeconds
	if data.ActiveBoosters.VIPChef and tick() < data.ActiveBoosters.VIPChef then
		cookTime = cookTime * GameConfig.Gamepasses.VIPChef.CookTimeMultiplier
	end

	task.wait(cookTime)

	-- Calculate total food value
	local totalFood = 0
	local items = PlayerDataManager.ClearBackpack(player)

	for _, itemName in ipairs(items) do
		local config = getIngredientConfig(itemName)
		if config then
			totalFood = totalFood + config.FoodValue
		end
	end

	-- Full backpack bonus
	if #items >= GameConfig.Diner.FullBackpackThreshold then
		totalFood = math.floor(totalFood * GameConfig.Diner.BonusMultiplier)
	end

	-- Growth booster (2x food from chef)
	if data.ActiveBoosters.GrowthBooster and tick() < data.ActiveBoosters.GrowthBooster then
		totalFood = math.floor(totalFood * GameConfig.Gamepasses.GrowthBooster.Multiplier)
	end

	-- VIP chef bonus food
	if data.ActiveBoosters.VIPChef and tick() < data.ActiveBoosters.VIPChef then
		totalFood = math.floor(totalFood * (1 + GameConfig.Gamepasses.VIPChef.BonusFoodPercent))
	end

	PlayerDataManager.AddFoodLevel(player, totalFood)

	cookingPlayers[player.UserId] = nil
	Remotes.ChefCookingDone:FireClient(player, totalFood, data.FoodLevel)
end)

-- Sell: convert backpack ingredients into coins (for upgrades)
Remotes.SellForCoins.OnServerEvent:Connect(function(player)
	if cookingPlayers[player.UserId] then return end

	local PlayerDataManager = require(script.Parent:WaitForChild("PlayerDataManager"))
	local data = PlayerDataManager.GetData(player)
	if not data then return end

	if #data.Backpack == 0 then return end

	local totalCoins = 0
	local items = PlayerDataManager.ClearBackpack(player)

	for _, itemName in ipairs(items) do
		local config = getIngredientConfig(itemName)
		if config then
			totalCoins = totalCoins + config.CoinValue
		end
	end

	-- Coin booster
	if data.ActiveBoosters.CoinBooster and tick() < data.ActiveBoosters.CoinBooster then
		totalCoins = math.floor(totalCoins * GameConfig.Gamepasses.CoinBooster.Multiplier)
	end

	PlayerDataManager.AddCoins(player, totalCoins)

	-- Reuse cooking done event to notify client
	Remotes.CoinsUpdated:FireClient(player, data.Coins)
end)

return DinerService
