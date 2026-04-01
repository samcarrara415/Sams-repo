-- BattleArenaClient.lua
-- Client script: handles battle UI, attack inputs, and battle state

local Players = game:GetService("Players")
local UserInputService = game:GetService("UserInputService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local GameConfig = require(ReplicatedStorage:WaitForChild("GameConfig"))
local Remotes = require(ReplicatedStorage:WaitForChild("RemoteEvents"))

local player = Players.LocalPlayer
local inBattle = false
local attackCooldowns = {} -- [attackName] = when it can be used again
local unlockedAttacks = {"Belly Bump"} -- populated from server

-- Get attack config
local function getAttackConfig(name)
	for _, attack in ipairs(GameConfig.Attacks) do
		if attack.Name == name then
			return attack
		end
	end
	return nil
end

-- Keybinds for attacks (1-7 keys map to attack slots)
local attackKeys = {
	Enum.KeyCode.One,
	Enum.KeyCode.Two,
	Enum.KeyCode.Three,
	Enum.KeyCode.Four,
	Enum.KeyCode.Five,
	Enum.KeyCode.Six,
	Enum.KeyCode.Seven,
}

UserInputService.InputBegan:Connect(function(input, gameProcessed)
	if gameProcessed then return end
	if not inBattle then return end

	for i, keyCode in ipairs(attackKeys) do
		if input.KeyCode == keyCode then
			local attackName = unlockedAttacks[i]
			if not attackName then return end

			-- Check cooldown
			if attackCooldowns[attackName] and tick() < attackCooldowns[attackName] then
				return
			end

			local config = getAttackConfig(attackName)
			if not config then return end

			-- Set cooldown
			attackCooldowns[attackName] = tick() + config.Cooldown

			-- Get mouse position for targeting
			local mouse = player:GetMouse()
			local targetPos = mouse.Hit and mouse.Hit.Position or Vector3.new(0, 0, 0)

			Remotes.UseAttack:FireServer(attackName, targetPos)
			break
		end
	end
end)

-- Battle started
Remotes.BattleStarted.OnClientEvent:Connect(function(info)
	inBattle = true
	attackCooldowns = {}
	print("[BATTLE] Fight starting against " .. info.Opponent .. "!")
	print("[BATTLE] Your HP: " .. info.YourHP .. " | Their HP: " .. info.OpponentHP)
end)

-- Battle ended
Remotes.BattleEnded.OnClientEvent:Connect(function(info)
	inBattle = false
	if info.Result == "WIN" then
		print("[BATTLE] YOU WIN! Stole " .. (info.FoodStolen or 0) .. " food from " .. info.OpponentName)
	elseif info.Result == "LOSE" then
		print("[BATTLE] You lost to " .. info.OpponentName .. ". Lost " .. (info.FoodLost or 0) .. " food.")
	else
		print("[BATTLE] Draw against " .. info.OpponentName)
	end
end)

-- Damage received
Remotes.BattleDamage.OnClientEvent:Connect(function(info)
	print("[BATTLE] Hit by " .. info.AttackName .. " for " .. info.Damage .. " damage!")
end)

-- Health updates
Remotes.BattleHealthUpdated.OnClientEvent:Connect(function(info)
	-- Update UI health bars (handled by BattleUI)
end)

-- Attack unlocked
Remotes.AttackUnlocked.OnClientEvent:Connect(function(attackName)
	table.insert(unlockedAttacks, attackName)
	print("[ATTACKS] Unlocked: " .. attackName .. "!")
end)

-- Load initial data
task.spawn(function()
	task.wait(2)
	local data = Remotes.GetPlayerData:InvokeServer()
	if data and data.UnlockedAttacks then
		unlockedAttacks = data.UnlockedAttacks
	end
end)
