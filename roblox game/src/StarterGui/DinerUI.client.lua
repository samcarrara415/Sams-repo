-- DinerUI.lua
-- Diner menu: red background, chef character image, "MAKE FOOD" button,
-- countdown timer that scales with ingredients, skip queue for 500 Robux

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local GameConfig = require(ReplicatedStorage:WaitForChild("GameConfig"))
local Remotes = require(ReplicatedStorage:WaitForChild("RemoteEvents"))

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

-- ============================================================
-- MAIN SCREEN GUI
-- ============================================================
local screenGui = Instance.new("ScreenGui")
screenGui.Name = "DinerUI"
screenGui.ResetOnSpawn = false
screenGui.Parent = playerGui

-- ============================================================
-- DINER FRAME — RED BACKGROUND
-- ============================================================
local frame = Instance.new("Frame")
frame.Name = "DinerFrame"
frame.Size = UDim2.new(0, 450, 0, 380)
frame.Position = UDim2.new(0.5, -225, 0.5, -190)
frame.BackgroundColor3 = Color3.fromRGB(160, 30, 30) -- RED background
frame.BackgroundTransparency = 0.05
frame.BorderSizePixel = 0
frame.Visible = false
frame.Parent = screenGui

local corner = Instance.new("UICorner")
corner.CornerRadius = UDim.new(0, 16)
corner.Parent = frame

-- Dark border/stroke
local stroke = Instance.new("UIStroke")
stroke.Color = Color3.fromRGB(80, 15, 15)
stroke.Thickness = 3
stroke.Parent = frame

-- ============================================================
-- CHEF IMAGE (top center)
-- Place a Decal or ImageLabel with your chef character render
-- Use rbxassetid:// with your uploaded chef image
-- ============================================================
local chefImageFrame = Instance.new("Frame")
chefImageFrame.Name = "ChefFrame"
chefImageFrame.Size = UDim2.new(0, 120, 0, 120)
chefImageFrame.Position = UDim2.new(0.5, -60, 0, 15)
chefImageFrame.BackgroundColor3 = Color3.fromRGB(120, 20, 20)
chefImageFrame.Parent = frame

local chefCorner = Instance.new("UICorner")
chefCorner.CornerRadius = UDim.new(0, 60) -- circular
chefCorner.Parent = chefImageFrame

local chefImage = Instance.new("ImageLabel")
chefImage.Name = "ChefImage"
chefImage.Size = UDim2.new(1, 0, 1, 0)
chefImage.BackgroundTransparency = 1
chefImage.ScaleType = Enum.ScaleType.Fit
-- REPLACE THIS with your chef character's thumbnail or uploaded image:
-- Use Roblox Studio: upload an image of your chef, get the asset ID
-- Example: chefImage.Image = "rbxassetid://123456789"
chefImage.Image = "" -- SET YOUR CHEF IMAGE ID HERE
chefImage.Parent = chefImageFrame

-- Chef placeholder text (shows if no image set)
local chefPlaceholder = Instance.new("TextLabel")
chefPlaceholder.Size = UDim2.new(1, 0, 1, 0)
chefPlaceholder.BackgroundTransparency = 1
chefPlaceholder.Text = "CHEF"
chefPlaceholder.TextColor3 = Color3.fromRGB(255, 200, 100)
chefPlaceholder.Font = Enum.Font.GothamBold
chefPlaceholder.TextSize = 20
chefPlaceholder.Parent = chefImageFrame

-- ============================================================
-- TITLE
-- ============================================================
local title = Instance.new("TextLabel")
title.Size = UDim2.new(1, 0, 0, 35)
title.Position = UDim2.new(0, 0, 0, 140)
title.BackgroundTransparency = 1
title.Text = "THE DINER"
title.TextColor3 = Color3.fromRGB(255, 240, 200)
title.Font = Enum.Font.GothamBold
title.TextSize = 28
title.TextStrokeTransparency = 0.5
title.TextStrokeColor3 = Color3.fromRGB(0, 0, 0)
title.Parent = frame

-- Ingredient count label
local ingredientLabel = Instance.new("TextLabel")
ingredientLabel.Name = "IngredientCount"
ingredientLabel.Size = UDim2.new(1, 0, 0, 20)
ingredientLabel.Position = UDim2.new(0, 0, 0, 172)
ingredientLabel.BackgroundTransparency = 1
ingredientLabel.Text = "Backpack: 0 ingredients"
ingredientLabel.TextColor3 = Color3.fromRGB(255, 200, 180)
ingredientLabel.Font = Enum.Font.GothamMedium
ingredientLabel.TextSize = 13
ingredientLabel.Parent = frame

-- ============================================================
-- MAKE FOOD BUTTON (big, center)
-- ============================================================
local makeFoodBtn = Instance.new("TextButton")
makeFoodBtn.Name = "MakeFoodButton"
makeFoodBtn.Size = UDim2.new(0, 200, 0, 55)
makeFoodBtn.Position = UDim2.new(0.5, -100, 0, 200)
makeFoodBtn.BackgroundColor3 = Color3.fromRGB(220, 160, 40)
makeFoodBtn.Text = "MAKE FOOD"
makeFoodBtn.TextColor3 = Color3.fromRGB(50, 20, 0)
makeFoodBtn.Font = Enum.Font.GothamBold
makeFoodBtn.TextSize = 22
makeFoodBtn.Parent = frame

local makeFoodCorner = Instance.new("UICorner")
makeFoodCorner.CornerRadius = UDim.new(0, 12)
makeFoodCorner.Parent = makeFoodBtn

local makeFoodStroke = Instance.new("UIStroke")
makeFoodStroke.Color = Color3.fromRGB(180, 120, 0)
makeFoodStroke.Thickness = 2
makeFoodStroke.Parent = makeFoodBtn

-- ============================================================
-- SELL FOR COINS BUTTON (smaller, below)
-- ============================================================
local sellBtn = Instance.new("TextButton")
sellBtn.Name = "SellButton"
sellBtn.Size = UDim2.new(0, 160, 0, 40)
sellBtn.Position = UDim2.new(0.5, -80, 0, 265)
sellBtn.BackgroundColor3 = Color3.fromRGB(50, 140, 50)
sellBtn.Text = "SELL FOR COINS"
sellBtn.TextColor3 = Color3.new(1, 1, 1)
sellBtn.Font = Enum.Font.GothamBold
sellBtn.TextSize = 14
sellBtn.Parent = frame

local sellCorner = Instance.new("UICorner")
sellCorner.CornerRadius = UDim.new(0, 8)
sellCorner.Parent = sellBtn

-- ============================================================
-- CLOSE BUTTON
-- ============================================================
local closeBtn = Instance.new("TextButton")
closeBtn.Size = UDim2.new(0, 35, 0, 35)
closeBtn.Position = UDim2.new(1, -40, 0, 5)
closeBtn.BackgroundColor3 = Color3.fromRGB(100, 20, 20)
closeBtn.Text = "X"
closeBtn.TextColor3 = Color3.fromRGB(255, 200, 200)
closeBtn.Font = Enum.Font.GothamBold
closeBtn.TextSize = 18
closeBtn.Parent = frame

local closeCorner = Instance.new("UICorner")
closeCorner.CornerRadius = UDim.new(0, 8)
closeCorner.Parent = closeBtn

-- ============================================================
-- STATUS / TIMER TEXT
-- ============================================================
local statusText = Instance.new("TextLabel")
statusText.Name = "Status"
statusText.Size = UDim2.new(1, -20, 0, 25)
statusText.Position = UDim2.new(0, 10, 1, -65)
statusText.BackgroundTransparency = 1
statusText.Text = ""
statusText.TextColor3 = Color3.fromRGB(255, 255, 200)
statusText.Font = Enum.Font.GothamBold
statusText.TextSize = 14
statusText.Parent = frame

-- ============================================================
-- COOKING PROGRESS BAR
-- ============================================================
local progressBarBg = Instance.new("Frame")
progressBarBg.Name = "ProgressBarBg"
progressBarBg.Size = UDim2.new(0.8, 0, 0, 18)
progressBarBg.Position = UDim2.new(0.1, 0, 1, -35)
progressBarBg.BackgroundColor3 = Color3.fromRGB(60, 20, 20)
progressBarBg.Visible = false
progressBarBg.Parent = frame

local progressCorner = Instance.new("UICorner")
progressCorner.CornerRadius = UDim.new(0, 6)
progressCorner.Parent = progressBarBg

local progressBar = Instance.new("Frame")
progressBar.Name = "ProgressFill"
progressBar.Size = UDim2.new(0, 0, 1, 0)
progressBar.BackgroundColor3 = Color3.fromRGB(255, 180, 50)
progressBar.Parent = progressBarBg

local progressFillCorner = Instance.new("UICorner")
progressFillCorner.CornerRadius = UDim.new(0, 6)
progressFillCorner.Parent = progressBar

-- ============================================================
-- SKIP QUEUE BUTTON (500 Robux, one-time)
-- ============================================================
local skipBtn = Instance.new("TextButton")
skipBtn.Name = "SkipQueueButton"
skipBtn.Size = UDim2.new(0, 180, 0, 35)
skipBtn.Position = UDim2.new(0.5, -90, 1, -35)
skipBtn.BackgroundColor3 = Color3.fromRGB(0, 120, 200)
skipBtn.Text = "SKIP QUEUE - 500 Robux"
skipBtn.TextColor3 = Color3.new(1, 1, 1)
skipBtn.Font = Enum.Font.GothamBold
skipBtn.TextSize = 12
skipBtn.Visible = false -- shown only while cooking
skipBtn.Parent = frame

local skipCorner = Instance.new("UICorner")
skipCorner.CornerRadius = UDim.new(0, 8)
skipCorner.Parent = skipBtn

-- ============================================================
-- STATE
-- ============================================================
local isCooking = false

-- ============================================================
-- BUTTON HANDLERS
-- ============================================================
makeFoodBtn.MouseButton1Click:Connect(function()
	if isCooking then return end
	isCooking = true
	makeFoodBtn.Active = false
	makeFoodBtn.BackgroundColor3 = Color3.fromRGB(120, 90, 30)
	makeFoodBtn.Text = "COOKING..."
	sellBtn.Active = false
	sellBtn.BackgroundColor3 = Color3.fromRGB(40, 80, 40)
	progressBarBg.Visible = true
	progressBar.Size = UDim2.new(0, 0, 1, 0)
	skipBtn.Visible = true
	Remotes.CookIngredients:FireServer()
end)

sellBtn.MouseButton1Click:Connect(function()
	if isCooking then return end
	Remotes.SellForCoins:FireServer()
	statusText.Text = "Sold for coins!"
	task.wait(1.5)
	statusText.Text = ""
	frame.Visible = false
end)

closeBtn.MouseButton1Click:Connect(function()
	if not isCooking then
		frame.Visible = false
	end
end)

skipBtn.MouseButton1Click:Connect(function()
	Remotes.SkipCookQueue:FireServer()
end)

-- ============================================================
-- COOKING EVENTS
-- ============================================================
Remotes.ChefCookingStarted.OnClientEvent:Connect(function(cookTime, ingredientCount)
	isCooking = true
	if cookTime <= 0 then
		statusText.Text = "Instant cook! (Skip Queue)"
		progressBarBg.Visible = false
		skipBtn.Visible = false
	else
		local mins = math.floor(cookTime / 60)
		local secs = cookTime % 60
		if mins > 0 then
			statusText.Text = "Chef is cooking " .. ingredientCount .. " ingredients... (" .. mins .. "m " .. secs .. "s)"
		else
			statusText.Text = "Chef is cooking " .. ingredientCount .. " ingredients... (" .. secs .. "s)"
		end
	end
end)

Remotes.ChefCookingProgress.OnClientEvent:Connect(function(remaining, totalTime)
	if totalTime <= 0 then return end
	local progress = 1 - (remaining / totalTime)
	progressBar.Size = UDim2.new(math.clamp(progress, 0, 1), 0, 1, 0)

	local mins = math.floor(remaining / 60)
	local secs = math.floor(remaining % 60)
	if mins > 0 then
		statusText.Text = "Cooking... " .. mins .. "m " .. secs .. "s remaining"
	else
		statusText.Text = "Cooking... " .. secs .. "s remaining"
	end
end)

Remotes.ChefCookingDone.OnClientEvent:Connect(function(foodGained, totalFoodLevel)
	isCooking = false
	progressBarBg.Visible = false
	progressBar.Size = UDim2.new(1, 0, 1, 0)
	skipBtn.Visible = false

	makeFoodBtn.Active = true
	makeFoodBtn.BackgroundColor3 = Color3.fromRGB(220, 160, 40)
	makeFoodBtn.Text = "MAKE FOOD"
	sellBtn.Active = true
	sellBtn.BackgroundColor3 = Color3.fromRGB(50, 140, 50)

	statusText.Text = "+" .. foodGained .. " FOOD! (Total: " .. totalFoodLevel .. ")"
	statusText.TextColor3 = Color3.fromRGB(100, 255, 100)

	task.wait(3)
	statusText.Text = ""
	statusText.TextColor3 = Color3.fromRGB(255, 255, 200)
	frame.Visible = false
end)

-- ============================================================
-- PROXIMITY CHECK — show UI when near chef
-- ============================================================
local function checkProximityToChef()
	while true do
		task.wait(0.5)
		local character = player.Character
		if not character then continue end
		local rootPart = character:FindFirstChild("HumanoidRootPart")
		if not rootPart then continue end

		-- Update ingredient count while menu visible
		if frame.Visible then
			local data = Remotes.GetPlayerData:InvokeServer()
			if data then
				ingredientLabel.Text = "Backpack: " .. #data.Backpack .. " ingredients"

				-- Show estimated cook time
				if not isCooking and #data.Backpack > 0 then
					local estTime = GameConfig.Diner.BaseCookTimeSeconds
						+ (#data.Backpack * GameConfig.Diner.CookTimePerIngredient)
					estTime = math.min(estTime, GameConfig.Diner.MaxCookTimeSeconds)
					local mins = math.floor(estTime / 60)
					local secs = estTime % 60
					if mins > 0 then
						statusText.Text = "Est. cook time: " .. mins .. "m " .. secs .. "s"
					else
						statusText.Text = "Est. cook time: " .. secs .. "s"
					end
				end
			end
		end

		local chef = game.Workspace:FindFirstChild("ChefNPC")
		if chef then
			local chefPart = chef:FindFirstChild("HumanoidRootPart")
				or chef.PrimaryPart
				or chef:FindFirstChildOfClass("BasePart")
			if chefPart then
				local dist = (rootPart.Position - chefPart.Position).Magnitude
				if dist < 15 and not isCooking then
					frame.Visible = true
				elseif dist > 25 and not isCooking then
					frame.Visible = false
				end
			end
		end
	end
end

task.spawn(checkProximityToChef)
