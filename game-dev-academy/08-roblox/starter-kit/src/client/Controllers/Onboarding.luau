--!strict
-- Contextual hints instead of a forced tutorial (02-game-design/02-first-five-minutes.md):
-- one bouncing pointer at a time, max ~4 words, shown only when it's useful.

local TweenService = game:GetService("TweenService")

local Onboarding = {}

local pointer: TextLabel? = nil

local function clear()
	if pointer then
		pointer:Destroy()
		pointer = nil
	end
end

-- Bouncing hand above a GUI element.
local function pointAt(target: GuiObject, text: string)
	clear()
	local p = Instance.new("TextLabel")
	p.Name = "OnboardingPointer"
	p.Size = UDim2.fromOffset(160, 60)
	p.AnchorPoint = Vector2.new(0.5, 1)
	p.Position = UDim2.new(0.5, 0, 0, -6)
	p.BackgroundTransparency = 1
	p.Text = "👇 " .. text
	p.TextColor3 = Color3.new(1, 1, 1)
	p.TextStrokeTransparency = 0
	p.Font = Enum.Font.FredokaOne
	p.TextScaled = true
	p.ZIndex = 10
	p.Parent = target
	TweenService:Create(
		p,
		TweenInfo.new(0.45, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut, -1, true),
		{ Position = UDim2.new(0.5, 0, 0, -18) }
	):Play()
	pointer = p
end

function Onboarding.start(hud: any, placement: any, isNewPlayer: boolean)
	if not isNewPlayer then
		return
	end
	-- Step 1: point at the cheapest tower button.
	local first = hud.towerButtons.Archer
	if first then
		pointAt(first, "Tap a tower!")
		first.Activated:Once(function()
			hud.banner("Now tap the grass!", 4)
			clear()
		end)
	end
	-- Step 2: done after the first successful placement. Later hints (e.g. "Upgrade!")
	-- should appear only when the player can afford one and hasn't upgraded yet.
	placement.Placed:Once(function()
		clear()
		hud.banner("Nice! 🎉", 1.5)
	end)
end

return Onboarding
