--!strict
-- Creates every remote in one place and wraps handlers with a rate limit and
-- argument checks. Exploiters can fire any remote with any arguments, as often
-- as they like, so every handler must assume hostile input.

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")

local folder = Instance.new("Folder")
folder.Name = "Remotes"
folder.Parent = ReplicatedStorage

local Remotes = {}

local function make(className: string, name: string): Instance
	local remote = Instance.new(className)
	remote.Name = name
	remote.Parent = folder
	return remote
end

-- Server -> client
Remotes.MatchState = make("RemoteEvent", "MatchState") :: RemoteEvent
Remotes.Notify = make("RemoteEvent", "Notify") :: RemoteEvent
Remotes.EnemySpawned = make("RemoteEvent", "EnemySpawned") :: RemoteEvent
Remotes.EnemyRemoved = make("RemoteEvent", "EnemyRemoved") :: RemoteEvent
-- Position updates are sent often and the next one replaces the last, so losing one is fine.
Remotes.EnemySnapshot = make("UnreliableRemoteEvent", "EnemySnapshot") :: UnreliableRemoteEvent
Remotes.TowerFired = make("UnreliableRemoteEvent", "TowerFired") :: UnreliableRemoteEvent

-- Client -> server (requests only; the server decides)
Remotes.PlaceTower = make("RemoteFunction", "PlaceTower") :: RemoteFunction
Remotes.UpgradeTower = make("RemoteFunction", "UpgradeTower") :: RemoteFunction
Remotes.ClaimDaily = make("RemoteFunction", "ClaimDaily") :: RemoteFunction

-- Token bucket per player per remote: `burst` calls at once, refilling at `perSecond`.
local buckets: { [Player]: { [string]: { tokens: number, last: number } } } = {}
Players.PlayerRemoving:Connect(function(player)
	buckets[player] = nil
end)

local function allow(player: Player, name: string, perSecond: number, burst: number): boolean
	local playerBuckets = buckets[player]
	if not playerBuckets then
		playerBuckets = {}
		buckets[player] = playerBuckets
	end
	local now = os.clock()
	local b = playerBuckets[name]
	if not b then
		b = { tokens = burst, last = now }
		playerBuckets[name] = b
	end
	b.tokens = math.min(burst, b.tokens + (now - b.last) * perSecond)
	b.last = now
	if b.tokens < 1 then
		return false
	end
	b.tokens -= 1
	return true
end

-- Validators: return true only for well-formed values.
Remotes.is = {
	finiteNumber = function(v: any): boolean
		return type(v) == "number" and v == v and v ~= math.huge and v ~= -math.huge
	end,
	shortString = function(v: any, max: number?): boolean
		return type(v) == "string" and #v > 0 and #v <= (max or 50)
	end,
	vector3 = function(v: any): boolean
		return typeof(v) == "Vector3" and v == v and v.Magnitude < 1e5
	end,
}

-- Wrap a RemoteFunction handler. Rejected calls return `fallback` without running the handler.
function Remotes.onInvoke(remote: RemoteFunction, perSecond: number, burst: number, fallback: any, handler: (Player, ...any) -> any)
	remote.OnServerInvoke = function(player: Player, ...)
		if not allow(player, remote.Name, perSecond, burst) then
			return fallback
		end
		local ok, result = pcall(handler, player, ...)
		if not ok then
			warn(`[Remotes] {remote.Name} from {player.UserId} errored: {result}`)
			return fallback
		end
		return result
	end
end

function Remotes.onEvent(remote: RemoteEvent, perSecond: number, burst: number, handler: (Player, ...any) -> ())
	remote.OnServerEvent:Connect(function(player: Player, ...)
		if allow(player, remote.Name, perSecond, burst) then
			handler(player, ...)
		end
	end)
end

return Remotes
