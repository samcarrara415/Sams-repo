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

-- ============================================================
-- WORLDS — unlocked by rebirth count, each with better ingredients
-- ============================================================
GameConfig.Worlds = {
	{
		Name = "Fast Food Town",
		Description = "Where every chud begins their journey",
		RequiredRebirths = 0,
		FolderName = "World1",          -- Workspace folder name
		IngredientMultiplier = 1.0,     -- base values
		Ingredients = {
			{Name = "Burger Patty",   Rarity = "Common",   FoodValue = 5,   CoinValue = 3,   SpawnWeight = 40},
			{Name = "Cheese Wheel",   Rarity = "Common",   FoodValue = 3,   CoinValue = 2,   SpawnWeight = 45},
			{Name = "Hot Dog",        Rarity = "Common",   FoodValue = 4,   CoinValue = 3,   SpawnWeight = 40},
			{Name = "Fries Basket",   Rarity = "Common",   FoodValue = 3,   CoinValue = 2,   SpawnWeight = 45},
			{Name = "Pizza Slice",    Rarity = "Uncommon", FoodValue = 10,  CoinValue = 8,   SpawnWeight = 25},
			{Name = "Fried Chicken",  Rarity = "Uncommon", FoodValue = 12,  CoinValue = 10,  SpawnWeight = 20},
			{Name = "Golden Steak",   Rarity = "Rare",     FoodValue = 30,  CoinValue = 25,  SpawnWeight = 5},
		},
		Upgrades = {
			Spatula = {
				Name = "Spatula",
				Description = "A basic flipper — boosts food value from cooking",
				MaxLevel = 10,
				BaseCost = 30,
				CostMultiplier = 1.8,
				BonusPerLevel = 0.05,       -- +5% food value per level
				BoostType = "FoodValue",
			},
			WoodenSpoon = {
				Name = "Wooden Spoon",
				Description = "Stir faster — boosts coin value from selling",
				MaxLevel = 10,
				BaseCost = 30,
				CostMultiplier = 1.8,
				BonusPerLevel = 0.05,       -- +5% coin value per level
				BoostType = "CoinValue",
			},
		},
	},
	{
		Name = "Italian Kitchen",
		Description = "Pasta, pizza, and primo ingredients",
		RequiredRebirths = 3,
		FolderName = "World2",
		IngredientMultiplier = 2.5,
		Ingredients = {
			{Name = "Spaghetti Bowl", Rarity = "Common",   FoodValue = 12,  CoinValue = 8,   SpawnWeight = 40},
			{Name = "Garlic Bread",   Rarity = "Common",   FoodValue = 10,  CoinValue = 7,   SpawnWeight = 45},
			{Name = "Meatball Sub",   Rarity = "Common",   FoodValue = 14,  CoinValue = 10,  SpawnWeight = 35},
			{Name = "Lasagna Tray",   Rarity = "Uncommon", FoodValue = 25,  CoinValue = 20,  SpawnWeight = 20},
			{Name = "Truffle Risotto",Rarity = "Uncommon", FoodValue = 35,  CoinValue = 28,  SpawnWeight = 15},
			{Name = "Gold Cannoli",   Rarity = "Rare",     FoodValue = 80,  CoinValue = 65,  SpawnWeight = 5},
			{Name = "Diamond Tiramisu",Rarity = "Rare",    FoodValue = 120, CoinValue = 95,  SpawnWeight = 3},
		},
		Upgrades = {
			RollingPin = {
				Name = "Rolling Pin",
				Description = "Roll out more dough — boosts food value",
				MaxLevel = 15,
				BaseCost = 100,
				CostMultiplier = 2.0,
				BonusPerLevel = 0.06,
				BoostType = "FoodValue",
			},
			PastaFork = {
				Name = "Pasta Fork",
				Description = "Twirl up more coins from every sale",
				MaxLevel = 15,
				BaseCost = 100,
				CostMultiplier = 2.0,
				BonusPerLevel = 0.06,
				BoostType = "CoinValue",
			},
			PizzaPeel = {
				Name = "Pizza Peel",
				Description = "Slide ingredients in faster — boosts collect speed",
				MaxLevel = 10,
				BaseCost = 150,
				CostMultiplier = 2.2,
				BonusPerLevel = 0.10,
				BoostType = "CollectSpeed",
			},
		},
	},
	{
		Name = "Sushi Dojo",
		Description = "Master the art of raw power",
		RequiredRebirths = 7,
		FolderName = "World3",
		IngredientMultiplier = 6.0,
		Ingredients = {
			{Name = "Salmon Nigiri",  Rarity = "Common",   FoodValue = 30,  CoinValue = 22,  SpawnWeight = 40},
			{Name = "Tuna Roll",      Rarity = "Common",   FoodValue = 25,  CoinValue = 18,  SpawnWeight = 45},
			{Name = "Tempura Shrimp", Rarity = "Common",   FoodValue = 28,  CoinValue = 20,  SpawnWeight = 38},
			{Name = "Dragon Roll",    Rarity = "Uncommon", FoodValue = 60,  CoinValue = 48,  SpawnWeight = 18},
			{Name = "Wagyu Sashimi",  Rarity = "Uncommon", FoodValue = 80,  CoinValue = 65,  SpawnWeight = 12},
			{Name = "Golden Omakase", Rarity = "Rare",     FoodValue = 200, CoinValue = 160, SpawnWeight = 4},
			{Name = "Diamond Fugu",   Rarity = "Rare",     FoodValue = 300, CoinValue = 240, SpawnWeight = 2},
		},
		Upgrades = {
			SushiKnife = {
				Name = "Sushi Knife",
				Description = "Precision cuts — massive food value boost",
				MaxLevel = 20,
				BaseCost = 500,
				CostMultiplier = 2.0,
				BonusPerLevel = 0.07,
				BoostType = "FoodValue",
			},
			Chopsticks = {
				Name = "Golden Chopsticks",
				Description = "Pick up ingredients from even further",
				MaxLevel = 15,
				BaseCost = 400,
				CostMultiplier = 2.0,
				BonusPerLevel = 5,
				BoostType = "CollectRange",
			},
			WasabiGrater = {
				Name = "Wasabi Grater",
				Description = "Spice up your sales — huge coin boost",
				MaxLevel = 20,
				BaseCost = 500,
				CostMultiplier = 2.0,
				BonusPerLevel = 0.07,
				BoostType = "CoinValue",
			},
		},
	},
	{
		Name = "BBQ Pitmaster",
		Description = "Low and slow for maximum gains",
		RequiredRebirths = 12,
		FolderName = "World4",
		IngredientMultiplier = 15.0,
		Ingredients = {
			{Name = "Brisket Slab",   Rarity = "Common",   FoodValue = 70,  CoinValue = 55,  SpawnWeight = 40},
			{Name = "Smoked Ribs",    Rarity = "Common",   FoodValue = 60,  CoinValue = 45,  SpawnWeight = 45},
			{Name = "Pulled Pork",    Rarity = "Common",   FoodValue = 55,  CoinValue = 40,  SpawnWeight = 42},
			{Name = "Burnt Ends",     Rarity = "Uncommon", FoodValue = 150, CoinValue = 120, SpawnWeight = 15},
			{Name = "Smoked Turkey",  Rarity = "Uncommon", FoodValue = 180, CoinValue = 145, SpawnWeight = 10},
			{Name = "Golden BBQ Sauce",Rarity = "Rare",    FoodValue = 500, CoinValue = 400, SpawnWeight = 3},
			{Name = "Diamond Brisket",Rarity = "Rare",     FoodValue = 750, CoinValue = 600, SpawnWeight = 2},
		},
		Upgrades = {
			BBQTongs = {
				Name = "BBQ Tongs",
				Description = "Grip more — massive food value boost",
				MaxLevel = 25,
				BaseCost = 2000,
				CostMultiplier = 2.0,
				BonusPerLevel = 0.08,
				BoostType = "FoodValue",
			},
			SmokingPipe = {
				Name = "Smoking Pipe",
				Description = "Slow smoke your sales for more coins",
				MaxLevel = 25,
				BaseCost = 2000,
				CostMultiplier = 2.0,
				BonusPerLevel = 0.08,
				BoostType = "CoinValue",
			},
			MeatHook = {
				Name = "Meat Hook",
				Description = "Reach further to grab ingredients",
				MaxLevel = 20,
				BaseCost = 2500,
				CostMultiplier = 2.2,
				BonusPerLevel = 6,
				BoostType = "CollectRange",
			},
			FireBellows = {
				Name = "Fire Bellows",
				Description = "Stoke the fire — faster collection",
				MaxLevel = 20,
				BaseCost = 2500,
				CostMultiplier = 2.2,
				BonusPerLevel = 0.12,
				BoostType = "CollectSpeed",
			},
		},
	},
	{
		Name = "Golden Banquet",
		Description = "The ultimate feast — only true chuds reach here",
		RequiredRebirths = 20,
		FolderName = "World5",
		IngredientMultiplier = 40.0,
		Ingredients = {
			{Name = "Truffle Steak",      Rarity = "Common",   FoodValue = 200,  CoinValue = 160,  SpawnWeight = 40},
			{Name = "Lobster Thermidor",   Rarity = "Common",   FoodValue = 180,  CoinValue = 140,  SpawnWeight = 42},
			{Name = "Caviar Platter",      Rarity = "Common",   FoodValue = 220,  CoinValue = 175,  SpawnWeight = 38},
			{Name = "Wagyu A5 Tomahawk",   Rarity = "Uncommon", FoodValue = 500,  CoinValue = 400,  SpawnWeight = 12},
			{Name = "Gold Leaf Cake",      Rarity = "Uncommon", FoodValue = 600,  CoinValue = 480,  SpawnWeight = 10},
			{Name = "Diamond Feast",       Rarity = "Rare",     FoodValue = 2000, CoinValue = 1600, SpawnWeight = 3},
			{Name = "Cosmic Chud Meal",    Rarity = "Rare",     FoodValue = 5000, CoinValue = 4000, SpawnWeight = 1},
		},
		Upgrades = {
			GoldSpatula = {
				Name = "Gold Spatula",
				Description = "The ultimate tool — insane food boost",
				MaxLevel = 30,
				BaseCost = 10000,
				CostMultiplier = 2.0,
				BonusPerLevel = 0.10,
				BoostType = "FoodValue",
			},
			DiamondLadle = {
				Name = "Diamond Ladle",
				Description = "Scoop up massive coins",
				MaxLevel = 30,
				BaseCost = 10000,
				CostMultiplier = 2.0,
				BonusPerLevel = 0.10,
				BoostType = "CoinValue",
			},
			CosmicWhisk = {
				Name = "Cosmic Whisk",
				Description = "Whisk ingredients from across the map",
				MaxLevel = 25,
				BaseCost = 15000,
				CostMultiplier = 2.2,
				BonusPerLevel = 8,
				BoostType = "CollectRange",
			},
			MasterChefHat = {
				Name = "Master Chef Hat",
				Description = "Collect at lightning speed",
				MaxLevel = 25,
				BaseCost = 15000,
				CostMultiplier = 2.2,
				BonusPerLevel = 0.15,
				BoostType = "CollectSpeed",
			},
		},
	},
}

-- Default ingredients (kept for backwards compat, same as World 1)
GameConfig.Ingredients = GameConfig.Worlds[1].Ingredients

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

-- Rebirth System
GameConfig.Rebirth = {
	BaseFoodRequired = 500,         -- food level needed for first rebirth
	FoodMultiplierPerRebirth = 1.5, -- each rebirth costs 1.5x more food
	BoostPerRebirth = 0.02,         -- +2% to ALL gains per rebirth
	MaxRebirths = 100,              -- cap
	-- What resets on rebirth:
	ResetsFood = true,              -- food level goes to 0
	ResetsCoins = false,            -- keep your coins
	ResetsUpgrades = true,          -- upgrades reset to 0
	ResetsPets = false,             -- keep your pets
	ResetsAttacks = false,          -- keep unlocked attacks
}

-- Leaderboards (uses Roblox OrderedDataStores)
GameConfig.Leaderboards = {
	Rebirths = {
		DisplayName = "REBIRTHS",
		DataStoreName = "RebirthLeaderboard",
		MaxEntries = 50,
	},
	DuelWins = {
		DisplayName = "DUEL WINS",
		DataStoreName = "DuelWinsLeaderboard",
		MaxEntries = 50,
	},
	TopSpender = {
		DisplayName = "TOP SPENDER",
		DataStoreName = "TopSpenderLeaderboard",
		MaxEntries = 50,
	},
}

-- Chef / Diner
-- Players choose: sell raw for coins OR cook into food (growth)
GameConfig.Diner = {
	BaseCookTimeSeconds = 10,       -- minimum cook time
	CookTimePerIngredient = 3,      -- +3 seconds per ingredient in backpack
	MaxCookTimeSeconds = 180,       -- cap at 3 minutes
	BonusMultiplier = 1.5,          -- bonus if you sell a full backpack
	FullBackpackThreshold = 18,     -- slots filled to count as "full"
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
	SkipQueue = {
		GamepassId = 0,                -- replace with real gamepass ID
		IsPermanent = true,            -- one-time purchase, lasts forever
		DisplayName = "Skip Cook Queue (Permanent)",
		RobuxPrice = 500,
	},
}

return GameConfig
