-- PetService.lua
-- Handles Togo Container opening and pet hatching

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local GameConfig = require(ReplicatedStorage:WaitForChild("GameConfig"))
local Remotes = require(ReplicatedStorage:WaitForChild("RemoteEvents"))

local PetService = {}

local openingPlayers = {} -- prevent double-opens

-- Weighted random pet selection from a container
local function rollPet(container)
	local totalWeight = 0
	for _, pet in ipairs(container.Pets) do
		totalWeight = totalWeight + pet.Weight
	end

	local roll = math.random() * totalWeight
	local cumulative = 0
	for _, pet in ipairs(container.Pets) do
		cumulative = cumulative + pet.Weight
		if roll <= cumulative then
			return pet
		end
	end
	return container.Pets[1]
end

-- Find container config by name
local function getContainerConfig(containerName)
	for _, container in ipairs(GameConfig.TogoContainers) do
		if container.Name == containerName then
			return container
		end
	end
	return nil
end

-- Open a Togo Container
Remotes.OpenTogoContainer.OnServerEvent:Connect(function(player, containerName)
	if openingPlayers[player.UserId] then return end

	local container = getContainerConfig(containerName)
	if not container then return end

	local PlayerDataManager = require(script.Parent:WaitForChild("PlayerDataManager"))
	local data = PlayerDataManager.GetData(player)
	if not data then return end

	-- Pay with coins
	if not PlayerDataManager.SpendCoins(player, container.Cost) then
		return
	end

	openingPlayers[player.UserId] = true
	Remotes.TogoOpening:FireClient(player, containerName)

	-- Opening animation time
	task.wait(container.OpenTimeSeconds)

	-- Roll for a pet
	local rolledPet = rollPet(container)

	-- Add pet to player's collection
	PlayerDataManager.AddPet(player, rolledPet)

	-- Notify client with hatched pet info
	Remotes.PetHatched:FireClient(player, {
		Name = rolledPet.Name,
		Rarity = rolledPet.Rarity,
		PickupMultiplier = rolledPet.PickupMultiplier,
		ContainerName = containerName,
	})

	openingPlayers[player.UserId] = nil
end)

return PetService
