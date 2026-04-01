-- GameConfig.lua
-- Shared configuration for Chudlife Simulator [BATTLES]

local GameConfig = {}

-- Backpack
GameConfig.Backpack = {
	MaxCapacity = 20,           -- max ingredients before you must sell
	SlotWeights = {             -- some ingredients take more space
		Common = 1,
		Uncommon = 2,
		Rare = 3,
	},
}

-- Ingredients that spawn around the map
-- CoinValue = what you get if you sell raw instead of cooking
GameConfig.Ingredients = {
	{Name = "Burger Patty",   Rarity = "Common",   FoodValue = 5,   CoinValue = 3,   SpawnWeight = 40},
	{Name = "Cheese Wheel",   Rarity = "Common",   FoodValue = 3,   CoinValue = 2,   SpawnWeight = 45},
	{Name = "Hot Dog",        Rarity = "Common",   FoodValue = 4,   CoinValue = 3,   SpawnWeight = 40},
	{Name = "Fries Basket",   Rarity = "Common",   FoodValue = 3,   CoinValue = 2,   SpawnWeight = 45},
	{Name = "Pizza Slice",    Rarity = "Uncommon", FoodValue = 10,  CoinValue = 8,   SpawnWeight = 25},
	{Name = "Fried Chicken",  Rarity = "Uncommon", FoodValue = 12,  CoinValue = 10,  SpawnWeight = 20},
	{Name = "Sushi Platter",  Rarity = "Uncommon", FoodValue = 14,  CoinValue = 12,  SpawnWeight = 18},
	{Name = "Golden Steak",   Rarity = "Rare",     FoodValue = 30,  CoinValue = 25,  SpawnWeight = 5},
	{Name = "Mystery Meat",   Rarity = "Rare",     FoodValue = 50,  CoinValue = 40,  SpawnWeight = 3},
	{Name = "Diamond Donut",  Rarity = "Rare",     FoodValue = 45,  CoinValue = 35,  SpawnWeight = 4},
}

-- Ingredient spawning
GameConfig.Spawning = {
	MaxIngredientsOnMap = 50,
	SpawnIntervalSeconds = 5,
	RespawnDelaySeconds = 10,
}

-- Collection / Reach
GameConfig.Collection = {
	BaseCollectRange = 10,      -- default pickup distance (studs)
	BaseCollectSpeed = 1.0,     -- multiplier on how fast you grab
}

-- Growth / Chud system
GameConfig.Growth = {
	BaseScale = 1.0,            -- starting character scale
	MaxScale = 5.0,             -- biggest you can get
	ScalePerFoodLevel = 0.005,  -- how much you grow per food point
	FoodLevelOnDeath = 0,       -- reset to this after losing a battle
}

-- Chef / Diner
-- Players choose: sell raw for coins OR cook into food (growth)
GameConfig.Diner = {
	CookTimeSeconds = 3,        -- how long the chef takes to cook
	BonusMultiplier = 1.5,      -- bonus if you sell a full backpack
	FullBackpackThreshold = 18, -- slots filled to count as "full"
}

-- Coin Upgrades (bought with coins at an upgrade station)
GameConfig.Upgrades = {
	CollectSpeed = {
		Name = "Quick Hands",
		Description = "Collect ingredients faster",
		MaxLevel = 10,
		BaseCost = 25,
		CostMultiplier = 1.8,       -- cost increases per level
		BonusPerLevel = 0.15,       -- +15% collect speed per level
	},
	CollectRange = {
		Name = "Long Arms",
		Description = "Pick up ingredients from further away",
		MaxLevel = 10,
		BaseCost = 30,
		CostMultiplier = 1.8,
		BonusPerLevel = 3,          -- +3 studs range per level
	},
	BackpackSize = {
		Name = "Bigger Bag",
		Description = "Carry more ingredients",
		MaxLevel = 10,
		BaseCost = 50,
		CostMultiplier = 2.0,
		BonusPerLevel = 3,          -- +3 backpack slots per level
	},
	WalkSpeed = {
		Name = "Speedy Feet",
		Description = "Move faster around the map",
		MaxLevel = 5,
		BaseCost = 100,
		CostMultiplier = 2.5,
		BonusPerLevel = 2,          -- +2 walkspeed per level
	},
}

-- Battle Arena
GameConfig.Battle = {
	QueueCooldownSeconds = 10,  -- cooldown after a battle
	CountdownSeconds = 5,       -- countdown before fight starts
	ArenaDurationSeconds = 60,  -- max fight time before draw
	FoodStealPercent = 0.7,     -- winner takes 70% of loser's food level
	MinFoodToEnter = 10,        -- minimum food level to queue
	BaseHealth = 100,           -- starting HP in arena
	HealthPerFoodLevel = 0.5,   -- bonus HP from being chudded
}

-- Attacks (unlocked with coins, used in Battle Arena)
GameConfig.Attacks = {
	-- Starter attack (free)
	{
		Name = "Belly Bump",
		Description = "A basic body slam",
		Damage = 10,
		Cooldown = 1.5,
		Range = 8,
		UnlockCost = 0,            -- free starter
		RequiredFoodLevel = 0,
	},
	-- Coin unlocks
	{
		Name = "Ground Pound",
		Description = "Jump and slam the ground with your weight",
		Damage = 18,
		Cooldown = 3.0,
		Range = 12,
		UnlockCost = 100,
		RequiredFoodLevel = 0,
	},
	{
		Name = "Food Throw",
		Description = "Hurl a projectile of food at your opponent",
		Damage = 12,
		Cooldown = 2.0,
		Range = 30,
		UnlockCost = 150,
		RequiredFoodLevel = 0,
		IsProjectile = true,
	},
	{
		Name = "Belly Bounce",
		Description = "Bounce your gut to deflect and knock back",
		Damage = 8,
		Cooldown = 4.0,
		Range = 15,
		UnlockCost = 200,
		RequiredFoodLevel = 20,
		KnockbackForce = 50,
	},
	{
		Name = "Shockwave Stomp",
		Description = "Stomp so hard the ground shakes in an AOE",
		Damage = 25,
		Cooldown = 5.0,
		Range = 20,
		UnlockCost = 500,
		RequiredFoodLevel = 50,
		IsAOE = true,
		AOERadius = 15,
	},
	{
		Name = "Chud Charge",
		Description = "Full speed charge that deals damage based on your size",
		Damage = 15,                -- base, scales with food level
		Cooldown = 6.0,
		Range = 35,
		UnlockCost = 750,
		RequiredFoodLevel = 80,
		ScalesWithSize = true,
		SizeScaling = 0.2,          -- +0.2 damage per food level
	},
	{
		Name = "Mega Slam",
		Description = "The ultimate attack — massive AOE ground pound",
		Damage = 40,
		Cooldown = 10.0,
		Range = 10,
		UnlockCost = 1500,
		RequiredFoodLevel = 150,
		IsAOE = true,
		AOERadius = 25,
	},
}

-- Togo Containers (like eggs) — open for pets that multiply ingredient pickups
GameConfig.TogoContainers = {
	{
		Name = "Basic Togo Box",
		Cost = 50,               -- coins
		Currency = "Coins",
		OpenTimeSeconds = 3,
		Pets = {
			{Name = "Chicken Nugget",  Rarity = "Common",   PickupMultiplier = 1.5,  Weight = 50},
			{Name = "Burger Buddy",    Rarity = "Common",   PickupMultiplier = 1.5,  Weight = 50},
			{Name = "Fry Guy",         Rarity = "Uncommon", PickupMultiplier = 2.0,  Weight = 25},
			{Name = "Pizza Pal",       Rarity = "Uncommon", PickupMultiplier = 2.0,  Weight = 20},
			{Name = "Golden Drumstick",Rarity = "Rare",     PickupMultiplier = 3.0,  Weight = 5},
		},
	},
	{
		Name = "Premium Togo Box",
		Cost = 200,
		Currency = "Coins",
		OpenTimeSeconds = 3,
		Pets = {
			{Name = "Sushi Cat",       Rarity = "Uncommon", PickupMultiplier = 2.5,  Weight = 40},
			{Name = "Steak Shark",     Rarity = "Uncommon", PickupMultiplier = 2.5,  Weight = 35},
			{Name = "Donut Dragon",    Rarity = "Rare",     PickupMultiplier = 4.0,  Weight = 15},
			{Name = "Diamond Chef",    Rarity = "Rare",     PickupMultiplier = 5.0,  Weight = 8},
			{Name = "Golden Chud",     Rarity = "Legendary",PickupMultiplier = 8.0,  Weight = 2},
		},
	},
	{
		Name = "Legendary Togo Box",
		Cost = 500,
		Currency = "Coins",
		OpenTimeSeconds = 5,
		Pets = {
			{Name = "Donut Dragon",    Rarity = "Rare",     PickupMultiplier = 4.0,  Weight = 40},
			{Name = "Diamond Chef",    Rarity = "Rare",     PickupMultiplier = 5.0,  Weight = 30},
			{Name = "Golden Chud",     Rarity = "Legendary",PickupMultiplier = 8.0,  Weight = 20},
			{Name = "Mega Chud King",  Rarity = "Legendary",PickupMultiplier = 10.0, Weight = 10},
		},
	},
}

-- Robux-to-Coins packs
GameConfig.CoinPacks = {
	{Name = "Snack Pack",     Coins = 100,   RobuxPrice = 25},
	{Name = "Meal Deal",      Coins = 500,   RobuxPrice = 100},
	{Name = "Feast Bundle",   Coins = 1200,  RobuxPrice = 200},
	{Name = "Chud Vault",     Coins = 5000,  RobuxPrice = 700},
}

-- Gamepasses / In-App Purchases (Robux)
GameConfig.Gamepasses = {
	GrowthBooster = {
		GamepassId = 0,                -- replace with real gamepass ID
		DurationSeconds = 30 * 60,     -- 30 minutes
		Multiplier = 2.0,              -- 2x food value from chef
		DisplayName = "2x Growth Booster (30 min)",
		RobuxPrice = 75,
	},
	DoubleCapacity = {
		GamepassId = 0,
		DurationSeconds = 30 * 60,
		BackpackBonus = 20,            -- +20 extra slots
		DisplayName = "Double Backpack (30 min)",
		RobuxPrice = 50,
	},
	VIPChef = {
		GamepassId = 0,
		DurationSeconds = 30 * 60,
		CookTimeMultiplier = 0.5,      -- chef cooks 2x faster
		BonusFoodPercent = 0.25,       -- +25% food from cooking
		DisplayName = "VIP Chef (30 min)",
		RobuxPrice = 100,
	},
	CoinBooster = {
		GamepassId = 0,
		DurationSeconds = 30 * 60,
		Multiplier = 2.0,              -- 2x coins from selling
		DisplayName = "2x Coins Booster (30 min)",
		RobuxPrice = 75,
	},
	DoubleStealer = {
		GamepassId = 0,                -- replace with real gamepass ID
		DurationSeconds = 30 * 60,     -- 30 minutes
		StealMultiplier = 2.0,         -- 2x stolen food from battles
		DisplayName = "2x Food Steal (30 min)",
		RobuxPrice = 100,
	},
}

return GameConfig
