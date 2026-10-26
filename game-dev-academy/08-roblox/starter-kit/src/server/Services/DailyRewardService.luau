--!strict
-- Kid-friendly daily reward: counts DAYS PLAYED, not a streak that resets to zero
-- when you miss a day. Missing a day never takes anything away (07-engagement-and-retention/03).
-- One claim per UTC day, decided by the server clock, never the client.

local Remotes = require(script.Parent.Remotes)
local DataService = require(script.Parent.DataService)
local Telemetry = require(script.Parent.Telemetry)

-- Reward for day N of the 7-day cycle; day 7 is the big one.
local CYCLE: { { coins: number?, gems: number? } } = {
	{ coins = 50 },
	{ coins = 75 },
	{ coins = 100 },
	{ gems = 10 },
	{ coins = 150 },
	{ coins = 200 },
	{ gems = 40 },
}

local DailyRewardService = {}

local function today(): number
	return math.floor(os.time() / 86400) -- days since epoch, UTC
end

function DailyRewardService.canClaim(player: Player): boolean
	local data = DataService.get(player)
	return data ~= nil and data.lastClaimDay < today()
end

local function claim(player: Player)
	local data = DataService.get(player)
	if not data then
		return { ok = false }
	end
	if data.lastClaimDay >= today() then
		return { ok = false, nextIn = (today() + 1) * 86400 - os.time() }
	end
	data.lastClaimDay = today()
	data.daysPlayed += 1
	local reward = CYCLE[(data.daysPlayed - 1) % #CYCLE + 1]
	if reward.coins then
		data.coins += reward.coins
		Telemetry.economy(player, true, "Coins", reward.coins, data.coins, Enum.AnalyticsEconomyTransactionType.TimedReward, "DailyReward")
	end
	if reward.gems then
		data.gems += reward.gems
		Telemetry.economy(player, true, "Gems", reward.gems, data.gems, Enum.AnalyticsEconomyTransactionType.TimedReward, "DailyReward")
	end
	Telemetry.event(player, "DailyClaim", data.daysPlayed)
	return { ok = true, day = data.daysPlayed, reward = reward }
end

function DailyRewardService.start()
	Remotes.onInvoke(Remotes.ClaimDaily, 1, 3, { ok = false }, claim)
end

return DailyRewardService
