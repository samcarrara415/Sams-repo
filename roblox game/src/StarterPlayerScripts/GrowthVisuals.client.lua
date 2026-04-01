-- GrowthVisuals.lua
-- Client script: handles visual/audio feedback when the player grows

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TweenService = game:GetService("TweenService")
local Remotes = require(ReplicatedStorage:WaitForChild("RemoteEvents"))

local player = Players.LocalPlayer
local currentFoodLevel = 0

-- Flash effect when food level increases
local function playGrowthEffect()
	local character = player.Character
	if not character then return end

	-- Brief highlight on all parts
	for _, part in ipairs(character:GetDescendants()) do
		if part:IsA("BasePart") then
			local highlight = Instance.new("Highlight")
			highlight.FillColor = Color3.fromRGB(0, 255, 100)
			highlight.FillTransparency = 0.5
			highlight.OutlineTransparency = 1
			highlight.Parent = part

			task.delay(0.5, function()
				if highlight and highlight.Parent then
					highlight:Destroy()
				end
			end)
		end
	end
end

-- Camera shake on big growth
local function cameraShake(intensity)
	local camera = Workspace.CurrentCamera
	if not camera then return end

	local originalCFrame = camera.CFrame
	for _ = 1, 5 do
		local offset = Vector3.new(
			(math.random() - 0.5) * intensity,
			(math.random() - 0.5) * intensity,
			0
		)
		camera.CFrame = originalCFrame * CFrame.new(offset)
		task.wait(0.05)
	end
	camera.CFrame = originalCFrame
end

Remotes.FoodLevelUpdated.OnClientEvent:Connect(function(newFoodLevel)
	local gained = newFoodLevel - currentFoodLevel
	currentFoodLevel = newFoodLevel

	if gained > 0 then
		playGrowthEffect()

		-- Big growth = camera shake
		if gained >= 20 then
			cameraShake(0.3)
		end
	end
end)
