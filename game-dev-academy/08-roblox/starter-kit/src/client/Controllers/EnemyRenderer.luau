--!strict
-- Draws enemies from the server's snapshots. The server only sends { id, distance, hp }
-- about 10 times a second; we move each model smoothly toward its latest distance.
-- Models are client-only, so the server pays nothing for them.

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")

local Path = require(ReplicatedStorage.Shared.Path)
local Enemies = require(ReplicatedStorage.Shared.Config.Enemies)

type Drawn = {
	model: Model,
	shown: number, -- distance currently drawn
	target: number, -- latest distance from the server
	speed: number,
	maxHp: number,
	bar: Frame,
	flyHeight: number,
}

local EnemyRenderer = {}

local drawn: { [number]: Drawn } = {}
local path: Path.Path
local folder = Instance.new("Folder")
folder.Name = "ClientEnemies"
folder.Parent = workspace

local function makeModel(kind: string): Model
	local assets = ReplicatedStorage:FindFirstChild("Assets")
	local template = assets and assets:FindFirstChild("Enemies") and assets.Enemies:FindFirstChild(kind)
	if template and template:IsA("Model") then
		return template:Clone()
	end
	local model = Instance.new("Model")
	local body = Instance.new("Part")
	body.Shape = Enum.PartType.Ball
	body.Size = if Enemies[kind].boss then Vector3.new(5, 5, 5) else Vector3.new(2, 2, 2)
	body.Color = if Enemies[kind].flying then Color3.fromRGB(150, 90, 220) else Color3.fromRGB(230, 80, 80)
	body.Anchored = true
	body.CanCollide = false
	body.CanQuery = false
	body.Parent = model
	model.PrimaryPart = body
	return model
end

local function healthBar(model: Model): Frame
	local gui = Instance.new("BillboardGui")
	gui.Size = UDim2.fromOffset(40, 6)
	gui.StudsOffset = Vector3.new(0, 2.5, 0)
	gui.AlwaysOnTop = true
	gui.Parent = model.PrimaryPart
	local back = Instance.new("Frame")
	back.Size = UDim2.fromScale(1, 1)
	back.BackgroundColor3 = Color3.fromRGB(40, 40, 40)
	back.BorderSizePixel = 0
	back.Parent = gui
	local fill = Instance.new("Frame")
	fill.Size = UDim2.fromScale(1, 1)
	fill.BackgroundColor3 = Color3.fromRGB(90, 220, 90)
	fill.BorderSizePixel = 0
	fill.Parent = back
	return fill
end

function EnemyRenderer.start(remotes: Folder)
	path = Path.fromFolder(workspace:WaitForChild("Map"):WaitForChild("Path"))
	local spawned = remotes:WaitForChild("EnemySpawned") :: RemoteEvent
	local removed = remotes:WaitForChild("EnemyRemoved") :: RemoteEvent
	local snapshot = remotes:WaitForChild("EnemySnapshot") :: UnreliableRemoteEvent

	spawned.OnClientEvent:Connect(function(id: number, kind: string, maxHp: number)
		local model = makeModel(kind)
		model.Parent = folder
		drawn[id] = {
			model = model,
			shown = 0,
			target = 0,
			speed = Enemies[kind].speed,
			maxHp = maxHp,
			bar = healthBar(model),
			flyHeight = if Enemies[kind].flying then 6 else 1,
		}
	end)

	removed.OnClientEvent:Connect(function(id: number, killed: boolean)
		local d = drawn[id]
		if not d then
			return
		end
		drawn[id] = nil
		-- Juice hook: play a pop + particles here when `killed` is true (05-audio-and-game-feel).
		d.model:Destroy()
	end)

	snapshot.OnClientEvent:Connect(
		function(ids: { number }, distances: { number }, hps: { number })
			for i, id in ids do
				local d = drawn[id]
				if d then
					d.target = distances[i]
					d.bar.Size = UDim2.fromScale(math.clamp(hps[i] / d.maxHp, 0, 1), 1)
				end
			end
		end
	)

	RunService.RenderStepped:Connect(function(dt)
		for _, d in drawn do
			-- Keep walking at the enemy's speed, and catch up gently if the snapshot is ahead.
			d.shown += d.speed * dt
			d.shown += (d.target - d.shown) * math.min(1, 8 * dt)
			local pos = Path.positionAt(path, d.shown) + Vector3.new(0, d.flyHeight, 0)
			local ahead = Path.positionAt(path, d.shown + 0.5) + Vector3.new(0, d.flyHeight, 0)
			if (ahead - pos).Magnitude > 0.01 then
				d.model:PivotTo(CFrame.lookAt(pos, ahead))
			else
				d.model:PivotTo(CFrame.new(pos))
			end
		end
	end)
end

return EnemyRenderer
