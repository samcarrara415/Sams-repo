--!strict
-- Thin wrapper over Roblox AnalyticsService so every event name lives in one file.
-- Results show up in Creator Hub > Analytics (Funnels, Custom Events, Economy).
-- Check the current AnalyticsService docs for limits on event names and custom fields.

local AnalyticsService = game:GetService("AnalyticsService")
local HttpService = game:GetService("HttpService")

local Telemetry = {}

-- Onboarding funnel: one row per step, in order. Keep names stable or the chart splits.
Telemetry.Onboarding = {
	Joined = 1,
	PlacedFirstTower = 2,
	ClearedWave1 = 3,
	FirstUpgrade = 4,
	ClearedWave5 = 5,
	FirstWin = 6,
}
local onboardingNames: { [number]: string } = {}
for name, step in Telemetry.Onboarding do
	onboardingNames[step] = name
end

local function safe(fn: () -> ())
	local ok, err = pcall(fn)
	if not ok then
		warn(`[Telemetry] {err}`)
	end
end

function Telemetry.onboarding(player: Player, step: number)
	safe(function()
		AnalyticsService:LogOnboardingFunnelStepEvent(player, step, onboardingNames[step])
	end)
end

-- Recurring funnel (e.g. each match). Use one funnelSessionId per attempt.
function Telemetry.newFunnelSession(): string
	return HttpService:GenerateGUID(false)
end

function Telemetry.matchStep(player: Player, sessionId: string, step: number, stepName: string)
	safe(function()
		AnalyticsService:LogFunnelStepEvent(player, "Match", sessionId, step, stepName)
	end)
end

-- Custom events: "MatchLost", "MatchQuit", "Summon"... Add context in customFields.
-- Keep field values low-cardinality (wave number, difficulty, device type), never usernames.
function Telemetry.event(player: Player, name: string, value: number?, fields: { [string]: any }?)
	safe(function()
		AnalyticsService:LogCustomEvent(player, name, value or 1, fields)
	end)
end

-- Economy: every source (+) and sink (-) of a currency, with the balance after.
function Telemetry.economy(
	player: Player,
	isSource: boolean,
	currency: string,
	amount: number,
	balanceAfter: number,
	transactionType: Enum.AnalyticsEconomyTransactionType,
	sku: string?
)
	safe(function()
		AnalyticsService:LogEconomyEvent(
			player,
			if isSource then Enum.AnalyticsEconomyFlowType.Source else Enum.AnalyticsEconomyFlowType.Sink,
			currency,
			amount,
			balanceAfter,
			transactionType.Name,
			sku
		)
	end)
end

return Telemetry
