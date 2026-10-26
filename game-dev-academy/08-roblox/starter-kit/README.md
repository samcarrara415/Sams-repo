# DoSa TD Starter Kit

A small but complete tower-defense game skeleton for Roblox. It's built the way the academy teaches, so you can read it, run it, and use it as a base for your own game.

> **Status:** written as teaching code and reviewed by hand, but **not yet run in Studio**. The first time you run it, expect to fix small things. Every fix is good practice, and good training data for your AI (`ai-training/`).

## What's inside

| Feature | File | Lesson |
|---|---|---|
| Session-locked saving, autosave, safe shutdown | `src/server/Services/DataService.luau` | `08-data-and-persistence.md` |
| All remotes in one place, rate limits, argument checks | `src/server/Services/Remotes.luau` | `07-architecture-and-security.md` |
| Enemies as data + snapshots (hundreds on phones) | `src/server/Services/WaveService.luau`, `src/client/Controllers/EnemyRenderer.luau` | `15-performance-and-mobile.md` |
| Server-validated placement, upgrades, "first" targeting, splash | `src/server/Services/TowerService.luau` | `14-tower-defense-blueprint.md` |
| Match state machine, wave rewards, late join | `src/server/Services/MatchService.luau` | `01-foundations/01-programming-for-games.md` |
| Correct `ProcessReceipt`, game pass cache | `src/server/Services/ShopService.luau` | `04-monetization-and-devex.md` |
| Kid-friendly daily reward (days played, no harsh reset) | `src/server/Services/DailyRewardService.luau` | `07-engagement-and-retention/` |
| Onboarding funnel, match funnel, custom and economy events | `src/server/Services/Telemetry.luau` | `09-analytics-and-experiments.md` |
| Phone-first HUD, contextual onboarding hints | `src/client/Controllers/*` | `02-game-design/02-first-five-minutes.md`, `04-art/04-ui-for-kids-on-phones.md` |
| All balance numbers | `src/shared/Config/*` | `02-game-design/03-progression-and-economy.md` |

## Run it

1. Install the tools (see `03-engines/02-tooling.md`): `rokit install` in this folder.
2. In Studio, make a new Baseplate place and add:
   - `Workspace.Map` (Folder)
   - `Workspace.Map.Path` (Folder) with anchored parts named `1`, `2`, `3`, … along the route. At least 2 are needed; 6–10 make a nice path.
   - `Workspace.Map.Placeable` (Folder) with a few flat anchored parts (grass pads) beside the path
3. Game Settings → Security → **Enable Studio Access to API Services** (needed for DataStores).
4. `rojo serve`, then Connect in the Studio Rojo plugin.
5. Press Play. Tap **Archer**, then tap a grass pad.

Optional: put your Blender models in `ReplicatedStorage.Assets.Towers.<Name>` and `ReplicatedStorage.Assets.Enemies.<Name>` (Models with a PrimaryPart). The kit uses them automatically. Otherwise it draws placeholders.

## Before you publish

- [ ] Replace the `0` ids in `Config/Products.luau` with your real product/pass ids
- [ ] Test with 2–4 players (Test → Clients and Servers)
- [ ] Test on a real phone
- [ ] Check Creator Hub → Analytics → Funnels shows the onboarding steps after a test session
- [ ] If you add paid random items (eggs, summons for Robux), follow `05-safety-policy-and-compliance.md`: show odds and gate with `PolicyService`

## Ideas to extend (in order)

1. Ghost preview + range ring while placing
2. Upgrade/sell panel when tapping a tower (`UpgradeTower` is already on the server)
3. 2x speed button (game pass `SpeedUp`)
4. Unit inventory + loadout from `DataService` `units`
5. Summon banner with shown odds and pity (`01-foundations/02-math-for-games.md`)
6. Daily reward button wired to `ClaimDaily`
7. More maps, a boss with a special ability, Infinite mode
