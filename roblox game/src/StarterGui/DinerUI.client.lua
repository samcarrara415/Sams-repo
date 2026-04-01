-- DinerUI.lua
-- UI for the Diner: choose to COOK (get food/growth) or SELL (get coins)

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Remotes = require(ReplicatedStorage:WaitForChild("RemoteEvents"))

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

-- Create the diner UI (hidden by default, shown when near the chef)
local screenGui = Instance.new("ScreenGui")
screenGui.Name = "DinerUI"
screenGui.ResetOnSpawn = false
screenGui.Parent = playerGui

local frame = Instance.new("Frame")
frame.Name = "DinerFrame"
frame.Size = UDim2.new(0, 350, 0, 250)
frame.Position = UDim2.new(0.5, -175, 0.5, -125)
frame.BackgroundColor3 = Color3.fromRGB(50, 35, 20)
frame.BackgroundTransparency = 0.1
frame.BorderSizePixel = 0
frame.Visible = false
frame.Parent = screenGui

local corner = Instance.new("UICorner")
corner.CornerRadius = UDim.new(0, 16)
corner.Parent = frame

-- Title
local title = Instance.new("TextLabel")
title.Size = UDim2.new(1, 0, 0, 50)
title.BackgroundTransparency = 1
title.Text = "THE DINER"
title.TextColor3 = Color3.fromRGB(255, 220, 100)
title.Font = Enum.Font.GothamBold
title.TextSize = 26
title.Parent = frame

-- Subtitle
local subtitle = Instance.new("TextLabel")
subtitle.Size = UDim2.new(1, 0, 0, 25)
subtitle.Position = UDim2.new(0, 0, 0, 45)
subtitle.BackgroundTransparency = 1
subtitle.Text = "What'll it be, chud?"
subtitle.TextColor3 = Color3.fromRGB(200, 180, 140)
subtitle.Font = Enum.Font.GothamMedium
subtitle.TextSize = 14
subtitle.Parent = frame

-- Cook button (turns ingredients into food/growth)
local cookBtn = Instance.new("TextButton")
cookBtn.Name = "CookButton"
cookBtn.Size = UDim2.new(0, 140, 0, 70)
cookBtn.Position = UDim2.new(0, 25, 0, 100)
cookBtn.BackgroundColor3 = Color3.fromRGB(200, 80, 30)
cookBtn.Text = "COOK IT\n(Get Chudded)"
cookBtn.TextColor3 = Color3.new(1, 1, 1)
cookBtn.Font = Enum.Font.GothamBold
cookBtn.TextSize = 16
cookBtn.Parent = frame

local cookCorner = Instance.new("UICorner")
cookCorner.CornerRadius = UDim.new(0, 10)
cookCorner.Parent = cookBtn

-- Sell button (turns ingredients into coins)
local sellBtn = Instance.new("TextButton")
sellBtn.Name = "SellButton"
sellBtn.Size = UDim2.new(0, 140, 0, 70)
sellBtn.Position = UDim2.new(1, -165, 0, 100)
sellBtn.BackgroundColor3 = Color3.fromRGB(50, 160, 50)
sellBtn.Text = "SELL IT\n(Get Coins)"
sellBtn.TextColor3 = Color3.new(1, 1, 1)
sellBtn.Font = Enum.Font.GothamBold
sellBtn.TextSize = 16
sellBtn.Parent = frame

local sellCorner = Instance.new("UICorner")
sellCorner.CornerRadius = UDim.new(0, 10)
sellCorner.Parent = sellBtn

-- Close button
local closeBtn = Instance.new("TextButton")
closeBtn.Size = UDim2.new(0, 30, 0, 30)
closeBtn.Position = UDim2.new(1, -35, 0, 5)
closeBtn.BackgroundTransparency = 1
closeBtn.Text = "X"
closeBtn.TextColor3 = Color3.fromRGB(255, 100, 100)
closeBtn.Font = Enum.Font.GothamBold
closeBtn.TextSize = 18
closeBtn.Parent = frame

-- Status text
local statusText = Instance.new("TextLabel")
statusText.Name = "Status"
statusText.Size = UDim2.new(1, 0, 0, 30)
statusText.Position = UDim2.new(0, 0, 1, -40)
statusText.BackgroundTransparency = 1
statusText.Text = ""
statusText.TextColor3 = Color3.fromRGB(255, 255, 200)
statusText.Font = Enum.Font.Gotham
statusText.TextSize = 14
statusText.Parent = frame

-- Button handlers
cookBtn.MouseButton1Click:Connect(function()
	statusText.Text = "Chef is cooking..."
	cookBtn.Active = false
	sellBtn.Active = false
	Remotes.CookIngredients:FireServer()
end)

sellBtn.MouseButton1Click:Connect(function()
	Remotes.SellForCoins:FireServer()
	statusText.Text = "Sold for coins!"
	task.wait(1.5)
	statusText.Text = ""
	frame.Visible = false
end)

closeBtn.MouseButton1Click:Connect(function()
	frame.Visible = false
end)

-- Chef cooking feedback
Remotes.ChefCookingStarted.OnClientEvent:Connect(function()
	statusText.Text = "Chef is cooking your ingredients..."
end)

Remotes.ChefCookingDone.OnClientEvent:Connect(function(foodGained, totalFoodLevel)
	statusText.Text = "You gained " .. foodGained .. " food! (Total: " .. totalFoodLevel .. ")"
	cookBtn.Active = true
	sellBtn.Active = true
	task.wait(3)
	statusText.Text = ""
	frame.Visible = false
end)

-- Show diner UI when near the chef NPC
local function checkProximityToChef()
	while true do
		task.wait(0.5)
		local character = player.Character
		if not character then continue end
		local rootPart = character:FindFirstChild("HumanoidRootPart")
		if not rootPart then continue end

		local chef = game.Workspace:FindFirstChild("ChefNPC")
		if chef then
			local chefPart = chef:FindFirstChild("HumanoidRootPart") or chef.PrimaryPart or chef:FindFirstChildOfClass("BasePart")
			if chefPart then
				local dist = (rootPart.Position - chefPart.Position).Magnitude
				if dist < 15 then
					frame.Visible = true
				end
			end
		end
	end
end

task.spawn(checkProximityToChef)
