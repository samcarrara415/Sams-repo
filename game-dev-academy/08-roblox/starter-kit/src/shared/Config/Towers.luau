--!strict
-- Every number a designer might tune lives here. The server reads it to validate
-- and simulate; the client reads it to draw the shop. Never trust a value sent by a client.

export type TowerConfig = {
	name: string,
	cost: number,
	damage: number,
	range: number,
	cooldown: number,
	splash: number?, -- radius in studs; nil = single target
	hitsAir: boolean,
	rarity: "Common" | "Rare" | "Epic" | "Legendary",
	upgrades: { { cost: number, damageMult: number, rangeMult: number } },
}

local Towers: { [string]: TowerConfig } = {
	Archer = {
		name = "Archer",
		cost = 100,
		damage = 5,
		range = 18,
		cooldown = 0.8,
		hitsAir = true,
		rarity = "Common",
		upgrades = {
			{ cost = 80, damageMult = 1.5, rangeMult = 1.1 },
			{ cost = 200, damageMult = 2.2, rangeMult = 1.2 },
		},
	},
	Cannon = {
		name = "Cannon",
		cost = 250,
		damage = 22,
		range = 14,
		cooldown = 2.0,
		splash = 6,
		hitsAir = false,
		rarity = "Rare",
		upgrades = {
			{ cost = 200, damageMult = 1.5, rangeMult = 1.0 },
			{ cost = 450, damageMult = 2.3, rangeMult = 1.15 },
		},
	},
}

return Towers
