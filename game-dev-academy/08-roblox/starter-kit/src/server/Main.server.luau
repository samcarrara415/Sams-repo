--!strict
-- Server entry point: start every service in dependency order.
-- Expected place setup (see starter-kit/README.md):
--   Workspace.Map.Path       parts named "1", "2", "3"... along the enemy route
--   Workspace.Map.Placeable  parts where towers may be placed
--   ReplicatedStorage.Assets.Towers / .Enemies   (optional) your Blender models

local Services = script.Parent.Services
local DataService = require(Services.DataService)
local Remotes = require(Services.Remotes)
local Telemetry = require(Services.Telemetry)
local WaveService = require(Services.WaveService)
local TowerService = require(Services.TowerService)
local MatchService = require(Services.MatchService)
local ShopService = require(Services.ShopService)
local DailyRewardService = require(Services.DailyRewardService)

local map = workspace:WaitForChild("Map")

DataService.start()
DataService.Loaded:Connect(function(player: Player, data: DataService.Data)
	if not data.onboardingDone then
		Telemetry.onboarding(player, Telemetry.Onboarding.Joined)
	end
	-- Tell the client whether to show onboarding hints and the daily reward button.
	Remotes.Notify:FireClient(player, "Profile", {
		newPlayer = not data.onboardingDone,
		canClaimDaily = DailyRewardService.canClaim(player),
		coins = data.coins,
		gems = data.gems,
	})
end)

WaveService.init(map:WaitForChild("Path"))
WaveService.start()
TowerService.init(map, MatchService.canBuild)
TowerService.start()
ShopService.start()
DailyRewardService.start()
MatchService.start()
