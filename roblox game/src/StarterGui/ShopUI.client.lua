-- ShopUI.lua
-- Combined shop for: Coin Upgrades, Attack Unlocks, and Robux Gamepasses

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local GameConfig = require(ReplicatedStorage:WaitForChild("GameConfig"))
local Remotes = require(ReplicatedStorage:WaitForChild("RemoteEvents"))

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

-- Main screen GUI
local screenGui = Instance.new("ScreenGui")
screenGui.Name = "ShopUI"
screenGui.ResetOnSpawn = false
screenGui.Parent = playerGui

-- Toggle button (top-left)
local toggleBtn = Instance.new("TextButton")
toggleBtn.Size = UDim2.new(0, 100, 0, 35)
toggleBtn.Position = UDim2.new(0, 10, 0, 10)
toggleBtn.BackgroundColor3 = Color3.fromRGB(80, 60, 150)
toggleBtn.Text = "SHOP"
toggleBtn.TextColor3 = Color3.new(1, 1, 1)
toggleBtn.Font = Enum.Font.GothamBold
toggleBtn.TextSize = 16
toggleBtn.Parent = screenGui

local toggleCorner = Instance.new("UICorner")
toggleCorner.CornerRadius = UDim.new(0, 8)
toggleCorner.Parent = toggleBtn

-- Stats display (coins + food level, top center)
local statsFrame = Instance.new("Frame")
statsFrame.Size = UDim2.new(0, 300, 0, 35)
statsFrame.Position = UDim2.new(0.5, -150, 0, 10)
statsFrame.BackgroundColor3 = Color3.fromRGB(30, 30, 30)
statsFrame.BackgroundTransparency = 0.4
statsFrame.Parent = screenGui

local statsCorner = Instance.new("UICorner")
statsCorner.CornerRadius = UDim.new(0, 8)
statsCorner.Parent = statsFrame

local coinsLabel = Instance.new("TextLabel")
coinsLabel.Name = "Coins"
coinsLabel.Size = UDim2.new(0.5, 0, 1, 0)
coinsLabel.BackgroundTransparency = 1
coinsLabel.Text = "Coins: 0"
coinsLabel.TextColor3 = Color3.fromRGB(255, 215, 0)
coinsLabel.Font = Enum.Font.GothamBold
coinsLabel.TextSize = 16
coinsLabel.Parent = statsFrame

local foodLabel = Instance.new("TextLabel")
foodLabel.Name = "FoodLevel"
foodLabel.Size = UDim2.new(0.5, 0, 1, 0)
foodLabel.Position = UDim2.new(0.5, 0, 0, 0)
foodLabel.BackgroundTransparency = 1
foodLabel.Text = "Food: 0"
foodLabel.TextColor3 = Color3.fromRGB(255, 150, 50)
foodLabel.Font = Enum.Font.GothamBold
foodLabel.TextSize = 16
foodLabel.Parent = statsFrame

-- Shop panel (hidden by default)
local shopFrame = Instance.new("Frame")
shopFrame.Name = "ShopFrame"
shopFrame.Size = UDim2.new(0, 600, 0, 450)
shopFrame.Position = UDim2.new(0.5, -300, 0.5, -225)
shopFrame.BackgroundColor3 = Color3.fromRGB(35, 30, 45)
shopFrame.BackgroundTransparency = 0.1
shopFrame.Visible = false
shopFrame.Parent = screenGui

local shopCorner = Instance.new("UICorner")
shopCorner.CornerRadius = UDim.new(0, 16)
shopCorner.Parent = shopFrame

-- Shop title
local shopTitle = Instance.new("TextLabel")
shopTitle.Size = UDim2.new(1, 0, 0, 45)
shopTitle.BackgroundTransparency = 1
shopTitle.Text = "CHUD SHOP"
shopTitle.TextColor3 = Color3.fromRGB(255, 200, 100)
shopTitle.Font = Enum.Font.GothamBold
shopTitle.TextSize = 24
shopTitle.Parent = shopFrame

-- Close button
local closeBtn = Instance.new("TextButton")
closeBtn.Size = UDim2.new(0, 30, 0, 30)
closeBtn.Position = UDim2.new(1, -35, 0, 8)
closeBtn.BackgroundTransparency = 1
closeBtn.Text = "X"
closeBtn.TextColor3 = Color3.fromRGB(255, 100, 100)
closeBtn.Font = Enum.Font.GothamBold
closeBtn.TextSize = 18
closeBtn.Parent = shopFrame

-- Tab buttons
local tabFrame = Instance.new("Frame")
tabFrame.Size = UDim2.new(1, -20, 0, 35)
tabFrame.Position = UDim2.new(0, 10, 0, 45)
tabFrame.BackgroundTransparency = 1
tabFrame.Parent = shopFrame

local tabLayout = Instance.new("UIListLayout")
tabLayout.FillDirection = Enum.FillDirection.Horizontal
tabLayout.Padding = UDim.new(0, 5)
tabLayout.Parent = tabFrame

local tabs = {"Upgrades", "Attacks", "Boosters"}
local tabButtons = {}
local contentFrames = {}

for _, tabName in ipairs(tabs) do
	local btn = Instance.new("TextButton")
	btn.Name = tabName
	btn.Size = UDim2.new(0, 180, 0, 30)
	btn.BackgroundColor3 = Color3.fromRGB(60, 50, 70)
	btn.Text = tabName
	btn.TextColor3 = Color3.new(1, 1, 1)
	btn.Font = Enum.Font.GothamBold
	btn.TextSize = 14
	btn.Parent = tabFrame
	tabButtons[tabName] = btn

	local tabCorner = Instance.new("UICorner")
	tabCorner.CornerRadius = UDim.new(0, 6)
	tabCorner.Parent = btn

	local content = Instance.new("ScrollingFrame")
	content.Name = tabName .. "Content"
	content.Size = UDim2.new(1, -20, 1, -95)
	content.Position = UDim2.new(0, 10, 0, 85)
	content.BackgroundTransparency = 1
	content.ScrollBarThickness = 4
	content.Visible = false
	content.Parent = shopFrame

	local contentLayout = Instance.new("UIListLayout")
	contentLayout.Padding = UDim.new(0, 6)
	contentLayout.Parent = content

	contentFrames[tabName] = content
end

-- Tab switching
local activeTab = "Upgrades"
local function switchTab(tabName)
	activeTab = tabName
	for name, frame in pairs(contentFrames) do
		frame.Visible = (name == tabName)
	end
	for name, btn in pairs(tabButtons) do
		btn.BackgroundColor3 = (name == tabName) and Color3.fromRGB(100, 80, 150) or Color3.fromRGB(60, 50, 70)
	end
end

for tabName, btn in pairs(tabButtons) do
	btn.MouseButton1Click:Connect(function()
		switchTab(tabName)
	end)
end

-- Create an upgrade row
local function createUpgradeRow(parent, upgradeName, config)
	local row = Instance.new("Frame")
	row.Name = upgradeName
	row.Size = UDim2.new(1, 0, 0, 60)
	row.BackgroundColor3 = Color3.fromRGB(50, 45, 55)
	row.Parent = parent

	local rowCorner = Instance.new("UICorner")
	rowCorner.CornerRadius = UDim.new(0, 8)
	rowCorner.Parent = row

	local nameLabel = Instance.new("TextLabel")
	nameLabel.Size = UDim2.new(0.5, 0, 0, 25)
	nameLabel.Position = UDim2.new(0, 10, 0, 5)
	nameLabel.BackgroundTransparency = 1
	nameLabel.Text = config.Name
	nameLabel.TextColor3 = Color3.fromRGB(255, 220, 100)
	nameLabel.Font = Enum.Font.GothamBold
	nameLabel.TextSize = 14
	nameLabel.TextXAlignment = Enum.TextXAlignment.Left
	nameLabel.Parent = row

	local descLabel = Instance.new("TextLabel")
	descLabel.Size = UDim2.new(0.6, 0, 0, 20)
	descLabel.Position = UDim2.new(0, 10, 0, 28)
	descLabel.BackgroundTransparency = 1
	descLabel.Text = config.Description
	descLabel.TextColor3 = Color3.fromRGB(180, 180, 180)
	descLabel.Font = Enum.Font.Gotham
	descLabel.TextSize = 11
	descLabel.TextXAlignment = Enum.TextXAlignment.Left
	descLabel.Parent = row

	local levelLabel = Instance.new("TextLabel")
	levelLabel.Name = "Level"
	levelLabel.Size = UDim2.new(0, 80, 0, 25)
	levelLabel.Position = UDim2.new(0.55, 0, 0, 5)
	levelLabel.BackgroundTransparency = 1
	levelLabel.Text = "Lv. 0/" .. config.MaxLevel
	levelLabel.TextColor3 = Color3.new(1, 1, 1)
	levelLabel.Font = Enum.Font.Gotham
	levelLabel.TextSize = 13
	levelLabel.Parent = row

	local buyBtn = Instance.new("TextButton")
	buyBtn.Name = "BuyButton"
	buyBtn.Size = UDim2.new(0, 120, 0, 35)
	buyBtn.Position = UDim2.new(1, -130, 0, 12)
	buyBtn.BackgroundColor3 = Color3.fromRGB(50, 150, 50)
	buyBtn.Text = config.BaseCost .. " Coins"
	buyBtn.TextColor3 = Color3.new(1, 1, 1)
	buyBtn.Font = Enum.Font.GothamBold
	buyBtn.TextSize = 13
	buyBtn.Parent = row

	local buyCorner = Instance.new("UICorner")
	buyCorner.CornerRadius = UDim.new(0, 6)
	buyCorner.Parent = buyBtn

	buyBtn.MouseButton1Click:Connect(function()
		Remotes.PurchaseUpgrade:FireServer(upgradeName)
	end)

	return row
end

-- Create an attack row
local function createAttackRow(parent, attackConfig)
	local row = Instance.new("Frame")
	row.Name = attackConfig.Name
	row.Size = UDim2.new(1, 0, 0, 70)
	row.BackgroundColor3 = Color3.fromRGB(55, 40, 40)
	row.Parent = parent

	local rowCorner = Instance.new("UICorner")
	rowCorner.CornerRadius = UDim.new(0, 8)
	rowCorner.Parent = row

	local nameLabel = Instance.new("TextLabel")
	nameLabel.Size = UDim2.new(0.4, 0, 0, 25)
	nameLabel.Position = UDim2.new(0, 10, 0, 5)
	nameLabel.BackgroundTransparency = 1
	nameLabel.Text = attackConfig.Name
	nameLabel.TextColor3 = Color3.fromRGB(255, 100, 100)
	nameLabel.Font = Enum.Font.GothamBold
	nameLabel.TextSize = 14
	nameLabel.TextXAlignment = Enum.TextXAlignment.Left
	nameLabel.Parent = row

	local descLabel = Instance.new("TextLabel")
	descLabel.Size = UDim2.new(0.6, 0, 0, 20)
	descLabel.Position = UDim2.new(0, 10, 0, 28)
	descLabel.BackgroundTransparency = 1
	descLabel.Text = attackConfig.Description
	descLabel.TextColor3 = Color3.fromRGB(180, 180, 180)
	descLabel.Font = Enum.Font.Gotham
	descLabel.TextSize = 11
	descLabel.TextXAlignment = Enum.TextXAlignment.Left
	descLabel.Parent = row

	local statsLabel = Instance.new("TextLabel")
	statsLabel.Size = UDim2.new(0.6, 0, 0, 15)
	statsLabel.Position = UDim2.new(0, 10, 0, 48)
	statsLabel.BackgroundTransparency = 1
	statsLabel.Text = "DMG: " .. attackConfig.Damage .. " | CD: " .. attackConfig.Cooldown .. "s | Range: " .. attackConfig.Range
	statsLabel.TextColor3 = Color3.fromRGB(150, 150, 150)
	statsLabel.Font = Enum.Font.Gotham
	statsLabel.TextSize = 10
	statsLabel.TextXAlignment = Enum.TextXAlignment.Left
	statsLabel.Parent = row

	local buyBtn = Instance.new("TextButton")
	buyBtn.Name = "BuyButton"
	buyBtn.Size = UDim2.new(0, 120, 0, 35)
	buyBtn.Position = UDim2.new(1, -130, 0, 18)
	buyBtn.Font = Enum.Font.GothamBold
	buyBtn.TextSize = 13
	buyBtn.TextColor3 = Color3.new(1, 1, 1)
	buyBtn.Parent = row

	if attackConfig.UnlockCost == 0 then
		buyBtn.Text = "UNLOCKED"
		buyBtn.BackgroundColor3 = Color3.fromRGB(80, 80, 80)
		buyBtn.Active = false
	else
		buyBtn.Text = attackConfig.UnlockCost .. " Coins"
		buyBtn.BackgroundColor3 = Color3.fromRGB(150, 50, 50)
		buyBtn.MouseButton1Click:Connect(function()
			Remotes.UnlockAttack:FireServer(attackConfig.Name)
		end)
	end

	local buyCorner = Instance.new("UICorner")
	buyCorner.CornerRadius = UDim.new(0, 6)
	buyCorner.Parent = buyBtn

	return row
end

-- Create a booster row
local function createBoosterRow(parent, boosterName, config)
	local row = Instance.new("Frame")
	row.Name = boosterName
	row.Size = UDim2.new(1, 0, 0, 60)
	row.BackgroundColor3 = Color3.fromRGB(40, 45, 60)
	row.Parent = parent

	local rowCorner = Instance.new("UICorner")
	rowCorner.CornerRadius = UDim.new(0, 8)
	rowCorner.Parent = row

	local nameLabel = Instance.new("TextLabel")
	nameLabel.Size = UDim2.new(0.6, 0, 0, 25)
	nameLabel.Position = UDim2.new(0, 10, 0, 8)
	nameLabel.BackgroundTransparency = 1
	nameLabel.Text = config.DisplayName
	nameLabel.TextColor3 = Color3.fromRGB(100, 200, 255)
	nameLabel.Font = Enum.Font.GothamBold
	nameLabel.TextSize = 14
	nameLabel.TextXAlignment = Enum.TextXAlignment.Left
	nameLabel.Parent = row

	local priceLabel = Instance.new("TextLabel")
	priceLabel.Size = UDim2.new(0.4, 0, 0, 15)
	priceLabel.Position = UDim2.new(0, 10, 0, 35)
	priceLabel.BackgroundTransparency = 1
	priceLabel.Text = config.RobuxPrice .. " Robux"
	priceLabel.TextColor3 = Color3.fromRGB(150, 150, 150)
	priceLabel.Font = Enum.Font.Gotham
	priceLabel.TextSize = 11
	priceLabel.TextXAlignment = Enum.TextXAlignment.Left
	priceLabel.Parent = row

	local buyBtn = Instance.new("TextButton")
	buyBtn.Size = UDim2.new(0, 120, 0, 35)
	buyBtn.Position = UDim2.new(1, -130, 0, 12)
	buyBtn.BackgroundColor3 = Color3.fromRGB(0, 120, 200)
	buyBtn.Text = "BUY"
	buyBtn.TextColor3 = Color3.new(1, 1, 1)
	buyBtn.Font = Enum.Font.GothamBold
	buyBtn.TextSize = 14
	buyBtn.Parent = row

	local buyCorner = Instance.new("UICorner")
	buyCorner.CornerRadius = UDim.new(0, 6)
	buyCorner.Parent = buyBtn

	buyBtn.MouseButton1Click:Connect(function()
		Remotes.PurchaseBooster:FireServer(boosterName)
	end)

	return row
end

-- Populate shop tabs
local function buildShop()
	-- Upgrades tab
	local upgradesContent = contentFrames["Upgrades"]
	for upgradeName, config in pairs(GameConfig.Upgrades) do
		createUpgradeRow(upgradesContent, upgradeName, config)
	end
	upgradesContent.CanvasSize = UDim2.new(0, 0, 0, 4 * 66)

	-- Attacks tab
	local attacksContent = contentFrames["Attacks"]
	for _, attack in ipairs(GameConfig.Attacks) do
		createAttackRow(attacksContent, attack)
	end
	attacksContent.CanvasSize = UDim2.new(0, 0, 0, #GameConfig.Attacks * 76)

	-- Boosters tab
	local boostersContent = contentFrames["Boosters"]
	for boosterName, config in pairs(GameConfig.Gamepasses) do
		createBoosterRow(boostersContent, boosterName, config)
	end
	boostersContent.CanvasSize = UDim2.new(0, 0, 0, 4 * 66)
end

-- Toggle shop
toggleBtn.MouseButton1Click:Connect(function()
	shopFrame.Visible = not shopFrame.Visible
end)

closeBtn.MouseButton1Click:Connect(function()
	shopFrame.Visible = false
end)

-- Update stats display
Remotes.CoinsUpdated.OnClientEvent:Connect(function(coins)
	coinsLabel.Text = "Coins: " .. coins
end)

Remotes.FoodLevelUpdated.OnClientEvent:Connect(function(foodLevel)
	foodLabel.Text = "Food: " .. foodLevel
end)

-- Update upgrade levels in shop
Remotes.UpgradeUpdated.OnClientEvent:Connect(function(upgradeName, newLevel)
	local row = contentFrames["Upgrades"]:FindFirstChild(upgradeName)
	if row then
		local config = GameConfig.Upgrades[upgradeName]
		row.Level.Text = "Lv. " .. newLevel .. "/" .. config.MaxLevel

		if newLevel >= config.MaxLevel then
			row.BuyButton.Text = "MAXED"
			row.BuyButton.BackgroundColor3 = Color3.fromRGB(80, 80, 80)
			row.BuyButton.Active = false
		else
			local cost = math.floor(config.BaseCost * (config.CostMultiplier ^ newLevel))
			row.BuyButton.Text = cost .. " Coins"
		end
	end
end)

-- Mark attack as unlocked
Remotes.AttackUnlocked.OnClientEvent:Connect(function(attackName)
	local row = contentFrames["Attacks"]:FindFirstChild(attackName)
	if row then
		row.BuyButton.Text = "UNLOCKED"
		row.BuyButton.BackgroundColor3 = Color3.fromRGB(80, 80, 80)
		row.BuyButton.Active = false
	end
end)

-- Booster activated feedback
Remotes.BoosterActivated.OnClientEvent:Connect(function(info)
	local row = contentFrames["Boosters"]:FindFirstChild(info.BoosterName)
	if row then
		row.BuyButton.Text = "ACTIVE"
		row.BuyButton.BackgroundColor3 = Color3.fromRGB(0, 180, 0)
		task.delay(info.Duration, function()
			row.BuyButton.Text = "BUY"
			row.BuyButton.BackgroundColor3 = Color3.fromRGB(0, 120, 200)
		end)
	end
end)

-- Initialize
buildShop()
switchTab("Upgrades")

-- Load initial data
task.spawn(function()
	task.wait(2)
	local data = Remotes.GetPlayerData:InvokeServer()
	if data then
		coinsLabel.Text = "Coins: " .. data.Coins
		foodLabel.Text = "Food: " .. data.FoodLevel

		-- Update upgrade levels
		for upgradeName, level in pairs(data.Upgrades) do
			if level > 0 then
				local config = GameConfig.Upgrades[upgradeName]
				local row = contentFrames["Upgrades"]:FindFirstChild(upgradeName)
				if row and config then
					row.Level.Text = "Lv. " .. level .. "/" .. config.MaxLevel
					if level >= config.MaxLevel then
						row.BuyButton.Text = "MAXED"
						row.BuyButton.Active = false
					else
						local cost = math.floor(config.BaseCost * (config.CostMultiplier ^ level))
						row.BuyButton.Text = cost .. " Coins"
					end
				end
			end
		end

		-- Mark unlocked attacks
		for _, attackName in ipairs(data.UnlockedAttacks) do
			local row = contentFrames["Attacks"]:FindFirstChild(attackName)
			if row then
				row.BuyButton.Text = "UNLOCKED"
				row.BuyButton.BackgroundColor3 = Color3.fromRGB(80, 80, 80)
				row.BuyButton.Active = false
			end
		end
	end
end)
