-- IngredientSpawner.lua
-- Spawns ingredient pickups around the map at designated spawn points

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Workspace = game:GetService("Workspace")
local GameConfig = require(ReplicatedStorage:WaitForChild("GameConfig"))
local Remotes = require(ReplicatedStorage:WaitForChild("RemoteEvents"))

local IngredientSpawner = {}

local activeIngredients = {} -- tracks all spawned ingredient parts
local spawnPoints = {}       -- references to spawn point parts in workspace

-- Weighted random selection
local function pickRandomIngredient()
	local totalWeight = 0
	for _, ingredient in ipairs(GameConfig.Ingredients) do
		totalWeight = totalWeight + ingredient.SpawnWeight
	end

	local roll = math.random() * totalWeight
	local cumulative = 0
	for _, ingredient in ipairs(GameConfig.Ingredients) do
		cumulative = cumulative + ingredient.SpawnWeight
		if roll <= cumulative then
			return ingredient
		end
	end
	return GameConfig.Ingredients[1]
end

-- Create a visible ingredient part in the world
local function createIngredientPart(ingredient, position)
	local part = Instance.new("Part")
	part.Name = "Ingredient_" .. ingredient.Name
	part.Size = Vector3.new(2, 2, 2)
	part.Position = position + Vector3.new(0, 2, 0)
	part.Anchored = true
	part.CanCollide = false
	part.Shape = Enum.PartType.Ball

	-- Color by rarity
	if ingredient.Rarity == "Common" then
		part.BrickColor = BrickColor.new("Bright green")
	elseif ingredient.Rarity == "Uncommon" then
		part.BrickColor = BrickColor.new("Bright blue")
	elseif ingredient.Rarity == "Rare" then
		part.BrickColor = BrickColor.new("Bright yellow")
	end

	-- Floating effect
	local bodyPos = Instance.new("BodyPosition")
	bodyPos.MaxForce = Vector3.new(0, math.huge, 0)
	bodyPos.Position = part.Position + Vector3.new(0, 1, 0)
	bodyPos.D = 100
	bodyPos.Parent = part

	-- Billboard label
	local billboard = Instance.new("BillboardGui")
	billboard.Size = UDim2.new(0, 100, 0, 40)
	billboard.StudsOffset = Vector3.new(0, 3, 0)
	billboard.AlwaysOnTop = true
	billboard.Parent = part

	local label = Instance.new("TextLabel")
	label.Size = UDim2.new(1, 0, 1, 0)
	label.BackgroundTransparency = 1
	label.Text = ingredient.Name
	label.TextColor3 = Color3.new(1, 1, 1)
	label.TextStrokeTransparency = 0
	label.Font = Enum.Font.GothamBold
	label.TextScaled = true
	label.Parent = billboard

	-- Store ingredient data on the part
	local nameVal = Instance.new("StringValue")
	nameVal.Name = "IngredientName"
	nameVal.Value = ingredient.Name
	nameVal.Parent = part

	part.Parent = Workspace:FindFirstChild("Ingredients") or Workspace

	return part
end

-- Initialize spawn points from workspace
function IngredientSpawner.Init()
	-- Look for a folder called "IngredientSpawns" in workspace
	local spawnsFolder = Workspace:FindFirstChild("IngredientSpawns")
	if spawnsFolder then
		for _, point in ipairs(spawnsFolder:GetChildren()) do
			if point:IsA("BasePart") then
				table.insert(spawnPoints, point.Position)
			end
		end
	end

	-- If no spawn points exist, create default ones in a grid
	if #spawnPoints == 0 then
		for x = -100, 100, 25 do
			for z = -100, 100, 25 do
				table.insert(spawnPoints, Vector3.new(x, 5, z))
			end
		end
	end

	-- Create ingredients folder
	if not Workspace:FindFirstChild("Ingredients") then
		local folder = Instance.new("Folder")
		folder.Name = "Ingredients"
		folder.Parent = Workspace
	end
end

function IngredientSpawner.SpawnOne()
	if #activeIngredients >= GameConfig.Spawning.MaxIngredientsOnMap then
		return
	end

	local position = spawnPoints[math.random(1, #spawnPoints)]
	-- Add slight random offset so they don't stack
	position = position + Vector3.new(math.random(-5, 5), 0, math.random(-5, 5))

	local ingredient = pickRandomIngredient()
	local part = createIngredientPart(ingredient, position)

	table.insert(activeIngredients, part)
end

function IngredientSpawner.RemoveIngredient(part)
	for i, p in ipairs(activeIngredients) do
		if p == part then
			table.remove(activeIngredients, i)
			part:Destroy()

			-- Respawn after delay
			task.delay(GameConfig.Spawning.RespawnDelaySeconds, function()
				IngredientSpawner.SpawnOne()
			end)
			break
		end
	end
end

-- Start the spawning loop
function IngredientSpawner.Start()
	IngredientSpawner.Init()

	-- Initial batch spawn
	for _ = 1, math.min(20, GameConfig.Spawning.MaxIngredientsOnMap) do
		IngredientSpawner.SpawnOne()
	end

	-- Continuous spawning
	task.spawn(function()
		while true do
			task.wait(GameConfig.Spawning.SpawnIntervalSeconds)
			IngredientSpawner.SpawnOne()
		end
	end)
end

-- Handle collection requests from clients
Remotes.CollectIngredient.OnServerEvent:Connect(function(player, ingredientPart)
	if not ingredientPart or not ingredientPart.Parent then return end
	if not ingredientPart:FindFirstChild("IngredientName") then return end

	-- Validate distance (server-side check using player's collect range)
	local character = player.Character
	if not character then return end
	local rootPart = character:FindFirstChild("HumanoidRootPart")
	if not rootPart then return end

	local PlayerDataManager = require(script.Parent:WaitForChild("PlayerDataManager"))
	local collectRange = PlayerDataManager.GetCollectRange(player)

	local distance = (rootPart.Position - ingredientPart.Position).Magnitude
	if distance > collectRange + 5 then return end -- +5 tolerance

	local ingredientName = ingredientPart.IngredientName.Value

	-- Pet multiplier: equipped pet multiplies how many times the ingredient is added
	local petMultiplier = PlayerDataManager.GetPickupMultiplier(player)
	local pickupCount = math.floor(petMultiplier)
	-- Handle fractional multiplier with random chance
	local fractional = petMultiplier - pickupCount
	if fractional > 0 and math.random() < fractional then
		pickupCount = pickupCount + 1
	end

	local success = false
	for _ = 1, pickupCount do
		if PlayerDataManager.AddToBackpack(player, ingredientName) then
			success = true
		else
			break -- backpack full
		end
	end

	if success then
		IngredientSpawner.RemoveIngredient(ingredientPart)
	end
end)

IngredientSpawner.Start()

return IngredientSpawner
