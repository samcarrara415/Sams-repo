-- WorldSelectUI.lua
-- World selection menu at spawn — shows all worlds, locked/unlocked status,
-- and per-world kitchen tool upgrades. Plays like Lawn Mowing Simulator
-- where you unlock new areas with progression.

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local GameConfig = require(ReplicatedStorage:WaitForChild("GameConfig"))
local Remotes = require(ReplicatedStorage:WaitForChild("RemoteEvents"))

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

-- ============================================================
-- WORLD SELECT SCREEN GUI
-- ============================================================
local screenGui = Instance.new("ScreenGui")
screenGui.Name = "WorldSelectUI"
screenGui.ResetOnSpawn = false
screenGui.Parent = playerGui

-- World select button (always visible, left side)
local worldBtn = Instance.new("TextButton")
worldBtn.Size = UDim2.new(0, 130, 0, 35)
worldBtn.Position = UDim2.new(0, 10, 0, 50)
worldBtn.BackgroundColor3 = Color3.fromRGB(40, 120, 180)
worldBtn.Text = "WORLDS"
worldBtn.TextColor3 = Color3.new(1, 1, 1)
worldBtn.Font = Enum.Font.GothamBold
worldBtn.TextSize = 16
worldBtn.Parent = screenGui

local worldBtnCorner = Instance.new("UICorner")
worldBtnCorner.CornerRadius = UDim.new(0, 8)
worldBtnCorner.Parent = worldBtn

-- Current world indicator
local currentWorldLabel = Instance.new("TextLabel")
currentWorldLabel.Name = "CurrentWorld"
currentWorldLabel.Size = UDim2.new(0, 200, 0, 20)
currentWorldLabel.Position = UDim2.new(0, 10, 0, 88)
currentWorldLabel.BackgroundTransparency = 1
currentWorldLabel.Text = "World: Fast Food Town"
currentWorldLabel.TextColor3 = Color3.fromRGB(100, 200, 255)
currentWorldLabel.Font = Enum.Font.GothamMedium
currentWorldLabel.TextSize = 12
currentWorldLabel.TextXAlignment = Enum.TextXAlignment.Left
currentWorldLabel.Parent = screenGui

-- ============================================================
-- MAIN PANEL
-- ============================================================
local panel = Instance.new("Frame")
panel.Name = "WorldPanel"
panel.Size = UDim2.new(0, 700, 0, 500)
panel.Position = UDim2.new(0.5, -350, 0.5, -250)
panel.BackgroundColor3 = Color3.fromRGB(25, 30, 45)
panel.BackgroundTransparency = 0.05
panel.Visible = false
panel.Parent = screenGui

local panelCorner = Instance.new("UICorner")
panelCorner.CornerRadius = UDim.new(0, 16)
panelCorner.Parent = panel

local panelStroke = Instance.new("UIStroke")
panelStroke.Color = Color3.fromRGB(60, 100, 180)
panelStroke.Thickness = 2
panelStroke.Parent = panel

-- Title
local titleLabel = Instance.new("TextLabel")
titleLabel.Size = UDim2.new(1, 0, 0, 50)
titleLabel.BackgroundTransparency = 1
titleLabel.Text = "SELECT YOUR WORLD"
titleLabel.TextColor3 = Color3.fromRGB(100, 200, 255)
titleLabel.Font = Enum.Font.GothamBold
titleLabel.TextSize = 26
titleLabel.Parent = panel

-- Close
local closeBtn = Instance.new("TextButton")
closeBtn.Size = UDim2.new(0, 35, 0, 35)
closeBtn.Position = UDim2.new(1, -40, 0, 8)
closeBtn.BackgroundTransparency = 1
closeBtn.Text = "X"
closeBtn.TextColor3 = Color3.fromRGB(255, 100, 100)
closeBtn.Font = Enum.Font.GothamBold
closeBtn.TextSize = 20
closeBtn.Parent = panel

-- Left side: world list (scrolling)
local worldList = Instance.new("ScrollingFrame")
worldList.Name = "WorldList"
worldList.Size = UDim2.new(0, 260, 1, -60)
worldList.Position = UDim2.new(0, 10, 0, 55)
worldList.BackgroundTransparency = 0.9
worldList.ScrollBarThickness = 4
worldList.Parent = panel

local worldListLayout = Instance.new("UIListLayout")
worldListLayout.Padding = UDim.new(0, 6)
worldListLayout.Parent = worldList

-- Right side: selected world details + upgrades
local detailFrame = Instance.new("Frame")
detailFrame.Name = "DetailFrame"
detailFrame.Size = UDim2.new(0, 410, 1, -60)
detailFrame.Position = UDim2.new(0, 280, 0, 55)
detailFrame.BackgroundColor3 = Color3.fromRGB(30, 35, 50)
detailFrame.BackgroundTransparency = 0.5
detailFrame.Parent = panel

local detailCorner = Instance.new("UICorner")
detailCorner.CornerRadius = UDim.new(0, 10)
detailCorner.Parent = detailFrame

-- Detail: World name
local detailName = Instance.new("TextLabel")
detailName.Name = "WorldName"
detailName.Size = UDim2.new(1, 0, 0, 30)
detailName.Position = UDim2.new(0, 0, 0, 5)
detailName.BackgroundTransparency = 1
detailName.Text = ""
detailName.TextColor3 = Color3.fromRGB(255, 220, 100)
detailName.Font = Enum.Font.GothamBold
detailName.TextSize = 20
detailName.Parent = detailFrame

-- Detail: Description
local detailDesc = Instance.new("TextLabel")
detailDesc.Name = "WorldDesc"
detailDesc.Size = UDim2.new(1, -20, 0, 20)
detailDesc.Position = UDim2.new(0, 10, 0, 32)
detailDesc.BackgroundTransparency = 1
detailDesc.Text = ""
detailDesc.TextColor3 = Color3.fromRGB(180, 180, 180)
detailDesc.Font = Enum.Font.Gotham
detailDesc.TextSize = 12
detailDesc.TextXAlignment = Enum.TextXAlignment.Left
detailDesc.Parent = detailFrame

-- Detail: Ingredients preview
local detailIngredients = Instance.new("TextLabel")
detailIngredients.Name = "Ingredients"
detailIngredients.Size = UDim2.new(1, -20, 0, 40)
detailIngredients.Position = UDim2.new(0, 10, 0, 55)
detailIngredients.BackgroundTransparency = 1
detailIngredients.Text = ""
detailIngredients.TextColor3 = Color3.fromRGB(150, 200, 150)
detailIngredients.Font = Enum.Font.Gotham
detailIngredients.TextSize = 11
detailIngredients.TextXAlignment = Enum.TextXAlignment.Left
detailIngredients.TextWrapped = true
detailIngredients.Parent = detailFrame

-- Teleport button
local teleportBtn = Instance.new("TextButton")
teleportBtn.Name = "TeleportButton"
teleportBtn.Size = UDim2.new(0, 180, 0, 40)
teleportBtn.Position = UDim2.new(0.5, -90, 0, 100)
teleportBtn.BackgroundColor3 = Color3.fromRGB(40, 150, 80)
teleportBtn.Text = "TRAVEL HERE"
teleportBtn.TextColor3 = Color3.new(1, 1, 1)
teleportBtn.Font = Enum.Font.GothamBold
teleportBtn.TextSize = 16
teleportBtn.Visible = false
teleportBtn.Parent = detailFrame

local teleportCorner = Instance.new("UICorner")
teleportCorner.CornerRadius = UDim.new(0, 8)
teleportCorner.Parent = teleportBtn

-- Kitchen Tools label
local toolsHeader = Instance.new("TextLabel")
toolsHeader.Size = UDim2.new(1, 0, 0, 25)
toolsHeader.Position = UDim2.new(0, 0, 0, 150)
toolsHeader.BackgroundTransparency = 1
toolsHeader.Text = "KITCHEN TOOLS"
toolsHeader.TextColor3 = Color3.fromRGB(255, 180, 80)
toolsHeader.Font = Enum.Font.GothamBold
toolsHeader.TextSize = 14
toolsHeader.Parent = detailFrame

-- Upgrades scroll
local upgradeScroll = Instance.new("ScrollingFrame")
upgradeScroll.Name = "UpgradeList"
upgradeScroll.Size = UDim2.new(1, -10, 1, -185)
upgradeScroll.Position = UDim2.new(0, 5, 0, 175)
upgradeScroll.BackgroundTransparency = 1
upgradeScroll.ScrollBarThickness = 4
upgradeScroll.Parent = detailFrame

local upgradeLayout = Instance.new("UIListLayout")
upgradeLayout.Padding = UDim.new(0, 5)
upgradeLayout.Parent = upgradeScroll

-- ============================================================
-- STATE
-- ============================================================
local selectedWorldIndex = 1
local playerRebirths = 0
local playerData = nil

-- World colors by index
local worldColors = {
	Color3.fromRGB(255, 150, 50),  -- Fast Food (orange)
	Color3.fromRGB(50, 180, 50),   -- Italian (green)
	Color3.fromRGB(255, 80, 80),   -- Sushi (red)
	Color3.fromRGB(180, 100, 50),  -- BBQ (brown)
	Color3.fromRGB(255, 215, 0),   -- Golden (gold)
}

-- ============================================================
-- BUILD WORLD LIST
-- ============================================================
local worldButtons = {}

local function buildWorldList()
	for _, child in ipairs(worldList:GetChildren()) do
		if child:IsA("TextButton") then child:Destroy() end
	end

	for i, world in ipairs(GameConfig.Worlds) do
		local unlocked = playerRebirths >= world.RequiredRebirths
		local color = worldColors[i] or Color3.fromRGB(150, 150, 150)

		local btn = Instance.new("TextButton")
		btn.Name = "World" .. i
		btn.Size = UDim2.new(1, -5, 0, 55)
		btn.BackgroundColor3 = unlocked and Color3.fromRGB(40, 45, 55) or Color3.fromRGB(30, 30, 35)
		btn.Parent = worldList

		local btnCorner = Instance.new("UICorner")
		btnCorner.CornerRadius = UDim.new(0, 8)
		btnCorner.Parent = btn

		-- World name
		local nameLabel = Instance.new("TextLabel")
		nameLabel.Size = UDim2.new(1, -10, 0, 22)
		nameLabel.Position = UDim2.new(0, 10, 0, 5)
		nameLabel.BackgroundTransparency = 1
		nameLabel.Text = (unlocked and "" or "LOCKED  ") .. world.Name
		nameLabel.TextColor3 = unlocked and color or Color3.fromRGB(100, 100, 100)
		nameLabel.Font = Enum.Font.GothamBold
		nameLabel.TextSize = 13
		nameLabel.TextXAlignment = Enum.TextXAlignment.Left
		nameLabel.Parent = btn

		-- Requirement
		local reqLabel = Instance.new("TextLabel")
		reqLabel.Size = UDim2.new(1, -10, 0, 18)
		reqLabel.Position = UDim2.new(0, 10, 0, 27)
		reqLabel.BackgroundTransparency = 1
		reqLabel.Font = Enum.Font.Gotham
		reqLabel.TextSize = 11
		reqLabel.TextXAlignment = Enum.TextXAlignment.Left
		reqLabel.Parent = btn

		if world.RequiredRebirths == 0 then
			reqLabel.Text = "Starter World"
			reqLabel.TextColor3 = Color3.fromRGB(150, 150, 150)
		elseif unlocked then
			reqLabel.Text = "Unlocked! (x" .. world.IngredientMultiplier .. " ingredients)"
			reqLabel.TextColor3 = Color3.fromRGB(100, 200, 100)
		else
			reqLabel.Text = "Requires " .. world.RequiredRebirths .. " rebirths (you have " .. playerRebirths .. ")"
			reqLabel.TextColor3 = Color3.fromRGB(200, 100, 100)
		end

		btn.MouseButton1Click:Connect(function()
			selectedWorldIndex = i
			showWorldDetail(i)
		end)

		worldButtons[i] = btn
	end

	worldList.CanvasSize = UDim2.new(0, 0, 0, #GameConfig.Worlds * 61)
end

-- ============================================================
-- SHOW WORLD DETAIL
-- ============================================================
function showWorldDetail(worldIndex)
	local world = GameConfig.Worlds[worldIndex]
	if not world then return end

	local unlocked = playerRebirths >= world.RequiredRebirths
	local color = worldColors[worldIndex] or Color3.fromRGB(200, 200, 200)

	detailName.Text = world.Name
	detailName.TextColor3 = color
	detailDesc.Text = world.Description

	-- Ingredients list
	local ingNames = {}
	for _, ing in ipairs(world.Ingredients) do
		table.insert(ingNames, ing.Name .. " (" .. ing.Rarity .. ", " .. ing.FoodValue .. " food)")
	end
	detailIngredients.Text = "Ingredients: " .. table.concat(ingNames, ", ")

	-- Teleport button
	teleportBtn.Visible = unlocked
	if unlocked then
		teleportBtn.Text = "TRAVEL HERE"
		teleportBtn.BackgroundColor3 = Color3.fromRGB(40, 150, 80)
	end

	-- Clear old upgrades
	for _, child in ipairs(upgradeScroll:GetChildren()) do
		if child:IsA("Frame") then child:Destroy() end
	end

	-- Build upgrade rows
	if world.Upgrades and unlocked then
		local count = 0
		for upgName, upgConfig in pairs(world.Upgrades) do
			count = count + 1
			local key = world.Name .. "_" .. upgName
			local currentLevel = (playerData and playerData.WorldUpgrades and playerData.WorldUpgrades[key]) or 0

			local row = Instance.new("Frame")
			row.Name = upgName
			row.Size = UDim2.new(1, 0, 0, 55)
			row.BackgroundColor3 = Color3.fromRGB(45, 40, 55)
			row.Parent = upgradeScroll

			local rowCorner = Instance.new("UICorner")
			rowCorner.CornerRadius = UDim.new(0, 6)
			rowCorner.Parent = row

			local upgNameLabel = Instance.new("TextLabel")
			upgNameLabel.Size = UDim2.new(0.55, 0, 0, 22)
			upgNameLabel.Position = UDim2.new(0, 8, 0, 3)
			upgNameLabel.BackgroundTransparency = 1
			upgNameLabel.Text = upgConfig.Name
			upgNameLabel.TextColor3 = Color3.fromRGB(255, 200, 80)
			upgNameLabel.Font = Enum.Font.GothamBold
			upgNameLabel.TextSize = 12
			upgNameLabel.TextXAlignment = Enum.TextXAlignment.Left
			upgNameLabel.Parent = row

			local upgDescLabel = Instance.new("TextLabel")
			upgDescLabel.Size = UDim2.new(0.65, 0, 0, 15)
			upgDescLabel.Position = UDim2.new(0, 8, 0, 24)
			upgDescLabel.BackgroundTransparency = 1
			upgDescLabel.Text = upgConfig.Description
			upgDescLabel.TextColor3 = Color3.fromRGB(150, 150, 150)
			upgDescLabel.Font = Enum.Font.Gotham
			upgDescLabel.TextSize = 10
			upgDescLabel.TextXAlignment = Enum.TextXAlignment.Left
			upgDescLabel.Parent = row

			local levelLabel = Instance.new("TextLabel")
			levelLabel.Name = "Level"
			levelLabel.Size = UDim2.new(0, 70, 0, 20)
			levelLabel.Position = UDim2.new(0, 8, 0, 38)
			levelLabel.BackgroundTransparency = 1
			levelLabel.Text = "Lv. " .. currentLevel .. "/" .. upgConfig.MaxLevel
			levelLabel.TextColor3 = Color3.new(1, 1, 1)
			levelLabel.Font = Enum.Font.Gotham
			levelLabel.TextSize = 11
			levelLabel.Parent = row

			local buyBtn = Instance.new("TextButton")
			buyBtn.Name = "BuyButton"
			buyBtn.Size = UDim2.new(0, 100, 0, 30)
			buyBtn.Position = UDim2.new(1, -108, 0, 12)
			buyBtn.Font = Enum.Font.GothamBold
			buyBtn.TextSize = 12
			buyBtn.TextColor3 = Color3.new(1, 1, 1)
			buyBtn.Parent = row

			local buyCorner = Instance.new("UICorner")
			buyCorner.CornerRadius = UDim.new(0, 6)
			buyCorner.Parent = buyBtn

			if currentLevel >= upgConfig.MaxLevel then
				buyBtn.Text = "MAXED"
				buyBtn.BackgroundColor3 = Color3.fromRGB(80, 80, 80)
				buyBtn.Active = false
			else
				local cost = math.floor(upgConfig.BaseCost * (upgConfig.CostMultiplier ^ currentLevel))
				buyBtn.Text = cost .. " Coins"
				buyBtn.BackgroundColor3 = Color3.fromRGB(50, 130, 50)
				buyBtn.MouseButton1Click:Connect(function()
					Remotes.PurchaseWorldUpgrade:FireServer(worldIndex, upgName)
				end)
			end
		end
		upgradeScroll.CanvasSize = UDim2.new(0, 0, 0, count * 60)
	elseif not unlocked then
		local lockedLabel = Instance.new("TextLabel")
		lockedLabel.Size = UDim2.new(1, 0, 0, 40)
		lockedLabel.BackgroundTransparency = 1
		lockedLabel.Text = "Unlock this world to access kitchen tools!"
		lockedLabel.TextColor3 = Color3.fromRGB(200, 100, 100)
		lockedLabel.Font = Enum.Font.GothamBold
		lockedLabel.TextSize = 13
		lockedLabel.TextWrapped = true
		-- Wrap in frame for layout
		local wrapper = Instance.new("Frame")
		wrapper.Size = UDim2.new(1, 0, 0, 40)
		wrapper.BackgroundTransparency = 1
		wrapper.Parent = upgradeScroll
		lockedLabel.Parent = wrapper
	end
end

-- ============================================================
-- EVENTS
-- ============================================================
worldBtn.MouseButton1Click:Connect(function()
	panel.Visible = not panel.Visible
	if panel.Visible then
		-- Refresh data
		playerData = Remotes.GetPlayerData:InvokeServer()
		if playerData then
			playerRebirths = playerData.Rebirths
		end
		buildWorldList()
		showWorldDetail(selectedWorldIndex)
	end
end)

closeBtn.MouseButton1Click:Connect(function()
	panel.Visible = false
end)

teleportBtn.MouseButton1Click:Connect(function()
	Remotes.SelectWorld:FireServer(selectedWorldIndex)
	teleportBtn.Text = "TRAVELING..."
	teleportBtn.BackgroundColor3 = Color3.fromRGB(100, 100, 50)
	task.wait(1)
	panel.Visible = false
end)

-- World changed confirmation
Remotes.WorldChanged.OnClientEvent:Connect(function(worldIndex, worldName)
	currentWorldLabel.Text = "World: " .. worldName
	selectedWorldIndex = worldIndex
end)

-- Upgrade purchased — refresh detail
Remotes.WorldUpgradeUpdated.OnClientEvent:Connect(function(worldIndex, upgradeName, newLevel)
	playerData = Remotes.GetPlayerData:InvokeServer()
	if selectedWorldIndex == worldIndex then
		showWorldDetail(worldIndex)
	end
end)

-- Rebirth — refresh world list (new worlds may unlock)
Remotes.RebirthComplete.OnClientEvent:Connect(function(info)
	playerRebirths = info.NewRebirthCount
	if panel.Visible then
		buildWorldList()
		showWorldDetail(selectedWorldIndex)
	end
end)

-- Initial load
task.spawn(function()
	task.wait(2)
	playerData = Remotes.GetPlayerData:InvokeServer()
	if playerData then
		playerRebirths = playerData.Rebirths
		local world = GameConfig.Worlds[playerData.CurrentWorld]
		if world then
			currentWorldLabel.Text = "World: " .. world.Name
			selectedWorldIndex = playerData.CurrentWorld
		end
	end
end)
