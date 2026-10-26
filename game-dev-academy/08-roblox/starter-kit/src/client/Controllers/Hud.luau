--!strict
-- Minimal phone-first HUD built in code so the kit runs in an empty place.
-- Replace with your own art later; keep the rules: big tap targets, icons over text,
-- short numbers, nothing covering the play area (04-art/04-ui-for-kids-on-phones.md).

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TweenService = game:GetService("TweenService")

local Format = require(ReplicatedStorage.Shared.Format)

local player = Players.LocalPlayer

local Hud = {}

local gui: ScreenGui
local cashLabel: TextLabel
local waveLabel: TextLabel
local banner: TextLabel
Hud.towerButtons = {} :: { [string]: TextButton }

local function label(parent: Instance, size: UDim2, pos: UDim2, text: string): TextLabel
	local l = Instance.new("TextLabel")
	l.Size = size
	l.Position = pos
	l.BackgroundTransparency = 0.3
	l.BackgroundColor3 = Color3.fromRGB(20, 20, 30)
	l.TextColor3 = Color3.new(1, 1, 1)
	l.Font = Enum.Font.FredokaOne
	l.TextScaled = true
	l.Text = text
	l.Parent = parent
	Instance.new("UICorner", l).CornerRadius = UDim.new(0, 12)
	return l
end

function Hud.pop(target: GuiObject)
	local scale = target:FindFirstChildOfClass("UIScale") or Instance.new("UIScale", target)
	scale.Scale = 0.85
	TweenService:Create(scale, TweenInfo.new(0.2, Enum.EasingStyle.Back, Enum.EasingDirection.Out), { Scale = 1 }):Play()
end

-- Short message across the top: wave warnings, errors, rewards. Max ~4 words for kids.
function Hud.banner(text: string, seconds: number?)
	banner.Text = text
	banner.Visible = true
	Hud.pop(banner)
	local shownText = text
	task.delay(seconds or 2.5, function()
		if banner.Text == shownText then
			banner.Visible = false
		end
	end)
end

function Hud.setWave(text: string)
	waveLabel.Text = text
end

function Hud.addTowerButton(kind: string, cost: number): TextButton
	local bar = gui:FindFirstChild("TowerBar") :: Frame
	local b = Instance.new("TextButton")
	b.Name = kind
	b.Size = UDim2.new(0, 110, 1, 0) -- wide, tall targets for small thumbs
	b.BackgroundColor3 = Color3.fromRGB(60, 130, 255)
	b.TextColor3 = Color3.new(1, 1, 1)
	b.Font = Enum.Font.FredokaOne
	b.TextScaled = true
	b.Text = `{kind}\n${Format.short(cost)}`
	b.Parent = bar
	Instance.new("UICorner", b).CornerRadius = UDim.new(0, 14)
	Hud.towerButtons[kind] = b
	return b
end

function Hud.start()
	gui = Instance.new("ScreenGui")
	gui.Name = "Hud"
	gui.ResetOnSpawn = false
	gui.ScreenInsets = Enum.ScreenInsets.CoreUISafeInsets -- clear of notches and the Roblox top bar
	gui.Parent = player:WaitForChild("PlayerGui")

	cashLabel = label(gui, UDim2.fromOffset(150, 44), UDim2.new(0, 12, 0, 12), "$0")
	waveLabel = label(gui, UDim2.fromOffset(190, 44), UDim2.new(1, -202, 0, 12), "Get ready!")
	banner = label(gui, UDim2.new(0.6, 0, 0, 56), UDim2.new(0.2, 0, 0, 70), "")
	banner.Visible = false

	-- Tower bar at the bottom: the thumb zone on phones.
	local bar = Instance.new("Frame")
	bar.Name = "TowerBar"
	bar.Size = UDim2.new(1, -24, 0, 84)
	bar.Position = UDim2.new(0, 12, 1, -96)
	bar.BackgroundTransparency = 1
	bar.Parent = gui
	local layout = Instance.new("UIListLayout")
	layout.FillDirection = Enum.FillDirection.Horizontal
	layout.HorizontalAlignment = Enum.HorizontalAlignment.Center
	layout.Padding = UDim.new(0, 12)
	layout.Parent = bar

	local function updateCash()
		cashLabel.Text = "$" .. Format.short(player:GetAttribute("Cash") or 0)
	end
	player:GetAttributeChangedSignal("Cash"):Connect(function()
		updateCash()
		Hud.pop(cashLabel)
	end)
	updateCash()
end

return Hud
