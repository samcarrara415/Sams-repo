-- BattleArenaService.lua
-- Manages the 1v1 Battle Arena: matchmaking, fighting, and food level stealing

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local GameConfig = require(ReplicatedStorage:WaitForChild("GameConfig"))
local Remotes = require(ReplicatedStorage:WaitForChild("RemoteEvents"))

local BattleArenaService = {}

local queue = {}             -- array of players waiting to fight
local activeBattles = {}     -- [player.UserId] = battle info
local cooldowns = {}         -- [player.UserId] = tick when cooldown ends
local battleHealth = {}      -- [player.UserId] = current HP in battle

-- Get attack config by name
local function getAttackConfig(attackName)
	for _, attack in ipairs(GameConfig.Attacks) do
		if attack.Name == attackName then
			return attack
		end
	end
	return nil
end

-- Calculate battle HP for a player
local function calculateBattleHP(player)
	local PlayerDataManager = require(script.Parent:WaitForChild("PlayerDataManager"))
	local data = PlayerDataManager.GetData(player)
	if not data then return GameConfig.Battle.BaseHealth end
	return GameConfig.Battle.BaseHealth + (data.FoodLevel * GameConfig.Battle.HealthPerFoodLevel)
end

-- Teleport player to arena position
local function teleportToArena(player, position)
	local character = player.Character
	if character and character:FindFirstChild("HumanoidRootPart") then
		character.HumanoidRootPart.CFrame = CFrame.new(position)
	end
end

-- End a battle with a winner and loser
local function endBattle(winner, loser)
	local PlayerDataManager = require(script.Parent:WaitForChild("PlayerDataManager"))
	local winnerData = PlayerDataManager.GetData(winner)
	local loserData = PlayerDataManager.GetData(loser)

	local stolenFood = 0
	if loserData then
		stolenFood = math.floor(loserData.FoodLevel * GameConfig.Battle.FoodStealPercent)
		PlayerDataManager.SetFoodLevel(loser, GameConfig.Growth.FoodLevelOnDeath)
	end

	if winnerData then
		PlayerDataManager.AddFoodLevel(winner, stolenFood)
	end

	-- Notify both players
	Remotes.BattleEnded:FireClient(winner, {
		Result = "WIN",
		FoodStolen = stolenFood,
		OpponentName = loser.Name,
	})
	Remotes.BattleEnded:FireClient(loser, {
		Result = "LOSE",
		FoodLost = stolenFood,
		OpponentName = winner.Name,
	})

	-- Cleanup
	activeBattles[winner.UserId] = nil
	activeBattles[loser.UserId] = nil
	battleHealth[winner.UserId] = nil
	battleHealth[loser.UserId] = nil
	cooldowns[winner.UserId] = tick() + GameConfig.Battle.QueueCooldownSeconds
	cooldowns[loser.UserId] = tick() + GameConfig.Battle.QueueCooldownSeconds

	-- Respawn loser
	loser:LoadCharacter()
end

-- Start a battle between two players
local function startBattle(player1, player2)
	local hp1 = calculateBattleHP(player1)
	local hp2 = calculateBattleHP(player2)

	battleHealth[player1.UserId] = hp1
	battleHealth[player2.UserId] = hp2

	local battleInfo = {
		Player1 = player1,
		Player2 = player2,
		StartTick = tick(),
	}

	activeBattles[player1.UserId] = battleInfo
	activeBattles[player2.UserId] = battleInfo

	-- Teleport to arena positions (configurable in workspace)
	local arena = game.Workspace:FindFirstChild("BattleArena")
	local pos1 = arena and arena:FindFirstChild("Spawn1") and arena.Spawn1.Position or Vector3.new(200, 10, 0)
	local pos2 = arena and arena:FindFirstChild("Spawn2") and arena.Spawn2.Position or Vector3.new(220, 10, 0)

	-- Countdown
	Remotes.BattleStarted:FireClient(player1, {
		Opponent = player2.Name,
		OpponentFoodLevel = require(script.Parent.PlayerDataManager).GetData(player2).FoodLevel,
		YourHP = hp1,
		OpponentHP = hp2,
		CountdownSeconds = GameConfig.Battle.CountdownSeconds,
	})
	Remotes.BattleStarted:FireClient(player2, {
		Opponent = player1.Name,
		OpponentFoodLevel = require(script.Parent.PlayerDataManager).GetData(player1).FoodLevel,
		YourHP = hp2,
		OpponentHP = hp1,
		CountdownSeconds = GameConfig.Battle.CountdownSeconds,
	})

	task.wait(GameConfig.Battle.CountdownSeconds)
	teleportToArena(player1, pos1)
	teleportToArena(player2, pos2)

	-- Timer: if battle exceeds duration, it's a draw
	task.delay(GameConfig.Battle.ArenaDurationSeconds, function()
		if activeBattles[player1.UserId] and activeBattles[player1.UserId] == battleInfo then
			-- Draw - no food stolen
			Remotes.BattleEnded:FireClient(player1, {Result = "DRAW", OpponentName = player2.Name})
			Remotes.BattleEnded:FireClient(player2, {Result = "DRAW", OpponentName = player1.Name})
			activeBattles[player1.UserId] = nil
			activeBattles[player2.UserId] = nil
			battleHealth[player1.UserId] = nil
			battleHealth[player2.UserId] = nil
			cooldowns[player1.UserId] = tick() + GameConfig.Battle.QueueCooldownSeconds
			cooldowns[player2.UserId] = tick() + GameConfig.Battle.QueueCooldownSeconds
		end
	end)
end

-- Matchmaking: check queue for a match
local function tryMatchmaking()
	if #queue < 2 then return end

	local player1 = table.remove(queue, 1)
	local player2 = table.remove(queue, 1)

	-- Validate both still in game
	if not player1.Parent or not player2.Parent then return end

	startBattle(player1, player2)
end

-- Join queue
Remotes.JoinBattleQueue.OnServerEvent:Connect(function(player)
	local PlayerDataManager = require(script.Parent:WaitForChild("PlayerDataManager"))
	local data = PlayerDataManager.GetData(player)
	if not data then return end

	-- Check minimum food level
	if data.FoodLevel < GameConfig.Battle.MinFoodToEnter then return end

	-- Check cooldown
	if cooldowns[player.UserId] and tick() < cooldowns[player.UserId] then return end

	-- Check not already in battle or queue
	if activeBattles[player.UserId] then return end
	for _, p in ipairs(queue) do
		if p == player then return end
	end

	table.insert(queue, player)
	tryMatchmaking()
end)

-- Leave queue
Remotes.LeaveBattleQueue.OnServerEvent:Connect(function(player)
	for i, p in ipairs(queue) do
		if p == player then
			table.remove(queue, i)
			break
		end
	end
end)

-- Handle attack usage in battle
Remotes.UseAttack.OnServerEvent:Connect(function(attacker, attackName, targetPosition)
	if not activeBattles[attacker.UserId] then return end

	local PlayerDataManager = require(script.Parent:WaitForChild("PlayerDataManager"))
	local data = PlayerDataManager.GetData(attacker)
	if not data then return end

	-- Verify attack is unlocked
	local hasAttack = false
	for _, name in ipairs(data.UnlockedAttacks) do
		if name == attackName then
			hasAttack = true
			break
		end
	end
	if not hasAttack then return end

	local attackConfig = getAttackConfig(attackName)
	if not attackConfig then return end

	-- Find opponent
	local battle = activeBattles[attacker.UserId]
	local opponent = (battle.Player1 == attacker) and battle.Player2 or battle.Player1

	if not opponent or not opponent.Character then return end
	local opponentRoot = opponent.Character:FindFirstChild("HumanoidRootPart")
	if not opponentRoot then return end

	local attackerRoot = attacker.Character and attacker.Character:FindFirstChild("HumanoidRootPart")
	if not attackerRoot then return end

	-- Range check
	local distance = (attackerRoot.Position - opponentRoot.Position).Magnitude
	local inRange = false

	if attackConfig.IsAOE then
		inRange = distance <= attackConfig.AOERadius
	else
		inRange = distance <= attackConfig.Range
	end

	if not inRange then return end

	-- Calculate damage
	local damage = attackConfig.Damage
	if attackConfig.ScalesWithSize then
		damage = damage + (data.FoodLevel * attackConfig.SizeScaling)
	end

	-- Apply damage
	battleHealth[opponent.UserId] = (battleHealth[opponent.UserId] or 100) - damage

	-- Knockback
	if attackConfig.KnockbackForce then
		local direction = (opponentRoot.Position - attackerRoot.Position).Unit
		opponentRoot.Velocity = direction * attackConfig.KnockbackForce
	end

	-- Notify clients
	Remotes.BattleDamage:FireClient(opponent, {Damage = damage, AttackName = attackName})
	Remotes.BattleHealthUpdated:FireClient(attacker, {
		YourHP = battleHealth[attacker.UserId],
		OpponentHP = battleHealth[opponent.UserId],
	})
	Remotes.BattleHealthUpdated:FireClient(opponent, {
		YourHP = battleHealth[opponent.UserId],
		OpponentHP = battleHealth[attacker.UserId],
	})

	-- Check for KO
	if battleHealth[opponent.UserId] <= 0 then
		endBattle(attacker, opponent)
	end
end)

-- Cleanup when player leaves
Players.PlayerRemoving:Connect(function(player)
	-- Remove from queue
	for i, p in ipairs(queue) do
		if p == player then
			table.remove(queue, i)
			break
		end
	end

	-- If in battle, opponent wins by default
	if activeBattles[player.UserId] then
		local battle = activeBattles[player.UserId]
		local opponent = (battle.Player1 == player) and battle.Player2 or battle.Player1
		if opponent and opponent.Parent then
			endBattle(opponent, player)
		end
	end
end)

return BattleArenaService
