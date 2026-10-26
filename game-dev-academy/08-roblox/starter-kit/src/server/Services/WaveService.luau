--!strict
-- Enemies are plain data on the server: { distance along the path, hp }.
-- No physics parts, no Humanoids. The server sends small snapshots; each client
-- draws and smooths the models itself. This is what lets a TD game run hundreds
-- of enemies on cheap phones (see 08-roblox/15-performance-and-mobile.md).

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")

local Enemies = require(ReplicatedStorage.Shared.Config.Enemies)
local Waves = require(ReplicatedStorage.Shared.Config.Waves)
local Path = require(ReplicatedStorage.Shared.Path)
local Remotes = require(script.Parent.Remotes)

export type Enemy = {
	id: number,
	kind: string,
	hp: number,
	maxHp: number,
	distance: number,
	speed: number,
	flying: boolean,
}

local SNAPSHOT_HZ = 10

local WaveService = {}

local path: Path.Path
local enemies: { [number]: Enemy } = {}
local nextId = 0
local alive = 0
local leakedEvent = Instance.new("BindableEvent")
local killedEvent = Instance.new("BindableEvent")

WaveService.Leaked = leakedEvent.Event -- (enemy)
WaveService.Killed = killedEvent.Event -- (enemy, killer: Player?)

function WaveService.init(pathFolder: Instance)
	path = Path.fromFolder(pathFolder)
end

function WaveService.path(): Path.Path
	return path
end

function WaveService.all(): { [number]: Enemy }
	return enemies
end

function WaveService.aliveCount(): number
	return alive
end

function WaveService.positionOf(enemy: Enemy): Vector3
	return Path.positionAt(path, enemy.distance)
end

local function remove(enemy: Enemy, killed: boolean)
	if enemies[enemy.id] == nil then
		return
	end
	enemies[enemy.id] = nil
	alive -= 1
	Remotes.EnemyRemoved:FireAllClients(enemy.id, killed)
end

function WaveService.spawn(kind: string, healthMult: number)
	local cfg = Enemies[kind]
	assert(cfg, `unknown enemy {kind}`)
	nextId += 1
	local hp = math.ceil(cfg.health * healthMult)
	local enemy: Enemy = {
		id = nextId,
		kind = kind,
		hp = hp,
		maxHp = hp,
		distance = 0,
		speed = cfg.speed,
		flying = cfg.flying,
	}
	enemies[enemy.id] = enemy
	alive += 1
	Remotes.EnemySpawned:FireAllClients(enemy.id, kind, hp)
end

-- Returns true if this hit killed the enemy.
function WaveService.damage(id: number, amount: number, killer: Player?): boolean
	local enemy = enemies[id]
	if not enemy then
		return false
	end
	enemy.hp -= amount
	if enemy.hp <= 0 then
		remove(enemy, true)
		killedEvent:Fire(enemy, killer)
		return true
	end
	return false
end

-- Spawns every group of the wave, then yields until all enemies are dead or leaked,
-- or `isOver()` says the match ended (e.g. no lives left).
function WaveService.run(waveIndex: number, healthMult: number, isOver: () -> boolean)
	local wave = Waves[waveIndex]
	assert(wave, `no wave {waveIndex}`)
	for _, group in wave.groups do
		for _ = 1, group.count do
			if isOver() then
				return
			end
			WaveService.spawn(group.enemy, healthMult)
			task.wait(group.gap)
		end
	end
	while alive > 0 and not isOver() do
		task.wait(0.2)
	end
end

function WaveService.clear()
	for _, enemy in enemies do
		remove(enemy, false)
	end
end

function WaveService.start()
	RunService.Heartbeat:Connect(function(dt)
		for _, enemy in enemies do
			enemy.distance += enemy.speed * dt
			if enemy.distance >= path.length then
				remove(enemy, false)
				leakedEvent:Fire(enemy)
			end
		end
	end)

	-- Compact snapshot: parallel arrays keep the packet small.
	task.spawn(function()
		while true do
			task.wait(1 / SNAPSHOT_HZ)
			if alive > 0 then
				local ids, distances, hps = {}, {}, {}
				for id, enemy in enemies do
					table.insert(ids, id)
					table.insert(distances, math.floor(enemy.distance * 10) / 10)
					table.insert(hps, enemy.hp)
				end
				Remotes.EnemySnapshot:FireAllClients(ids, distances, hps)
			end
		end
	end)
end

return WaveService
