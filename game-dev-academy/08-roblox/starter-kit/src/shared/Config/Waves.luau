--!strict
-- One entry per wave. Saw-tooth pacing: build, boss, release (see 02-game-design/03).
-- `warning` is shown before the wave starts so spikes are never a surprise.

export type Group = { enemy: string, count: number, gap: number }
export type Wave = { groups: { Group }, bonus: number, warning: string? }

local Waves: { Wave } = {
	{ groups = { { enemy = "Blob", count = 5, gap = 1.2 } }, bonus = 50 },
	{ groups = { { enemy = "Blob", count = 8, gap = 1.0 } }, bonus = 60 },
	{ groups = { { enemy = "Blob", count = 6, gap = 0.9 }, { enemy = "Runner", count = 3, gap = 0.8 } }, bonus = 70 },
	{ groups = { { enemy = "Runner", count = 8, gap = 0.7 } }, bonus = 80, warning = "Fast enemies!" },
	{ groups = { { enemy = "Brute", count = 1, gap = 0 } }, bonus = 150, warning = "BOSS: focus your damage!" },
	{ groups = { { enemy = "Blob", count = 10, gap = 0.6 } }, bonus = 90 }, -- release
	{ groups = { { enemy = "Bat", count = 6, gap = 1.0 } }, bonus = 110, warning = "Flying! Archers can hit them." },
}

return Waves
