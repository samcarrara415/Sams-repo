--!strict
-- Tower placement, upgrades and targeting. The client only *asks* to place a tower;
-- this file checks everything (unit owned, cash, valid spot, spacing, limits).

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")
local Players = game:GetService("Players")

local Towers = require(ReplicatedStorage.Shared.Config.Towers)
local Enemies = require(ReplicatedStorage.Shared.Config.Enemies)
local Remotes = require(script.Parent.Remotes)
local WaveService = require(script.Parent.WaveService)
local DataService = require(script.Parent.DataService)
local Telemetry = require(script.Parent.Telemetry)

local MIN_SPACING = 4 -- studs between towers
local MAX_TOWERS_PER_PLAYER = 12

type Tower = {
	id: number,
	owner: Player,
	kind: string,
	level: number, -- 0 = base, 1.. = upgrades bought
	position: Vector3,
	lastShot: number,
	model: Model,
}

local TowerService = {}

local towers: { [number]: Tower } = {}
local nextId = 0
local placeableFolder: Instance
local towersFolder: Folder
local canBuild: () -> boolean = function()
	return false
end

-- In-match cash lives in a Player attribute so the HUD updates automatically.
function TowerService.getCash(player: Player): number
	return player:GetAttribute("Cash") or 0
end

function TowerService.addCash(player: Player, amount: number)
	player:SetAttribute("Cash", TowerService.getCash(player) + amount)
end

local function stats(tower: Tower)
	local cfg = Towers[tower.kind]
	local damage, range = cfg.damage, cfg.range
	if tower.level > 0 then
		local up = cfg.upgrades[tower.level]
		damage *= up.damageMult
		range *= up.rangeMult
	end
	return damage, range, cfg
end

local function buildModel(kind: string, position: Vector3): Model
	local assets = ReplicatedStorage:FindFirstChild("Assets")
	local template = assets and assets:FindFirstChild("Towers") and assets.Towers:FindFirstChild(kind)
	local model: Model
	if template and template:IsA("Model") then
		model = template:Clone()
	else
		-- Placeholder so the kit runs before you import real Blender models.
		model = Instance.new("Model")
		local part = Instance.new("Part")
		part.Size = Vector3.new(2, 4, 2)
		part.Anchored = true
		part.CanCollide = false
		part.BrickColor = if kind == "Cannon" then BrickColor.new("Dark stone grey") else BrickColor.new("Bright green")
		part.Parent = model
		model.PrimaryPart = part
	end
	model.Name = kind
	model:PivotTo(CFrame.new(position + Vector3.new(0, model:GetExtentsSize().Y / 2, 0)))
	return model
end

local function countFor(player: Player): number
	local n = 0
	for _, t in towers do
		if t.owner == player then
			n += 1
		end
	end
	return n
end

-- Find the surface under the requested point; only parts inside Map.Placeable count.
local function groundAt(requested: Vector3): Vector3?
	local params = RaycastParams.new()
	params.FilterType = Enum.RaycastFilterType.Include
	params.FilterDescendantsInstances = { placeableFolder }
	local hit = workspace:Raycast(requested + Vector3.new(0, 10, 0), Vector3.new(0, -30, 0), params)
	return hit and hit.Position
end

local function place(player: Player, kind: any, requested: any): (boolean, string?)
	if not canBuild() then
		return false, "Wait for the match to start!"
	end
	if not Remotes.is.shortString(kind) or not Towers[kind] then
		return false, "Unknown tower"
	end
	if not Remotes.is.vector3(requested) then
		return false, "Bad position"
	end
	local data = DataService.get(player)
	if not data or not data.units[kind] then
		return false, "You don't own that unit yet"
	end
	local cfg = Towers[kind]
	if TowerService.getCash(player) < cfg.cost then
		return false, "Not enough cash"
	end
	if countFor(player) >= MAX_TOWERS_PER_PLAYER then
		return false, "Tower limit reached"
	end
	local ground = groundAt(requested)
	if not ground then
		return false, "Can't place there"
	end
	for _, t in towers do
		if (t.position - ground).Magnitude < MIN_SPACING then
			return false, "Too close to another tower"
		end
	end

	TowerService.addCash(player, -cfg.cost)
	nextId += 1
	local model = buildModel(kind, ground)
	model:SetAttribute("TowerId", nextId)
	model:SetAttribute("Owner", player.UserId)
	model.Parent = towersFolder
	towers[nextId] = {
		id = nextId,
		owner = player,
		kind = kind,
		level = 0,
		position = ground,
		lastShot = 0,
		model = model,
	}
	return true, nil
end

local function upgrade(player: Player, id: any): (boolean, string?)
	if type(id) ~= "number" then
		return false, "Bad tower"
	end
	local tower = towers[id]
	if not tower or tower.owner ~= player then
		return false, "Not your tower"
	end
	local cfg = Towers[tower.kind]
	local nextUp = cfg.upgrades[tower.level + 1]
	if not nextUp then
		return false, "Max level"
	end
	if TowerService.getCash(player) < nextUp.cost then
		return false, "Not enough cash"
	end
	TowerService.addCash(player, -nextUp.cost)
	tower.level += 1
	tower.model:SetAttribute("Level", tower.level)
	return true, nil
end

-- "First" targeting: the enemy furthest along the path that is in range.
local function pickTarget(tower: Tower, range: number, hitsAir: boolean): WaveService.Enemy?
	local best: WaveService.Enemy? = nil
	local rangeSq = range * range
	for _, enemy in WaveService.all() do
		if enemy.flying and not hitsAir then
			continue
		end
		local d = WaveService.positionOf(enemy) - tower.position
		if d:Dot(d) <= rangeSq and (best == nil or enemy.distance > best.distance) then
			best = enemy
		end
	end
	return best
end

local function fire(tower: Tower, now: number)
	local damage, range, cfg = stats(tower)
	local target = pickTarget(tower, range, cfg.hitsAir)
	if not target then
		return
	end
	tower.lastShot = now
	Remotes.TowerFired:FireAllClients(tower.id, target.id)
	if cfg.splash then
		local center = WaveService.positionOf(target)
		local splashSq = cfg.splash * cfg.splash
		local hits = {}
		for _, enemy in WaveService.all() do
			local d = WaveService.positionOf(enemy) - center
			if d:Dot(d) <= splashSq and (cfg.hitsAir or not enemy.flying) then
				table.insert(hits, enemy.id)
			end
		end
		for _, id in hits do
			WaveService.damage(id, damage, tower.owner)
		end
	else
		WaveService.damage(target.id, damage, tower.owner)
	end
end

function TowerService.clear()
	for id, tower in towers do
		tower.model:Destroy()
		towers[id] = nil
	end
end

function TowerService.init(map: Instance, buildAllowed: () -> boolean)
	placeableFolder = map:WaitForChild("Placeable")
	canBuild = buildAllowed
	towersFolder = Instance.new("Folder")
	towersFolder.Name = "Towers"
	towersFolder.Parent = workspace
end

function TowerService.start()
	Remotes.onInvoke(Remotes.PlaceTower, 4, 6, { false, "Slow down!" }, function(player, kind, position)
		local ok, message = place(player, kind, position)
		if ok then
			local data = DataService.get(player)
			if data and not data.onboardingDone then
				Telemetry.onboarding(player, Telemetry.Onboarding.PlacedFirstTower)
			end
		end
		return { ok, message }
	end)

	Remotes.onInvoke(Remotes.UpgradeTower, 4, 6, { false, "Slow down!" }, function(player, id)
		local ok, message = upgrade(player, id)
		if ok then
			local data = DataService.get(player)
			if data and not data.onboardingDone then
				Telemetry.onboarding(player, Telemetry.Onboarding.FirstUpgrade)
			end
		end
		return { ok, message }
	end)

	WaveService.Killed:Connect(function(enemy, killer: Player?)
		if killer and killer.Parent then
			TowerService.addCash(killer, Enemies[enemy.kind].reward)
		end
	end)

	Players.PlayerRemoving:Connect(function(player)
		for id, tower in towers do
			if tower.owner == player then
				tower.model:Destroy()
				towers[id] = nil
			end
		end
	end)

	RunService.Heartbeat:Connect(function()
		local now = os.clock()
		for _, tower in towers do
			if now - tower.lastShot >= Towers[tower.kind].cooldown then
				fire(tower, now)
			end
		end
	end)
end

return TowerService
