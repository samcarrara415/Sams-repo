-- BackpackUI.lua
-- Creates and manages the backpack HUD showing collected ingredients

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local GameConfig = require(ReplicatedStorage:WaitForChild("GameConfig"))
local Remotes = require(ReplicatedStorage:WaitForChild("RemoteEvents"))

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

-- Create the backpack UI
local screenGui = Instance.new("ScreenGui")
screenGui.Name = "BackpackUI"
screenGui.ResetOnSpawn = false
screenGui.Parent = playerGui

-- Main frame (bottom-right corner)
local frame = Instance.new("Frame")
frame.Name = "BackpackFrame"
frame.Size = UDim2.new(0, 220, 0, 300)
frame.Position = UDim2.new(1, -230, 1, -310)
frame.BackgroundColor3 = Color3.fromRGB(40, 30, 20)
frame.BackgroundTransparency = 0.2
frame.BorderSizePixel = 0
frame.Parent = screenGui

local corner = Instance.new("UICorner")
corner.CornerRadius = UDim.new(0, 12)
corner.Parent = frame

-- Title
local title = Instance.new("TextLabel")
title.Name = "Title"
title.Size = UDim2.new(1, 0, 0, 35)
title.BackgroundTransparency = 1
title.Text = "BACKPACK"
title.TextColor3 = Color3.fromRGB(255, 200, 100)
title.Font = Enum.Font.GothamBold
title.TextSize = 18
title.Parent = frame

-- Count label
local countLabel = Instance.new("TextLabel")
countLabel.Name = "Count"
countLabel.Size = UDim2.new(1, 0, 0, 20)
countLabel.Position = UDim2.new(0, 0, 0, 30)
countLabel.BackgroundTransparency = 1
countLabel.Text = "0 / 20"
countLabel.TextColor3 = Color3.fromRGB(200, 200, 200)
countLabel.Font = Enum.Font.Gotham
countLabel.TextSize = 14
countLabel.Parent = frame

-- Scroll frame for items
local scrollFrame = Instance.new("ScrollingFrame")
scrollFrame.Name = "ItemList"
scrollFrame.Size = UDim2.new(1, -10, 1, -60)
scrollFrame.Position = UDim2.new(0, 5, 0, 55)
scrollFrame.BackgroundTransparency = 1
scrollFrame.ScrollBarThickness = 4
scrollFrame.CanvasSize = UDim2.new(0, 0, 0, 0)
scrollFrame.Parent = frame

local listLayout = Instance.new("UIListLayout")
listLayout.Padding = UDim.new(0, 3)
listLayout.Parent = scrollFrame

-- Rarity colors
local rarityColors = {
	Common = Color3.fromRGB(150, 255, 150),
	Uncommon = Color3.fromRGB(100, 150, 255),
	Rare = Color3.fromRGB(255, 215, 0),
}

local function getRarity(ingredientName)
	for _, ing in ipairs(GameConfig.Ingredients) do
		if ing.Name == ingredientName then
			return ing.Rarity
		end
	end
	return "Common"
end

-- Update the item list
local function updateBackpackDisplay(contents)
	-- Clear existing
	for _, child in ipairs(scrollFrame:GetChildren()) do
		if child:IsA("TextLabel") then
			child:Destroy()
		end
	end

	-- Count duplicates
	local counts = {}
	local order = {}
	for _, name in ipairs(contents) do
		if not counts[name] then
			counts[name] = 0
			table.insert(order, name)
		end
		counts[name] = counts[name] + 1
	end

	-- Create labels
	for _, name in ipairs(order) do
		local label = Instance.new("TextLabel")
		label.Size = UDim2.new(1, 0, 0, 22)
		label.BackgroundTransparency = 0.8
		label.BackgroundColor3 = Color3.fromRGB(60, 50, 40)
		label.Text = "  " .. name .. " x" .. counts[name]
		label.TextColor3 = rarityColors[getRarity(name)] or Color3.new(1, 1, 1)
		label.Font = Enum.Font.Gotham
		label.TextSize = 13
		label.TextXAlignment = Enum.TextXAlignment.Left
		label.Parent = scrollFrame

		local itemCorner = Instance.new("UICorner")
		itemCorner.CornerRadius = UDim.new(0, 4)
		itemCorner.Parent = label
	end

	-- Update canvas size
	scrollFrame.CanvasSize = UDim2.new(0, 0, 0, #order * 25)

	-- Update count
	local capacity = GameConfig.Backpack.MaxCapacity
	-- Try to get real capacity from server data
	task.spawn(function()
		local data = Remotes.GetPlayerData:InvokeServer()
		if data then
			local upgradeBonus = (data.Upgrades.BackpackSize or 0) * GameConfig.Upgrades.BackpackSize.BonusPerLevel
			capacity = GameConfig.Backpack.MaxCapacity + upgradeBonus
		end
		countLabel.Text = #contents .. " / " .. capacity
	end)
end

-- Listen for updates
Remotes.BackpackUpdated.OnClientEvent:Connect(function(contents)
	updateBackpackDisplay(contents)
end)

-- Initial empty state
updateBackpackDisplay({})
