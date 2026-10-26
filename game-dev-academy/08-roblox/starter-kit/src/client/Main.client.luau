--!strict
-- Client entry point: HUD, enemy drawing, placement, onboarding hints and match messages.

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Controllers = script.Parent.Controllers
local Hud = require(Controllers.Hud)
local EnemyRenderer = require(Controllers.EnemyRenderer)
local Placement = require(Controllers.Placement)
local Onboarding = require(Controllers.Onboarding)

local remotes = ReplicatedStorage:WaitForChild("Remotes") :: Folder

Hud.start()
EnemyRenderer.start(remotes)
Placement.start(remotes, Hud)

local matchState = remotes:WaitForChild("MatchState") :: RemoteEvent
matchState.OnClientEvent:Connect(function(state: string, info: { [string]: any })
	if state == "Wave" then
		Hud.setWave(`Wave {info.wave}/{info.total or "?"}`)
		if info.warning then
			Hud.banner("⚠ " .. info.warning, 3)
		end
	elseif state == "Intermission" then
		Hud.setWave(`Next wave in {info.seconds}s`)
	elseif state == "Results" then
		Hud.banner(if info.won then "VICTORY! 🏆" else `Defeated on wave {info.wave}`, 6)
		Placement.select(nil)
	elseif state == "Lobby" then
		Hud.setWave("Get ready!")
	end
end)

local notify = remotes:WaitForChild("Notify") :: RemoteEvent
notify.OnClientEvent:Connect(function(kind: string, payload: any)
	if kind == "Lives" then
		Hud.banner(`❤ {payload} lives left`, 1.5)
	elseif kind == "Profile" then
		Onboarding.start(Hud, Placement, payload.newPlayer)
		-- Daily reward: a glowing button the player taps when ready, never a blocking popup.
		-- Wire it to remotes.ClaimDaily:InvokeServer() in your own UI.
	end
end)
