-- PetClient.lua
-- Client script: handles pet display following the player

local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Remotes = require(ReplicatedStorage:WaitForChild("RemoteEvents"))

local player = Players.LocalPlayer
local equippedPetName = nil
local petModel = nil

-- Rarity colors for pet orb
local rarityColors = {
	Common = Color3.fromRGB(150, 255, 150),
	Uncommon = Color3.fromRGB(100, 150, 255),
	Rare = Color3.fromRGB(255, 215, 0),
	Legendary = Color3.fromRGB(255, 80, 255),
}

-- Create a visual pet that follows the player
local function createPetVisual(petName, rarity)
	-- Remove old pet
	if petModel then
		petModel:Destroy()
		petModel = nil
	end

	if not petName then return end

	local character = player.Character
	if not character then return end

	local part = Instance.new("Part")
	part.Name = "Pet_" .. petName
	part.Size = Vector3.new(2.5, 2.5, 2.5)
	part.Shape = Enum.PartType.Ball
	part.Material = Enum.Material.Neon
	part.BrickColor = BrickColor.new(rarityColors[rarity] or Color3.new(1, 1, 1))
	part.Color = rarityColors[rarity] or Color3.new(1, 1, 1)
	part.CanCollide = false
	part.Anchored = true
	part.Parent = character

	-- Pet name label
	local billboard = Instance.new("BillboardGui")
	billboard.Size = UDim2.new(0, 120, 0, 40)
	billboard.StudsOffset = Vector3.new(0, 2.5, 0)
	billboard.AlwaysOnTop = true
	billboard.Parent = part

	local label = Instance.new("TextLabel")
	label.Size = UDim2.new(1, 0, 1, 0)
	label.BackgroundTransparency = 1
	label.Text = petName
	label.TextColor3 = rarityColors[rarity] or Color3.new(1, 1, 1)
	label.TextStrokeTransparency = 0
	label.Font = Enum.Font.GothamBold
	label.TextScaled = true
	label.Parent = billboard

	petModel = part

	-- Make pet float and follow player
	local offset = Vector3.new(3, 3, 3)
	RunService.Heartbeat:Connect(function()
		if not petModel or not petModel.Parent then return end
		local rootPart = character:FindFirstChild("HumanoidRootPart")
		if not rootPart then return end

		local targetPos = rootPart.Position + offset
		petModel.CFrame = petModel.CFrame:Lerp(CFrame.new(targetPos), 0.1)
	end)
end

-- Pet equipped
Remotes.PetEquipped.OnClientEvent:Connect(function(petName)
	equippedPetName = petName
	if petName then
		-- Find rarity from owned pets
		local data = Remotes.GetPlayerData:InvokeServer()
		if data then
			for _, pet in ipairs(data.OwnedPets) do
				if pet.Name == petName then
					createPetVisual(petName, pet.Rarity)
					break
				end
			end
		end
	else
		createPetVisual(nil, nil)
	end
end)

-- Recreate pet on respawn
player.CharacterAdded:Connect(function()
	task.wait(1)
	if equippedPetName then
		local data = Remotes.GetPlayerData:InvokeServer()
		if data then
			for _, pet in ipairs(data.OwnedPets) do
				if pet.Name == equippedPetName then
					createPetVisual(equippedPetName, pet.Rarity)
					break
				end
			end
		end
	end
end)

-- Load initial pet on join
task.spawn(function()
	task.wait(2)
	local data = Remotes.GetPlayerData:InvokeServer()
	if data and data.EquippedPet then
		equippedPetName = data.EquippedPet
		for _, pet in ipairs(data.OwnedPets) do
			if pet.Name == equippedPetName then
				createPetVisual(equippedPetName, pet.Rarity)
				break
			end
		end
	end
end)
