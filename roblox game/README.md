# Chudlife Simulator [BATTLES]

A Roblox game where you collect ingredients, sell them to the chef to get chudded, or sell for coins to buy upgrades and new attacks — then battle other players!

## Game Loop

1. **Collect Ingredients** - Roam the map picking up ingredients that fill your backpack
2. **Go to the Diner** - Two choices:
   - **COOK** - Chef turns ingredients into food that makes you fatter (chudded)
   - **SELL** - Sell raw ingredients for coins (used for upgrades & attacks)
3. **Grow (Get Chudded)** - Cooking food makes your character physically scale up
4. **Upgrade** - Spend coins on collection speed, reach distance, backpack size, walk speed
5. **Unlock Attacks** - Buy new battle moves with coins (7 attacks from Belly Bump to Mega Slam)
6. **Battle** - Enter the Challenge Arena to duel other players 1v1
7. **Winner Takes All** - The winner absorbs the loser's food level and grows even bigger

## Systems

### Backpack & Collection
- Limited backpack capacity (upgradeable with coins)
- Ingredients spawn around the map with different rarities (Common, Uncommon, Rare)
- Collect range and speed upgradeable with coins

### Diner (Chef NPC)
- **Cook path**: ingredients → food → growth (get chudded)
- **Sell path**: ingredients → coins → upgrades & attacks
- Full backpack bonus: 1.5x food value if you sell with 18+ items

### Coin Upgrades
| Upgrade | Effect | Max Level |
|---------|--------|-----------|
| Quick Hands | +15% collect speed/level | 10 |
| Long Arms | +3 studs pickup range/level | 10 |
| Bigger Bag | +3 backpack slots/level | 10 |
| Speedy Feet | +2 walk speed/level | 5 |

### Attacks (Used in Battle Arena)
| Attack | Damage | Cooldown | Cost | Special |
|--------|--------|----------|------|---------|
| Belly Bump | 10 | 1.5s | Free | Starter |
| Ground Pound | 18 | 3.0s | 100 | - |
| Food Throw | 12 | 2.0s | 150 | Projectile |
| Belly Bounce | 8 | 4.0s | 200 | Knockback |
| Shockwave Stomp | 25 | 5.0s | 500 | AOE |
| Chud Charge | 15+ | 6.0s | 750 | Scales with size |
| Mega Slam | 40 | 10.0s | 1500 | Massive AOE |

### Battle Arena
- 1v1 matchmaking queue
- HP = 100 base + 0.5 per food level
- Winner steals 100% of loser's food level
- 60 second time limit (draw = no food stolen)
- Use number keys 1-7 to use attacks

### Gamepasses (Robux)
- **2x Growth Booster** (30 min) - Double food from cooking
- **2x Coins Booster** (30 min) - Double coins from selling
- **Double Backpack** (30 min) - +20 extra slots
- **VIP Chef** (30 min) - Faster cooking + 25% bonus food

## Project Structure

```
src/
├── ServerScriptService/        -- Server-side game logic
│   ├── PlayerDataManager.lua   -- Player data, backpack, upgrades, attacks
│   ├── IngredientSpawner.lua   -- Spawns ingredients around the map
│   ├── DinerService.lua        -- Cook for food OR sell for coins
│   ├── BattleArenaService.lua  -- 1v1 matchmaking, combat, food stealing
│   └── GamepassService.lua     -- Robux booster purchases
├── ReplicatedStorage/          -- Shared modules & config
│   ├── GameConfig.lua          -- All game balance numbers
│   └── RemoteEvents.lua        -- Client-server communication
├── StarterPlayerScripts/       -- Client-side scripts
│   ├── IngredientCollector.lua -- Auto-collect nearby ingredients
│   ├── BackpackClient.lua      -- Track backpack state
│   ├── GrowthVisuals.lua       -- Growth effects & camera shake
│   └── BattleArenaClient.lua   -- Attack inputs & battle state
└── StarterGui/                 -- UI screens
    ├── BackpackUI.lua          -- Backpack HUD (bottom-right)
    ├── DinerUI.lua             -- Cook vs Sell menu at the chef
    ├── BattleUI.lua            -- HP bars, attack hotbar, results
    └── ShopUI.lua              -- Upgrades, attacks, & boosters shop
```

## Setup in Roblox Studio

1. Import scripts into the matching services (ServerScriptService, ReplicatedStorage, etc.)
2. Create a "ChefNPC" model in Workspace for the diner
3. Create a "BattleArena" folder in Workspace with "Spawn1" and "Spawn2" parts
4. Optionally create an "IngredientSpawns" folder with parts marking spawn locations
5. Set real Gamepass IDs in GameConfig.lua before publishing
