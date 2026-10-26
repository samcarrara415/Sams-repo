--!strict
-- Replace the 0 ids with your real Developer Product / Game Pass ids from the Creator Dashboard.
-- Sell convenience and expression, never the only way past a wall (07-engagement-and-retention/03).

local Products = {
	DevProducts = {
		[0] = { name = "Gem Pouch", grant = { gems = 100 } },
	} :: { [number]: { name: string, grant: { gems: number? } } },

	GamePasses = {
		SpeedUp = 0, -- 2x match speed
		ExtraLoadoutSlot = 0,
	},
}

return Products
