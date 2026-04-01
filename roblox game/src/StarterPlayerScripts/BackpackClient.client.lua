-- BackpackClient.lua
-- Client script: tracks backpack contents and updates the UI

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Remotes = require(ReplicatedStorage:WaitForChild("RemoteEvents"))

local player = Players.LocalPlayer
local backpackContents = {}

-- Listen for backpack updates from server
Remotes.BackpackUpdated.OnClientEvent:Connect(function(newBackpack)
	backpackContents = newBackpack

	-- Fire a bindable event so the UI can update
	local backpackUI = player.PlayerGui:FindFirstChild("BackpackUI")
	if backpackUI and backpackUI:FindFirstChild("UpdateEvent") then
		backpackUI.UpdateEvent:Fire(backpackContents)
	end
end)

-- Expose backpack contents for other client scripts
local BackpackClient = {}

function BackpackClient.GetContents()
	return backpackContents
end

function BackpackClient.GetCount()
	return #backpackContents
end

return BackpackClient
