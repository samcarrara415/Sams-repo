--!strict
-- Tap a tower button, then tap the ground to place it. Works with touch and mouse.
-- The client only asks; the SERVER decides if the placement is allowed.
-- Next step for your game: a ghost preview with a range ring while a tower is selected.

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local UserInputService = game:GetService("UserInputService")

local Towers = require(ReplicatedStorage.Shared.Config.Towers)

local Placement = {}

local selected: string? = nil
local placedEvent = Instance.new("BindableEvent")
Placement.Placed = placedEvent.Event -- fires (kind) after the server accepts a placement

function Placement.select(kind: string?)
	selected = kind
end

function Placement.start(remotes: Folder, hud: any)
	local placeRemote = remotes:WaitForChild("PlaceTower") :: RemoteFunction
	local placeable = workspace:WaitForChild("Map"):WaitForChild("Placeable")
	local camera = workspace.CurrentCamera

	for kind, cfg in Towers do
		local button = hud.addTowerButton(kind, cfg.cost)
		button.Activated:Connect(function()
			hud.pop(button)
			Placement.select(if selected == kind then nil else kind)
			for k, b in hud.towerButtons do
				b.BackgroundColor3 = if k == selected then Color3.fromRGB(255, 190, 40) else Color3.fromRGB(60, 130, 255)
			end
		end)
	end

	local params = RaycastParams.new()
	params.FilterType = Enum.RaycastFilterType.Include
	params.FilterDescendantsInstances = { placeable }

	local function tryPlace(screenPos: Vector2)
		local kind = selected
		if not kind then
			return
		end
		local ray = camera:ViewportPointToRay(screenPos.X, screenPos.Y)
		local hit = workspace:Raycast(ray.Origin, ray.Direction * 500, params)
		if not hit then
			hud.banner("Place it on the grass!")
			return
		end
		local result = placeRemote:InvokeServer(kind, hit.Position)
		local ok, message = result[1], result[2]
		if ok then
			placedEvent:Fire(kind)
		else
			hud.banner(message or "Can't place there")
		end
	end

	-- `processed` is true when the tap hit a UI button, so tower-bar taps don't also place.
	UserInputService.InputEnded:Connect(function(input, processed)
		if processed then
			return
		end
		if input.UserInputType == Enum.UserInputType.Touch or input.UserInputType == Enum.UserInputType.MouseButton1 then
			tryPlace(Vector2.new(input.Position.X, input.Position.Y))
		end
	end)
end

return Placement
