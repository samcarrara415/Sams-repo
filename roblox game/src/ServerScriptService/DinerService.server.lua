-- DinerService.lua
-- Handles the Diner: players can COOK ingredients into food (growth) or SELL for coins
-- Cook time scales with ingredient count. Skip Queue gamepass skips the wait.

local MarketplaceService = game:GetService("MarketplaceService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local GameConfig = require(ReplicatedStorage:WaitForChild("GameConfig"))
local Remotes = require(ReplicatedStorage:WaitForChild("RemoteEvents"))

local DinerService = {}

local cookingPlayers = {}    -- tracks who is currently cooking
local skipQueueOwners = {}   -- [userId] = true if they own the skip queue pass

-- Find ingredient config by name
local function getIngredientConfig(name)
	for _, ingredient in ipairs(GameConfig.Ingredients) do
		if ingredient.Name == name then
			return ingredient
		end
	end
	return nil
end

-- Calculate cook time based on ingredient count
local function calculateCookTime(player, ingredientCount)
	local PlayerDataManager = require(script.Parent:WaitForChild("PlayerDataManager"))
	local data = PlayerDataManager.GetData(player)

	-- Skip queue owners cook instantly
	if skipQueueOwners[player.UserId] then
		return 0
	end

	local cookTime = GameConfig.Diner.BaseCookTimeSeconds
		+ (ingredientCount * GameConfig.Diner.CookTimePerIngredient)

	-- Cap at max
	cookTime = math.min(cookTime, GameConfig.Diner.MaxCookTimeSeconds)

	-- VIP chef booster halves cook time
	if data and data.ActiveBoosters.VIPChef and tick() < data.ActiveBoosters.VIPChef then
		cookTime = cookTime * GameConfig.Gamepasses.VIPChef.CookTimeMultiplier
	end

	return cookTime
end

-- Trigger chef cooking animation (skillet flip)
local function triggerChefAnimation(cookTime)
	local chef = game.Workspace:FindFirstChild("ChefNPC")
	if not chef then return end

	local humanoid = chef:FindFirstChildOfClass("Humanoid")
	if not humanoid then return end

	-- Look for the cooking animation
	local cookAnim = chef:FindFirstChild("CookAnimation")
	if cookAnim and cookAnim:IsA("Animation") then
		local track = humanoid:LoadAnimation(cookAnim)
		track.Looped = true
		track:Play()

		-- Stop after cook time
		task.delay(cookTime, function()
			track:Stop()
		end)
	end

	-- Skillet flip effect: move the skillet part up and down
	local skillet = chef:FindFirstChild("Skillet")
	if skillet and skillet:IsA("BasePart") then
		task.spawn(function()
			local originalPos = skillet.Position
			local flipCount = math.max(1, math.floor(cookTime / 2))
			for i = 1, flipCount do
				-- Flip up
				for t = 0, 1, 0.05 do
					if not skillet or not skillet.Parent then return end
					local height = math.sin(t * math.pi) * 5
					local rotation = t * 360
					skillet.CFrame = CFrame.new(originalPos + Vector3.new(0, height, 0))
						* CFrame.Angles(0, 0, math.rad(rotation))
					task.wait(0.02)
				end
				skillet.CFrame = CFrame.new(originalPos)
				task.wait(0.3)
			end
			skillet.CFrame = CFrame.new(originalPos)
		end)
	end
end

-- Cook: convert backpack ingredients into food (makes you fatter/chudded)
Remotes.CookIngredients.OnServerEvent:Connect(function(player)
	if cookingPlayers[player.UserId] then return end -- already cooking

	local PlayerDataManager = require(script.Parent:WaitForChild("PlayerDataManager"))
	local data = PlayerDataManager.GetData(player)
	if not data then return end

	local backpackItems = data.Backpack
	if #backpackItems == 0 then return end

	local ingredientCount = #backpackItems
	local cookTime = calculateCookTime(player, ingredientCount)

	cookingPlayers[player.UserId] = true

	-- Tell client cooking has started (with time so UI can show countdown)
	Remotes.ChefCookingStarted:FireClient(player, cookTime, ingredientCount)

	-- Trigger chef NPC animation
	triggerChefAnimation(cookTime)

	-- Wait for cooking (send progress updates)
	if cookTime > 0 then
		local elapsed = 0
		local updateInterval = 1
		while elapsed < cookTime do
			task.wait(updateInterval)
			elapsed = elapsed + updateInterval
			local remaining = math.max(0, cookTime - elapsed)
			Remotes.ChefCookingProgress:FireClient(player, remaining, cookTime)
		end
	end

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

-- Skip Cook Queue purchase
Remotes.SkipCookQueue.OnServerEvent:Connect(function(player)
	local passConfig = GameConfig.Gamepasses.SkipQueue
	if not passConfig then return end

	if skipQueueOwners[player.UserId] then return end -- already owns it

	if passConfig.GamepassId == 0 then
		-- Dev mode: grant for free
		skipQueueOwners[player.UserId] = true
		return
	end

	MarketplaceService:PromptGamePassPurchase(player, passConfig.GamepassId)
end)

-- Check if player already owns the skip queue pass on join
game:GetService("Players").PlayerAdded:Connect(function(player)
	local passConfig = GameConfig.Gamepasses.SkipQueue
	if passConfig and passConfig.GamepassId > 0 then
		local owns = MarketplaceService:UserOwnsGamePassAsync(player.UserId, passConfig.GamepassId)
		if owns then
			skipQueueOwners[player.UserId] = true
		end
	end
end)

-- Listen for skip queue purchase completion
MarketplaceService.PromptGamePassPurchaseFinished:Connect(function(player, gamePassId, wasPurchased)
	if not wasPurchased then return end
	local passConfig = GameConfig.Gamepasses.SkipQueue
	if passConfig and gamePassId == passConfig.GamepassId then
		skipQueueOwners[player.UserId] = true
	end
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
	Remotes.CoinsUpdated:FireClient(player, data.Coins)
end)

return DinerService
