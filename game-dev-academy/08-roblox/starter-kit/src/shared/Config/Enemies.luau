--!strict
export type EnemyConfig = {
	health: number,
	speed: number, -- studs per second along the path
	reward: number, -- in-match cash for the player who lands the kill
	flying: boolean,
	boss: boolean?,
}

local Enemies: { [string]: EnemyConfig } = {
	Blob = { health = 20, speed = 8, reward = 5, flying = false },
	Runner = { health = 12, speed = 14, reward = 6, flying = false },
	Bat = { health = 15, speed = 10, reward = 8, flying = true },
	Brute = { health = 400, speed = 5, reward = 120, flying = false, boss = true },
}

return Enemies
