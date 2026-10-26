--!strict
-- The match is a state machine: Lobby -> Intermission -> Wave -> ... -> Results -> Lobby.
-- Only legal transitions can happen, so "two rounds at once" and "rewards in the
-- lobby" bugs can't (01-foundations/01-programming-for-games.md, section 5).

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Waves = require(ReplicatedStorage.Shared.Config.Waves)
local Remotes = require(script.Parent.Remotes)
local WaveService = require(script.Parent.WaveService)
local TowerService = require(script.Parent.TowerService)
local DataService = require(script.Parent.DataService)
local Telemetry = require(script.Parent.Telemetry)

type State = "Lobby" | "Intermission" | "Wave" | "Results"

local START_CASH = 250
local START_LIVES = 20
local FIRST_INTERMISSION = 8 -- short: new players should reach the action fast
local BETWEEN_WAVES = 5
local RESULTS_SECONDS = 8
local COINS_PER_WAVE = 5 -- account currency, kept on win or loss
local WIN_BONUS_COINS = 50

local transitions: { [State]: { State } } = {
	Lobby = { "Intermission" },
	Intermission = { "Wave", "Results" },
	Wave = { "Intermission", "Results" },
	Results = { "Lobby" },
}

local MatchService = {}

local state: State = "Lobby"
local lives = START_LIVES
local wave = 0
local sessions: { [Player]: string } = {} -- funnel session id per player per match

local function setState(new: State, info: { [string]: any }?)
	if not table.find(transitions[state], new) then
		warn(`[Match] blocked {state} -> {new}`)
		return
	end
	state = new
	Remotes.MatchState:FireAllClients(new, info or {})
end

function MatchService.canBuild(): boolean
	return state == "Intermission" or state == "Wave"
end

local function isOver(): boolean
	return lives <= 0 or #Players:GetPlayers() == 0
end

local function joinMatch(player: Player)
	player:SetAttribute("Cash", START_CASH)
	sessions[player] = Telemetry.newFunnelSession()
	Telemetry.matchStep(player, sessions[player], 1, "Started")
end

local function payCoins(player: Player, amount: number, why: Enum.AnalyticsEconomyTransactionType)
	local data = DataService.get(player)
	if data then
		data.coins += amount
		Telemetry.economy(player, true, "Coins", amount, data.coins, why)
	end
end

local function finish(won: boolean)
	for _, player in Players:GetPlayers() do
		local data = DataService.get(player)
		if not data then
			continue
		end
		data.stats.matches += 1
		data.stats.bestWave = math.max(data.stats.bestWave, wave)
		local session = sessions[player]
		if won then
			data.stats.wins += 1
			payCoins(player, WIN_BONUS_COINS, Enum.AnalyticsEconomyTransactionType.Gameplay)
			if session then
				Telemetry.matchStep(player, session, 3, "Won")
			end
			if not data.onboardingDone then
				Telemetry.onboarding(player, Telemetry.Onboarding.FirstWin)
				data.onboardingDone = true
			end
		else
			-- Record where players lose: if losses pile up on one non-boss wave, it's an accidental wall.
			Telemetry.event(player, "MatchLost", wave, { wave = wave, towersCash = player:GetAttribute("Cash") })
		end
	end
	setState("Results", { won = won, wave = wave })
end

local function onWaveCleared(index: number)
	local bonus = Waves[index].bonus
	for _, player in Players:GetPlayers() do
		TowerService.addCash(player, bonus)
		payCoins(player, COINS_PER_WAVE, Enum.AnalyticsEconomyTransactionType.Gameplay)
		local data = DataService.get(player)
		if data and not data.onboardingDone then
			if index == 1 then
				Telemetry.onboarding(player, Telemetry.Onboarding.ClearedWave1)
			elseif index == 5 then
				Telemetry.onboarding(player, Telemetry.Onboarding.ClearedWave5)
			end
		end
		if index == 5 and sessions[player] then
			Telemetry.matchStep(player, sessions[player], 2, "ReachedWave5")
		end
	end
end

local function runMatch()
	lives = START_LIVES
	wave = 0
	for _, player in Players:GetPlayers() do
		joinMatch(player)
	end

	setState("Intermission", { seconds = FIRST_INTERMISSION, nextWave = 1, lives = lives })
	task.wait(FIRST_INTERMISSION)

	for index = 1, #Waves do
		if isOver() then
			break
		end
		wave = index
		setState("Wave", { wave = index, total = #Waves, warning = Waves[index].warning, lives = lives })
		-- Gentle scaling for bigger servers so co-op stays challenging.
		local healthMult = 1 + 0.25 * math.max(0, #Players:GetPlayers() - 1)
		WaveService.run(index, healthMult, isOver)
		if isOver() then
			break
		end
		onWaveCleared(index)
		if index < #Waves then
			setState("Intermission", { seconds = BETWEEN_WAVES, nextWave = index + 1, lives = lives })
			task.wait(BETWEEN_WAVES)
		end
	end

	WaveService.clear()
	finish(lives > 0 and #Players:GetPlayers() > 0)
	task.wait(RESULTS_SECONDS)
	TowerService.clear()
	table.clear(sessions)
	setState("Lobby")
end

function MatchService.start()
	WaveService.Leaked:Connect(function()
		lives -= 1
		Remotes.Notify:FireAllClients("Lives", lives)
	end)

	-- Late joiners jump straight into the running match (friend-joiners hate waiting).
	Players.PlayerAdded:Connect(function(player)
		if state ~= "Lobby" then
			joinMatch(player)
			Remotes.MatchState:FireClient(player, state, { wave = wave, lives = lives })
		end
	end)

	task.spawn(function()
		while true do
			while #Players:GetPlayers() == 0 do
				task.wait(1)
			end
			runMatch()
		end
	end)
end

return MatchService
