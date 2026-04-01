-- BattleUI.lua
-- Battle HUD: health bars, attack cooldowns, battle results

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local GameConfig = require(ReplicatedStorage:WaitForChild("GameConfig"))
local Remotes = require(ReplicatedStorage:WaitForChild("RemoteEvents"))

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

-- Create battle UI
local screenGui = Instance.new("ScreenGui")
screenGui.Name = "BattleUI"
screenGui.ResetOnSpawn = false
screenGui.Parent = playerGui

-- Battle HUD (hidden until in battle)
local battleHud = Instance.new("Frame")
battleHud.Name = "BattleHUD"
battleHud.Size = UDim2.new(0, 500, 0, 120)
battleHud.Position = UDim2.new(0.5, -250, 0, 10)
battleHud.BackgroundColor3 = Color3.fromRGB(30, 30, 30)
battleHud.BackgroundTransparency = 0.3
battleHud.BorderSizePixel = 0
battleHud.Visible = false
battleHud.Parent = screenGui

local hudCorner = Instance.new("UICorner")
hudCorner.CornerRadius = UDim.new(0, 10)
hudCorner.Parent = battleHud

-- Your HP bar
local yourHPBg = Instance.new("Frame")
yourHPBg.Size = UDim2.new(0.45, 0, 0, 25)
yourHPBg.Position = UDim2.new(0.025, 0, 0, 10)
yourHPBg.BackgroundColor3 = Color3.fromRGB(60, 60, 60)
yourHPBg.Parent = battleHud

local yourHP = Instance.new("Frame")
yourHP.Name = "YourHPBar"
yourHP.Size = UDim2.new(1, 0, 1, 0)
yourHP.BackgroundColor3 = Color3.fromRGB(0, 200, 0)
yourHP.Parent = yourHPBg

local yourLabel = Instance.new("TextLabel")
yourLabel.Size = UDim2.new(1, 0, 1, 0)
yourLabel.BackgroundTransparency = 1
yourLabel.Text = "YOU"
yourLabel.TextColor3 = Color3.new(1, 1, 1)
yourLabel.Font = Enum.Font.GothamBold
yourLabel.TextSize = 14
yourLabel.Parent = yourHPBg

-- VS label
local vsLabel = Instance.new("TextLabel")
vsLabel.Size = UDim2.new(0.1, 0, 0, 25)
vsLabel.Position = UDim2.new(0.45, 0, 0, 10)
vsLabel.BackgroundTransparency = 1
vsLabel.Text = "VS"
vsLabel.TextColor3 = Color3.fromRGB(255, 50, 50)
vsLabel.Font = Enum.Font.GothamBold
vsLabel.TextSize = 20
vsLabel.Parent = battleHud

-- Opponent HP bar
local oppHPBg = Instance.new("Frame")
oppHPBg.Size = UDim2.new(0.45, 0, 0, 25)
oppHPBg.Position = UDim2.new(0.525, 0, 0, 10)
oppHPBg.BackgroundColor3 = Color3.fromRGB(60, 60, 60)
oppHPBg.Parent = battleHud

local oppHP = Instance.new("Frame")
oppHP.Name = "OppHPBar"
oppHP.Size = UDim2.new(1, 0, 1, 0)
oppHP.BackgroundColor3 = Color3.fromRGB(200, 0, 0)
oppHP.Parent = oppHPBg

local oppLabel = Instance.new("TextLabel")
oppLabel.Name = "OppName"
oppLabel.Size = UDim2.new(1, 0, 1, 0)
oppLabel.BackgroundTransparency = 1
oppLabel.Text = "OPPONENT"
oppLabel.TextColor3 = Color3.new(1, 1, 1)
oppLabel.Font = Enum.Font.GothamBold
oppLabel.TextSize = 14
oppLabel.Parent = oppHPBg

-- Attack hotbar
local hotbar = Instance.new("Frame")
hotbar.Name = "AttackHotbar"
hotbar.Size = UDim2.new(1, -20, 0, 55)
hotbar.Position = UDim2.new(0, 10, 0, 50)
hotbar.BackgroundTransparency = 1
hotbar.Parent = battleHud

local hotbarLayout = Instance.new("UIListLayout")
hotbarLayout.FillDirection = Enum.FillDirection.Horizontal
hotbarLayout.Padding = UDim.new(0, 5)
hotbarLayout.Parent = hotbar

-- Result popup
local resultFrame = Instance.new("Frame")
resultFrame.Name = "ResultPopup"
resultFrame.Size = UDim2.new(0, 400, 0, 150)
resultFrame.Position = UDim2.new(0.5, -200, 0.3, 0)
resultFrame.BackgroundColor3 = Color3.fromRGB(20, 20, 20)
resultFrame.BackgroundTransparency = 0.2
resultFrame.Visible = false
resultFrame.Parent = screenGui

local resultCorner = Instance.new("UICorner")
resultCorner.CornerRadius = UDim.new(0, 16)
resultCorner.Parent = resultFrame

local resultText = Instance.new("TextLabel")
resultText.Name = "ResultText"
resultText.Size = UDim2.new(1, 0, 1, 0)
resultText.BackgroundTransparency = 1
resultText.Text = ""
resultText.TextColor3 = Color3.new(1, 1, 1)
resultText.Font = Enum.Font.GothamBold
resultText.TextSize = 28
resultText.TextWrapped = true
resultText.Parent = resultFrame

-- Queue button (bottom center, always visible)
local queueBtn = Instance.new("TextButton")
queueBtn.Name = "QueueButton"
queueBtn.Size = UDim2.new(0, 200, 0, 50)
queueBtn.Position = UDim2.new(0.5, -100, 1, -70)
queueBtn.BackgroundColor3 = Color3.fromRGB(180, 50, 50)
queueBtn.Text = "ENTER ARENA"
queueBtn.TextColor3 = Color3.new(1, 1, 1)
queueBtn.Font = Enum.Font.GothamBold
queueBtn.TextSize = 18
queueBtn.Parent = screenGui

local queueCorner = Instance.new("UICorner")
queueCorner.CornerRadius = UDim.new(0, 10)
queueCorner.Parent = queueBtn

local inQueue = false

queueBtn.MouseButton1Click:Connect(function()
	if inQueue then
		Remotes.LeaveBattleQueue:FireServer()
		queueBtn.Text = "ENTER ARENA"
		queueBtn.BackgroundColor3 = Color3.fromRGB(180, 50, 50)
		inQueue = false
	else
		Remotes.JoinBattleQueue:FireServer()
		queueBtn.Text = "SEARCHING..."
		queueBtn.BackgroundColor3 = Color3.fromRGB(180, 180, 50)
		inQueue = true
	end
end)

local maxYourHP = 100
local maxOppHP = 100

-- Battle started
Remotes.BattleStarted.OnClientEvent:Connect(function(info)
	battleHud.Visible = true
	queueBtn.Visible = false
	inQueue = false

	maxYourHP = info.YourHP
	maxOppHP = info.OpponentHP
	yourHP.Size = UDim2.new(1, 0, 1, 0)
	oppHP.Size = UDim2.new(1, 0, 1, 0)
	oppLabel.Text = info.Opponent

	-- Build attack hotbar
	for _, child in ipairs(hotbar:GetChildren()) do
		if child:IsA("Frame") then child:Destroy() end
	end

	local data = Remotes.GetPlayerData:InvokeServer()
	if data then
		for i, attackName in ipairs(data.UnlockedAttacks) do
			local slot = Instance.new("Frame")
			slot.Size = UDim2.new(0, 60, 0, 50)
			slot.BackgroundColor3 = Color3.fromRGB(70, 60, 50)
			slot.Parent = hotbar

			local slotCorner = Instance.new("UICorner")
			slotCorner.CornerRadius = UDim.new(0, 6)
			slotCorner.Parent = slot

			local keyLabel = Instance.new("TextLabel")
			keyLabel.Size = UDim2.new(1, 0, 0, 15)
			keyLabel.BackgroundTransparency = 1
			keyLabel.Text = tostring(i)
			keyLabel.TextColor3 = Color3.fromRGB(255, 200, 100)
			keyLabel.Font = Enum.Font.GothamBold
			keyLabel.TextSize = 12
			keyLabel.Parent = slot

			local nameLabel = Instance.new("TextLabel")
			nameLabel.Size = UDim2.new(1, 0, 0, 35)
			nameLabel.Position = UDim2.new(0, 0, 0, 15)
			nameLabel.BackgroundTransparency = 1
			nameLabel.Text = attackName
			nameLabel.TextColor3 = Color3.new(1, 1, 1)
			nameLabel.Font = Enum.Font.Gotham
			nameLabel.TextSize = 9
			nameLabel.TextWrapped = true
			nameLabel.Parent = slot
		end
	end
end)

-- Health updates
Remotes.BattleHealthUpdated.OnClientEvent:Connect(function(info)
	yourHP.Size = UDim2.new(math.clamp(info.YourHP / maxYourHP, 0, 1), 0, 1, 0)
	oppHP.Size = UDim2.new(math.clamp(info.OpponentHP / maxOppHP, 0, 1), 0, 1, 0)
end)

-- Battle ended
Remotes.BattleEnded.OnClientEvent:Connect(function(info)
	battleHud.Visible = false
	queueBtn.Visible = true
	queueBtn.Text = "ENTER ARENA"

	if info.Result == "WIN" then
		resultText.Text = "VICTORY!\nStole " .. (info.FoodStolen or 0) .. " food from " .. info.OpponentName
		resultText.TextColor3 = Color3.fromRGB(0, 255, 100)
	elseif info.Result == "LOSE" then
		resultText.Text = "DEFEATED!\nLost " .. (info.FoodLost or 0) .. " food to " .. info.OpponentName
		resultText.TextColor3 = Color3.fromRGB(255, 80, 80)
	else
		resultText.Text = "DRAW!\nNo food was stolen"
		resultText.TextColor3 = Color3.fromRGB(200, 200, 100)
	end

	resultFrame.Visible = true
	task.delay(4, function()
		resultFrame.Visible = false
	end)
end)
