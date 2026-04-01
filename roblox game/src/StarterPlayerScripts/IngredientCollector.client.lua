-- IngredientCollector.lua
-- Client script: detects nearby ingredients and sends collect requests to server

local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local Workspace = game:GetService("Workspace")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Remotes = require(ReplicatedStorage:WaitForChild("RemoteEvents"))

local player = Players.LocalPlayer
local collectRange = 10 -- updated from server data
local collectSpeed = 1.0

-- Update stats from server
local function refreshStats()
	local data = Remotes.GetPlayerData:InvokeServer()
	if data then
		local GameConfig = require(ReplicatedStorage:WaitForChild("GameConfig"))
		collectRange = GameConfig.Collection.BaseCollectRange
			+ (data.Upgrades.CollectRange * GameConfig.Upgrades.CollectRange.BonusPerLevel)
		collectSpeed = GameConfig.Collection.BaseCollectSpeed
			+ (data.Upgrades.CollectSpeed * GameConfig.Upgrades.CollectSpeed.BonusPerLevel)
	end
end

-- Refresh on upgrade
Remotes.UpgradeUpdated.OnClientEvent:Connect(function()
	refreshStats()
end)

-- Auto-collect loop
local lastCollectTime = 0
local collectInterval = 0.5 -- base interval, modified by speed

RunService.Heartbeat:Connect(function()
	local character = player.Character
	if not character then return end
	local rootPart = character:FindFirstChild("HumanoidRootPart")
	if not rootPart then return end

	-- Throttle by collect speed
	local interval = collectInterval / collectSpeed
	if tick() - lastCollectTime < interval then return end
	lastCollectTime = tick()

	-- Find nearest ingredient in range
	local ingredientsFolder = Workspace:FindFirstChild("Ingredients")
	if not ingredientsFolder then return end

	local nearest = nil
	local nearestDist = collectRange

	for _, part in ipairs(ingredientsFolder:GetChildren()) do
		if part:IsA("BasePart") and part:FindFirstChild("IngredientName") then
			local dist = (rootPart.Position - part.Position).Magnitude
			if dist < nearestDist then
				nearest = part
				nearestDist = dist
			end
		end
	end

	if nearest then
		Remotes.CollectIngredient:FireServer(nearest)
	end
end)

-- Initial stats load
task.spawn(function()
	task.wait(2)
	refreshStats()
end)
