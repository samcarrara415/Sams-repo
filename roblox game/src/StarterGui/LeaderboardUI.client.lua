-- LeaderboardUI.lua
-- Creates 3 in-world leaderboard displays (SurfaceGuis on Parts in Workspace)
-- and attaches to Parts named: RebirthLeaderboard, DuelWinsLeaderboard, TopSpenderLeaderboard
-- Also creates the Rebirth button UI on the player's screen

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local GameConfig = require(ReplicatedStorage:WaitForChild("GameConfig"))
local Remotes = require(ReplicatedStorage:WaitForChild("RemoteEvents"))

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

-- ============================================================
-- REBIRTH UI (screen GUI - always visible)
-- ============================================================
local rebirthGui = Instance.new("ScreenGui")
rebirthGui.Name = "RebirthUI"
rebirthGui.ResetOnSpawn = false
rebirthGui.Parent = playerGui

-- Rebirth info frame (top-right)
local rebirthFrame = Instance.new("Frame")
rebirthFrame.Size = UDim2.new(0, 220, 0, 110)
rebirthFrame.Position = UDim2.new(1, -230, 0, 55)
rebirthFrame.BackgroundColor3 = Color3.fromRGB(50, 20, 60)
rebirthFrame.BackgroundTransparency = 0.2
rebirthFrame.Parent = rebirthGui

local rebirthCorner = Instance.new("UICorner")
rebirthCorner.CornerRadius = UDim.new(0, 10)
rebirthCorner.Parent = rebirthFrame

local rebirthStroke = Instance.new("UIStroke")
rebirthStroke.Color = Color3.fromRGB(200, 100, 255)
rebirthStroke.Thickness = 2
rebirthStroke.Parent = rebirthFrame

-- Rebirth count
local rebirthCountLabel = Instance.new("TextLabel")
rebirthCountLabel.Name = "RebirthCount"
rebirthCountLabel.Size = UDim2.new(1, 0, 0, 22)
rebirthCountLabel.Position = UDim2.new(0, 0, 0, 5)
rebirthCountLabel.BackgroundTransparency = 1
rebirthCountLabel.Text = "Rebirths: 0"
rebirthCountLabel.TextColor3 = Color3.fromRGB(200, 100, 255)
rebirthCountLabel.Font = Enum.Font.GothamBold
rebirthCountLabel.TextSize = 16
rebirthCountLabel.Parent = rebirthFrame

-- Boost label
local boostLabel = Instance.new("TextLabel")
boostLabel.Name = "BoostLabel"
boostLabel.Size = UDim2.new(1, 0, 0, 18)
boostLabel.Position = UDim2.new(0, 0, 0, 26)
boostLabel.BackgroundTransparency = 1
boostLabel.Text = "Boost: +0%"
boostLabel.TextColor3 = Color3.fromRGB(180, 255, 180)
boostLabel.Font = Enum.Font.Gotham
boostLabel.TextSize = 13
boostLabel.Parent = rebirthFrame

-- Cost label
local costLabel = Instance.new("TextLabel")
costLabel.Name = "CostLabel"
costLabel.Size = UDim2.new(1, 0, 0, 18)
costLabel.Position = UDim2.new(0, 0, 0, 44)
costLabel.BackgroundTransparency = 1
costLabel.Text = "Need: 500 food"
costLabel.TextColor3 = Color3.fromRGB(200, 200, 200)
costLabel.Font = Enum.Font.Gotham
costLabel.TextSize = 12
costLabel.Parent = rebirthFrame

-- Rebirth button
local rebirthBtn = Instance.new("TextButton")
rebirthBtn.Name = "RebirthButton"
rebirthBtn.Size = UDim2.new(0.8, 0, 0, 30)
rebirthBtn.Position = UDim2.new(0.1, 0, 0, 68)
rebirthBtn.BackgroundColor3 = Color3.fromRGB(150, 50, 200)
rebirthBtn.Text = "REBIRTH"
rebirthBtn.TextColor3 = Color3.new(1, 1, 1)
rebirthBtn.Font = Enum.Font.GothamBold
rebirthBtn.TextSize = 16
rebirthBtn.Parent = rebirthFrame

local rebirthBtnCorner = Instance.new("UICorner")
rebirthBtnCorner.CornerRadius = UDim.new(0, 8)
rebirthBtnCorner.Parent = rebirthBtn

rebirthBtn.MouseButton1Click:Connect(function()
	Remotes.RequestRebirth:FireServer()
end)

-- Update rebirth info
local function updateRebirthUI(rebirths, boost, nextCost, foodLevel)
	rebirthCountLabel.Text = "Rebirths: " .. rebirths
	boostLabel.Text = "Boost: +" .. math.floor(rebirths * GameConfig.Rebirth.BoostPerRebirth * 100) .. "%"
	costLabel.Text = "Need: " .. nextCost .. " food (You: " .. (foodLevel or "?") .. ")"

	if foodLevel and foodLevel >= nextCost then
		rebirthBtn.BackgroundColor3 = Color3.fromRGB(150, 50, 200)
		rebirthBtn.Text = "REBIRTH"
	else
		rebirthBtn.BackgroundColor3 = Color3.fromRGB(80, 40, 80)
		rebirthBtn.Text = "REBIRTH (need more food)"
	end
end

Remotes.RebirthComplete.OnClientEvent:Connect(function(info)
	updateRebirthUI(info.NewRebirthCount, info.NewMultiplier, info.NextCost, 0)

	-- Flash effect
	rebirthFrame.BackgroundColor3 = Color3.fromRGB(200, 100, 255)
	task.wait(0.3)
	rebirthFrame.BackgroundColor3 = Color3.fromRGB(50, 20, 60)
end)

Remotes.FoodLevelUpdated.OnClientEvent:Connect(function(foodLevel)
	local data = Remotes.GetPlayerData:InvokeServer()
	if data then
		local nextCost = math.floor(GameConfig.Rebirth.BaseFoodRequired * (GameConfig.Rebirth.FoodMultiplierPerRebirth ^ data.Rebirths))
		updateRebirthUI(data.Rebirths, 0, nextCost, foodLevel)
	end
end)

-- ============================================================
-- IN-WORLD LEADERBOARD DISPLAYS
-- ============================================================
-- These create SurfaceGuis on Parts in Workspace
-- Place 3 tall Parts named: RebirthLeaderboard, DuelWinsLeaderboard, TopSpenderLeaderboard

local boardConfigs = {
	{PartName = "RebirthLeaderboard",   DataKey = "Rebirths",    Title = "REBIRTHS",    Color = Color3.fromRGB(200, 100, 255)},
	{PartName = "DuelWinsLeaderboard",  DataKey = "DuelWins",    Title = "DUEL WINS",   Color = Color3.fromRGB(255, 80, 80)},
	{PartName = "TopSpenderLeaderboard",DataKey = "TopSpender",  Title = "TOP SPENDER", Color = Color3.fromRGB(255, 215, 0)},
}

local surfaceGuis = {}

local function createBoardGui(part, config)
	local gui = Instance.new("SurfaceGui")
	gui.Name = config.DataKey .. "Board"
	gui.Face = Enum.NormalId.Front
	gui.SizingMode = Enum.SurfaceGuiSizingMode.PixelsPerStud
	gui.PixelsPerStud = 50
	gui.Parent = part

	-- Background
	local bg = Instance.new("Frame")
	bg.Size = UDim2.new(1, 0, 1, 0)
	bg.BackgroundColor3 = Color3.fromRGB(20, 20, 30)
	bg.BackgroundTransparency = 0.1
	bg.Parent = gui

	-- Title
	local titleLabel = Instance.new("TextLabel")
	titleLabel.Size = UDim2.new(1, 0, 0, 60)
	titleLabel.BackgroundColor3 = config.Color
	titleLabel.BackgroundTransparency = 0.3
	titleLabel.Text = config.Title
	titleLabel.TextColor3 = Color3.new(1, 1, 1)
	titleLabel.Font = Enum.Font.GothamBold
	titleLabel.TextSize = 40
	titleLabel.TextStrokeTransparency = 0
	titleLabel.Parent = bg

	-- Entries container
	local entriesFrame = Instance.new("Frame")
	entriesFrame.Name = "Entries"
	entriesFrame.Size = UDim2.new(1, 0, 1, -60)
	entriesFrame.Position = UDim2.new(0, 0, 0, 60)
	entriesFrame.BackgroundTransparency = 1
	entriesFrame.Parent = bg

	local layout = Instance.new("UIListLayout")
	layout.Padding = UDim.new(0, 2)
	layout.Parent = entriesFrame

	return gui
end

local function updateBoardDisplay(config, entries)
	local part = game.Workspace:FindFirstChild(config.PartName)
	if not part then return end

	local gui = surfaceGuis[config.DataKey]
	if not gui then
		gui = createBoardGui(part, config)
		surfaceGuis[config.DataKey] = gui
	end

	local entriesFrame = gui:FindFirstChild("Frame") and gui.Frame:FindFirstChild("Entries")
	if not entriesFrame then
		-- Try alternate path
		for _, child in ipairs(gui:GetDescendants()) do
			if child.Name == "Entries" then
				entriesFrame = child
				break
			end
		end
	end
	if not entriesFrame then return end

	-- Clear old entries
	for _, child in ipairs(entriesFrame:GetChildren()) do
		if child:IsA("Frame") then child:Destroy() end
	end

	-- Rank colors
	local rankColors = {
		[1] = Color3.fromRGB(255, 215, 0),   -- Gold
		[2] = Color3.fromRGB(192, 192, 192), -- Silver
		[3] = Color3.fromRGB(205, 127, 50),  -- Bronze
	}

	for _, entry in ipairs(entries) do
		local row = Instance.new("Frame")
		row.Size = UDim2.new(1, 0, 0, 30)
		row.BackgroundColor3 = (entry.Rank <= 3) and Color3.fromRGB(40, 40, 50) or Color3.fromRGB(30, 30, 35)
		row.BackgroundTransparency = 0.3
		row.Parent = entriesFrame

		local rankLabel = Instance.new("TextLabel")
		rankLabel.Size = UDim2.new(0, 40, 1, 0)
		rankLabel.BackgroundTransparency = 1
		rankLabel.Text = "#" .. entry.Rank
		rankLabel.TextColor3 = rankColors[entry.Rank] or Color3.fromRGB(180, 180, 180)
		rankLabel.Font = Enum.Font.GothamBold
		rankLabel.TextSize = 20
		rankLabel.Parent = row

		local nameLabel = Instance.new("TextLabel")
		nameLabel.Size = UDim2.new(0.6, -40, 1, 0)
		nameLabel.Position = UDim2.new(0, 45, 0, 0)
		nameLabel.BackgroundTransparency = 1
		nameLabel.Text = entry.Name
		nameLabel.TextColor3 = Color3.new(1, 1, 1)
		nameLabel.Font = Enum.Font.GothamMedium
		nameLabel.TextSize = 18
		nameLabel.TextXAlignment = Enum.TextXAlignment.Left
		nameLabel.TextTruncate = Enum.TextTruncate.AtEnd
		nameLabel.Parent = row

		local valueLabel = Instance.new("TextLabel")
		valueLabel.Size = UDim2.new(0.3, 0, 1, 0)
		valueLabel.Position = UDim2.new(0.7, 0, 0, 0)
		valueLabel.BackgroundTransparency = 1
		valueLabel.Text = tostring(entry.Value)
		valueLabel.TextColor3 = config.Color
		valueLabel.Font = Enum.Font.GothamBold
		valueLabel.TextSize = 22
		valueLabel.Parent = row
	end
end

-- Listen for leaderboard updates from server
Remotes.LeaderboardUpdated.OnClientEvent:Connect(function(allBoards)
	for _, config in ipairs(boardConfigs) do
		local entries = allBoards[config.DataKey]
		if entries then
			updateBoardDisplay(config, entries)
		end
	end
end)

-- Initial load
task.spawn(function()
	task.wait(3)

	-- Load rebirth info
	local data = Remotes.GetPlayerData:InvokeServer()
	if data then
		local nextCost = math.floor(GameConfig.Rebirth.BaseFoodRequired * (GameConfig.Rebirth.FoodMultiplierPerRebirth ^ data.Rebirths))
		updateRebirthUI(data.Rebirths, 0, nextCost, data.FoodLevel)
	end

	-- Load leaderboards
	local boards = Remotes.GetLeaderboardData:InvokeServer()
	if boards then
		for _, config in ipairs(boardConfigs) do
			local entries = boards[config.DataKey]
			if entries then
				updateBoardDisplay(config, entries)
			end
		end
	end
end)
