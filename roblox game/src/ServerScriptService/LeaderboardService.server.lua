-- LeaderboardService.lua
-- Manages global leaderboards using OrderedDataStores
-- Three boards: Rebirths, Duel Wins, Top Spender (Robux)

local DataStoreService = game:GetService("DataStoreService")
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local GameConfig = require(ReplicatedStorage:WaitForChild("GameConfig"))
local Remotes = require(ReplicatedStorage:WaitForChild("RemoteEvents"))

local LeaderboardService = {}

-- Cache leaderboard data so we don't hit DataStore too often
local cachedBoards = {
	Rebirths = {},
	DuelWins = {},
	TopSpender = {},
}

local UPDATE_INTERVAL = 60 -- refresh every 60 seconds

-- Get or create an OrderedDataStore
local function getStore(boardName)
	local config = GameConfig.Leaderboards[boardName]
	if not config then return nil end
	local success, store = pcall(function()
		return DataStoreService:GetOrderedDataStore(config.DataStoreName)
	end)
	if success then return store end
	warn("[Leaderboard] Failed to get DataStore for " .. boardName)
	return nil
end

-- Fetch top entries from a board
local function fetchBoard(boardName)
	local store = getStore(boardName)
	if not store then return {} end

	local config = GameConfig.Leaderboards[boardName]
	local entries = {}

	local success, pages = pcall(function()
		return store:GetSortedAsync(false, config.MaxEntries)
	end)

	if not success or not pages then return entries end

	local page = pages:GetCurrentPage()
	for rank, entry in ipairs(page) do
		table.insert(entries, {
			Rank = rank,
			UserId = entry.key,
			Value = entry.value,
			Name = "", -- filled below
		})
	end

	-- Resolve usernames
	for _, entry in ipairs(entries) do
		local nameSuccess, name = pcall(function()
			return Players:GetNameFromUserIdAsync(tonumber(entry.UserId))
		end)
		entry.Name = nameSuccess and name or ("Player_" .. entry.UserId)
	end

	return entries
end

-- Save a player's stat to a board
local function saveToBoard(boardName, player, value)
	local store = getStore(boardName)
	if not store then return end

	pcall(function()
		store:SetAsync(tostring(player.UserId), value)
	end)
end

-- Update all boards for a player (called periodically and on leave)
function LeaderboardService.SavePlayerStats(player)
	local PlayerDataManager = require(script.Parent:WaitForChild("PlayerDataManager"))
	local data = PlayerDataManager.GetData(player)
	if not data then return end

	saveToBoard("Rebirths", player, data.Rebirths)
	saveToBoard("DuelWins", player, data.DuelWins)
	saveToBoard("TopSpender", player, data.TotalRobuxSpent)
end

-- Refresh all cached boards
function LeaderboardService.RefreshAll()
	for boardName, _ in pairs(cachedBoards) do
		local entries = fetchBoard(boardName)
		cachedBoards[boardName] = entries
	end

	-- Broadcast to all clients
	for _, player in ipairs(Players:GetPlayers()) do
		Remotes.LeaderboardUpdated:FireClient(player, cachedBoards)
	end
end

-- Client requests leaderboard data
Remotes.GetLeaderboardData.OnServerInvoke = function(_player)
	return cachedBoards
end

-- Periodic refresh loop
task.spawn(function()
	while true do
		LeaderboardService.RefreshAll()
		task.wait(UPDATE_INTERVAL)
	end
end)

-- Save stats periodically for all players
task.spawn(function()
	while true do
		task.wait(UPDATE_INTERVAL)
		for _, player in ipairs(Players:GetPlayers()) do
			task.spawn(function()
				LeaderboardService.SavePlayerStats(player)
			end)
		end
	end
end)

-- Save on player leave
Players.PlayerRemoving:Connect(function(player)
	task.spawn(function()
		LeaderboardService.SavePlayerStats(player)
	end)
end)

return LeaderboardService
