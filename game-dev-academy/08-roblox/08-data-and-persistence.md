# Data and Persistence: Never Lose a Kid's Pet

> **What you'll learn:** how DataStores work, why naive saving loses and duplicates items, how session locking fixes it, how to handle purchases, leaderboards and cross-server data, and how to change your data format safely as your game updates.

Nothing makes a player quit (and tell their friends) faster than losing progress. Data code is the one part of your game that has to be boringly reliable.

---

## 1. The tools

| Service | What it's for | Notes |
|---|---|---|
| `DataStoreService:GetDataStore` | Player saves, persistent world data | Eventually consistent. Has request budgets and write limits per key. |
| `GetOrderedDataStore` | Leaderboards (sorted numbers) | Integers only; read pages of top values |
| `MemoryStoreService` | Short-lived cross-server data: queues, sorted maps, hash maps | Fast; data expires; for matchmaking, global event state, live leaderboards |
| `MessagingService` | Broadcast messages between servers | Not guaranteed delivery; use for "announce", not for money |
| **Open Cloud** | Read/write DataStores from outside Roblox (tools, support, GDPR deletes) | API keys: keep them secret |

Limits (request budgets per minute, max value size, write cooldown per key, storage quotas) change over time. **Check the current numbers on the DataStore "Error codes and limits" docs page** before designing anything that writes often. Roblox has also introduced storage limits and budgets for DataStores [U]. Design to save on a timer and at key moments, not on every coin.

---

## 2. Why naive saving fails

The naive pattern:
```lua
-- ❌ Don't do this
Players.PlayerAdded:Connect(function(p) data[p] = store:GetAsync(p.UserId) or {} end)
Players.PlayerRemoving:Connect(function(p) store:SetAsync(p.UserId, data[p]) end)
```

What goes wrong:
1. **Server hop race:** the player leaves server A and joins server B. B loads *before* A finishes saving, so B has old data. Later B saves the old data over A's save. **Progress lost.**
2. **Trade duplication:** exploit the same race to trade an item away on A, then keep the stale copy on B. **Item duplicated.**
3. **Failed loads treated as new players:** `GetAsync` errors (Roblox outage), the code uses `{}`, and the save on leave **wipes the real data**.
4. **Shutdown:** the server closes and `PlayerRemoving` saves don't finish.

---

## 3. The fix: session locking + UpdateAsync

The starter kit's `DataService` (`starter-kit/src/server/Services/DataService.luau`) shows the full pattern:

1. **Load with `UpdateAsync`:** if another server's lock is fresh, cancel and retry later. Otherwise write *our* lock `{ jobId, time }` and take the data.
2. **Never treat a failed load as "new player":** retry, then kick politely ("Your save is still syncing, rejoin in a minute"). Never let the player play on default data that would later overwrite the real save.
3. **Save with `UpdateAsync`:** only if the lock is still ours, which refreshes the lock time.
4. **Autosave** every ~2 minutes (lock expiry must be much longer than the autosave interval).
5. **Release the lock** on leave.
6. **`BindToClose`:** save everyone in parallel before shutdown.
7. **Reconcile** new fields from the default template when loading (for update safety).

For bigger games, the community library **ProfileStore** (successor to ProfileService) implements session locking with more features. Using it is a fine choice. Either way, understand the pattern.

---

## 4. Purchases and data

- Grant Developer Products in `MarketplaceService.ProcessReceipt`. Return `PurchaseGranted` **only after the grant is saved**.
- Store recent `PurchaseId`s in the player's data so retried receipts never grant twice.
- If the save fails, undo the in-memory grant and return `NotProcessedYet`. Roblox retries later.
- Only **one** `ProcessReceipt` callback per game. Route all products through it.

See `starter-kit/src/server/Services/ShopService.luau`.

---

## 5. Trading safely

Trading is where duplication exploits live. A safe trade:
1. Both players confirm the **final** offer, checked by the server against both inventories.
2. Lock both players' trading (no other trades or drops during the swap).
3. Verify ownership again **at swap time**.
4. Swap in memory. Save **both** (session-locked).
5. Log the trade (ids, items, time) for support. Never log personal info.
6. Unlock.

Also gate trading of paid random items with `PolicyService` where required (see `05-safety-policy-and-compliance.md`).

---

## 6. Changing your data format (migrations)

Your data shape will change with updates. Keep a `version` field:

```lua
local MIGRATIONS = {
	[1] = function(d) d.units = d.towers; d.towers = nil end,                  -- v1 -> v2: rename
	[2] = function(d) d.stats = d.stats or { matches = 0, wins = 0 } end,       -- v2 -> v3: new table
}
local CURRENT = 3
local function migrate(d)
	while d.version < CURRENT do
		MIGRATIONS[d.version](d)
		d.version += 1
	end
end
```

Rules:
- Migrations only move forward and never delete data you might need.
- Test migrations on a copy of real data (export a few saves with Open Cloud into a test universe).
- Never reuse a field name for a different meaning.

---

## 7. Leaderboards

- **All-time:** `OrderedDataStore` updated at the end of a match (not every second). Read the top 50 with `GetSortedAsync` every few minutes and cache it.
- **Weekly/seasonal:** use a store name with the week in it (`Wins_2026W44`) so each week starts fresh.
- **Live cross-server:** `MemoryStoreService` sorted maps, flushed to DataStores occasionally.

---

## 8. Privacy and deletion

- Store only what the game needs. No real names, ages, emails or chat logs in your DataStores.
- Roblox sends "right to erasure" requests for user data. Have a way to delete a user's keys (Open Cloud script or an admin tool) and act on requests promptly. Check the current process in the Creator Docs.

---

## Exercise

1. Replace your game's saving with the starter kit's `DataService` (or ProfileStore).
2. In Studio with API access on, play, earn coins, leave, rejoin. Confirm they saved.
3. Simulate a failed load (temporarily make `tryLoad` return an error) and confirm the player is kicked instead of getting a blank save.
4. Write one migration that adds a field, and test it on old saved data.

---

## 🤖 Train the Model

**What the model should learn:**
- explain and implement session-locked saving
- idempotent receipts
- safe trades and migrations
- spot data-loss and duplication bugs in code reviews

**Dataset:** `08-roblox/train/data.jsonl`.

**Evals:** `08-roblox/train/data.eval.jsonl`. Good answers:
- use `UpdateAsync` with a lock or recommend ProfileStore
- never default on a failed load
- return `PurchaseGranted` only after saving
- point to the current limits docs instead of inventing limits
