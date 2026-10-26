--!strict
-- Player data with a session lock, autosave, retries and a safe shutdown.
--
-- Why a session lock: when a player hops servers, the old server may still be
-- saving while the new one loads. Without a lock the new server can load stale
-- data and later overwrite the newer save (lost items, duplicated trades).
-- Each save records { jobId, time }; another server refuses to take the data
-- until that lock is released or older than LOCK_EXPIRY.
--
-- For big games consider the community library ProfileStore, which does the
-- same job with more features. This file shows the idea in ~200 lines.

local DataStoreService = game:GetService("DataStoreService")
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")

local STORE_NAME = "PlayerData_v1"
local AUTOSAVE_SECONDS = 120
local LOCK_EXPIRY = 300 -- must be well above AUTOSAVE_SECONDS
local LOAD_RETRIES = 6
local RETRY_WAIT = 5

export type Data = {
	version: number,
	coins: number,
	gems: number,
	units: { [string]: boolean },
	daysPlayed: number,
	lastClaimDay: number, -- days since epoch (UTC) of last daily reward
	purchases: { string }, -- recent PurchaseIds, so receipts are never granted twice
	stats: { matches: number, wins: number, bestWave: number },
	onboardingDone: boolean,
}

local function defaultData(): Data
	return {
		version = 1,
		coins = 0,
		gems = 0,
		units = { Archer = true },
		daysPlayed = 0,
		lastClaimDay = 0,
		purchases = {},
		stats = { matches = 0, wins = 0, bestWave = 0 },
		onboardingDone = false,
	}
end

-- Fill in fields added in later updates without wiping existing values.
local function reconcile(target: { [any]: any }, template: { [any]: any })
	for key, value in template do
		if target[key] == nil then
			target[key] = if type(value) == "table" then table.clone(value) else value
		elseif type(value) == "table" and type(target[key]) == "table" and next(value) ~= nil and #value == 0 then
			reconcile(target[key], value)
		end
	end
end

local store = DataStoreService:GetDataStore(STORE_NAME)
local profiles: { [Player]: Data } = {}
local loadedEvent = Instance.new("BindableEvent")

local DataService = {
	Loaded = loadedEvent.Event, -- fires (player, data)
}

local function key(player: Player): string
	return "u_" .. player.UserId
end

-- Returns data, or nil + reason ("locked" | "error").
local function tryLoad(player: Player): (Data?, string?)
	local lockedByOther = false
	local ok, result = pcall(function()
		return store:UpdateAsync(key(player), function(saved: any)
			lockedByOther = false -- the transform can run more than once; judge the latest call
			saved = saved or {}
			saved.data = saved.data or defaultData()
			local lock = saved.lock
			if lock and lock.jobId ~= game.JobId and os.time() - lock.time < LOCK_EXPIRY then
				lockedByOther = true
				return nil -- cancel the write; another server still owns this player
			end
			saved.lock = { jobId = game.JobId, time = os.time() }
			return saved
		end)
	end)
	if not ok then
		warn(`[DataService] load error for {player.UserId}: {result}`)
		return nil, "error"
	end
	if lockedByOther or result == nil then
		return nil, "locked"
	end
	local data = result.data
	reconcile(data, defaultData() :: any)
	return data, nil
end

local function save(player: Player, release: boolean): boolean
	local data = profiles[player]
	if not data then
		return false
	end
	local ok, err = pcall(function()
		store:UpdateAsync(key(player), function(saved: any)
			saved = saved or {}
			local lock = saved.lock
			if lock and lock.jobId ~= game.JobId then
				return nil -- someone else owns it now; never overwrite their newer data
			end
			saved.data = data
			saved.lock = if release then nil else { jobId = game.JobId, time = os.time() }
			return saved
		end)
	end)
	if not ok then
		warn(`[DataService] save error for {player.UserId}: {err}`)
	end
	return ok
end

local function onPlayerAdded(player: Player)
	for attempt = 1, LOAD_RETRIES do
		local data, reason = tryLoad(player)
		if not player.Parent then
			if data then
				-- Player left while we were loading: release the lock we just took.
				profiles[player] = data
				save(player, true)
				profiles[player] = nil
			end
			return
		end
		if data then
			profiles[player] = data
			loadedEvent:Fire(player, data)
			return
		end
		if attempt < LOAD_RETRIES then
			task.wait(if reason == "locked" then RETRY_WAIT else RETRY_WAIT * attempt)
		end
	end
	player:Kick("Your save is still syncing from another server. Please rejoin in a minute!")
end

local function onPlayerRemoving(player: Player)
	if profiles[player] then
		save(player, true)
		profiles[player] = nil
	end
end

function DataService.get(player: Player): Data?
	return profiles[player]
end

-- Yields until the player's data is loaded (or they leave / timeout).
function DataService.waitFor(player: Player, timeout: number?): Data?
	local deadline = os.clock() + (timeout or 60)
	while not profiles[player] and player.Parent and os.clock() < deadline do
		task.wait(0.25)
	end
	return profiles[player]
end

-- Save now (e.g. right after a Robux purchase). Returns true on success.
function DataService.saveNow(player: Player): boolean
	return save(player, false)
end

function DataService.start()
	Players.PlayerAdded:Connect(onPlayerAdded)
	Players.PlayerRemoving:Connect(onPlayerRemoving)
	for _, player in Players:GetPlayers() do
		task.spawn(onPlayerAdded, player)
	end

	task.spawn(function()
		while true do
			task.wait(AUTOSAVE_SECONDS)
			for player in profiles do
				task.spawn(save, player, false)
			end
		end
	end)

	game:BindToClose(function()
		if RunService:IsStudio() then
			task.wait(1)
		end
		local pending = 0
		for player in profiles do
			pending += 1
			task.spawn(function()
				save(player, true)
				pending -= 1
			end)
		end
		local deadline = os.clock() + 25
		while pending > 0 and os.clock() < deadline do
			task.wait(0.1)
		end
	end)
end

return DataService
