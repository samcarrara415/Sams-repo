# Monetization and DevEx: Robux to Real Money (as of Oct 2026)

> **What you'll learn**
> - Every way a Roblox game earns in 2026, and what share you keep.
> - The current DevEx rates ($0.0038 standard, $0.0054 for eligible US 18+ spend), with worked Robux→USD examples.
> - Pricing that works for kids, Roblox's pricing tools, and the rules that get games punished.

Tags: **[P]** Roblox said it · **[S]** reputable press/analyst · **[U]** unverified/community · **Calc** = our maths from tagged numbers · **Lesson** = our guidance.

---

## 1. The money chain in one picture

```
Player pays ~$0.01 per Robux (average selling price, FY2025) [P]
   │  (Apple/Google take up to 30% of that from Roblox, not from you) [P]
   ▼
Player spends 100 Robux on your Game Pass
   │  Roblox marketplace fee 30% → you earn 70 Robux [S]
   ▼
You cash out via DevEx at $0.0038/Robux → 70 × 0.0038 = $0.266  [P rate]
   │  (or $0.0054 on eligible US 18+ spend → $0.378)
   ▼
You get ≈ 26.6% of what the player paid (≈ 37.8% on eligible US 18+ spend)   [Calc]
```

Sources: average Robux price and app-store fee [P] [FY2025 10-K][10k-25]. DevEx rates [P] [DevEx docs][devex]. The 70% share on passes/dev products is long-standing and widely documented [S]. We couldn't find it stated on a 2026 docs page, so check your **Creator Hub → Transactions**. Subscriptions docs do state **70%** for Robux-priced subscriptions [P] [Subscriptions docs][subs]. The 26.6% → 37.8% figures match third-party reporting on the 42% DevEx increase [S] [NetInfluencer][netinf].

**Platform-level reality checks:**

| Metric | Number | Tag |
|---|---|---|
| DevEx paid as % of bookings, 2025 | ~22% | Calc: $1,503M ÷ $6,788M [P] [Q4'25][q4-25] |
| DevEx paid per hour played, 2025 | ~$0.012 | Calc: $1,503M ÷ 123.9B h [P] [q4-25], [10k-25] |
| Average daily bookings per DAU, 2025 | $0.15 | [P] [10k-25] |
| Daily paying users / DAU, 2025 | ~1.4% | Calc: 1.8M ÷ 127M [P] [10k-25] |
| Bookings per daily paying user, 2025 | $10.36 | [P] [10k-25] |

---

## 2. Every way to earn (2026)

| Method | What it is | Your share / payout | Key rules | Tag |
|---|---|---|---|---|
| **Game Passes** | One-time unlock | 70% of Robux | Regional pricing **on by default** since Mar 30, 2026 | [S] share; [P] [regional default][regional] |
| **Developer Products** | Buy many times (gems, revives, crates) | 70% of Robux | Must grant via `ProcessReceipt`. 1 to 1B Robux. | [S] share; [P] [devprod] |
| **Subscriptions (Robux)** | Monthly, ≥49 Robux | **70%** every month (500 R$ sub → 350 R$/mo). ~5-day hold. | Regional pricing on, can't disable. Same benefits on all platforms. | [P] [subs] |
| **Subscriptions (local currency)** | $2.99 / 4.99 / 7.99 / 9.99 / 14.99 | **70% first month, 100% after** (in Robux). 30-day hold. | Needs ID/phone-verified creator. Not sold in AR, CN, CO, IN, ID, JP, RU, TW, TR, AE, UA, VN. | [P] [subs] |
| **Private servers** | Monthly Robux fee (or free) | Plus subscribers get them free. You earn up to **100 R$** per Plus sub with 60+ min over 30 days (top 5 servers). | Not in Managed Pricing; auto-regionalised | [P] [managed]; [S] [tubefilter] |
| **Paid access** | Pay to enter (Robux or local currency) | — (not stated in docs) | Eligible for Creator Rewards | [P] [monet] |
| **Creator Rewards: Daily Engagement** | Replaced Premium Payouts on **Jul 24, 2025** | **5 R$/day** per "Active Spender" (spent ≥$9.99 in 60 days) who plays your game 10+ min, if you're among their first 3 games that day | Automatic. 60-day hold. | [P] [creator-rewards], [deprecated] |
| **Creator Rewards: Audience Expansion** | Bring new or returning users | **35%** of their first **$100** of qualifying purchases anywhere on Roblox, over 60 days | ID-verified. Game must average **100+ DAU** for 60 days after the join. | [P] [creator-rewards] |
| **Roblox Plus sign-up bonus** | Plus ($4.99/mo) replaced Premium for new sign-ups on **Apr 30, 2026** | **250 R$/mo** per new subscriber via `PromptRobloxSubscriptionPurchase`, capped at **750 R$** per subscriber | Trials don't count. Roblox pays subscriber discounts, so your per-item earnings don't drop. | [S] [tubefilter], [games.gg][gamesgg] |
| **Immersive ads** | Billboards (image/video) + portals in your world | Per impression / 15-s view / portal teleport. Paid on the 25th of the next month. | Public game, **2,000+ unique monthly visitors**, owner 13+ with ID + 2FA, questionnaire approved. Hide for ineligible users via `AreAdsAllowed`. | [P] [immersive] |
| **Rewarded video ads** | Player opts in to watch for a reward | eCPM-based. **Exact payout not published** (we couldn't verify) | **Roblox-native only** since **May 4, 2026**. **No rewarded ads for under-13s.** | [P] [ad-policy]; payout [U] |
| **Avatar items (UGC)** | Clothing/accessories you sell | Marketplace: **30%** base, rising to **70%** at 6× the price floor. In your game: you get **40%** as game owner (+30% if you also made it). | 80 R$ upload fee. Refundable publishing advance. 30-day escrow. | [P] [fees] |
| **Commerce (physical goods)** | Shopify merch inside your game | Revenue split **not stated** in docs | Creator 18+, ID + 2FA. Buyers **US only**, 13+ (**18+ in Texas**). | [P] [commerce] |
| **Creator Store (plugins/models)** | Sell tools to devs | Only taxes + payment fees deducted. Min $4.99 plugins / $2.99 models. | 30-day escrow | [P] [monet] |
| **Premium Payouts** | — | **Deprecated Jul 24, 2025** | Replaced by Creator Rewards | [P] [deprecated] |

**Q2 2026 note:** Roblox **disabled the sale of cross-experience game passes** (selling one game's pass from another). Roblox says this hurt monetization a little [P] [Q2'26][q2-26].

---

## 3. DevEx: turning Robux into money

| Item | Detail | Tag |
|---|---|---|
| Standard rate | **$0.0038 per earned Robux** = **$114 per 30,000** | [P] [devex] |
| Before Sep 5, 2025 | $0.0035. Robux earned before then still cash out at $0.0035, and **old-rate Robux cash out first**. | [P] [devex] |
| US 18+ enhanced rate | **$0.0054** (+42%), from **Jun 8, 2026** | [P] [devex], [devex-42] |
| What qualifies for $0.0054 | Dev products, passes, subscriptions, private servers bought by **US players verified 18+** (face estimation or ID), in **eligible games** (R15 avatars required) | [P] [devex-42] |
| Minimum to cash out | **30,000 earned Robux** | [P] [devex] |
| Eligibility | 13+, verified email, DevEx portal (Tipalti), W-9/W-8 tax form, in good standing. The current docs list **no Premium/Plus requirement**. | [P] [devex] |
| Frequency / timing | Once per calendar month. ~10 business days first time, ~5 after. | [P] [devex] |
| Purchased Robux | **Cannot** be cashed out. Only *earned* Robux. | [P] [devex], [10k-25] |
| Roblox Wallet | Daily cash payouts for eligible **US 18+ independent creators**, "later in 2026". Roblox Card in 2027. | [P] [RDC 2026][rdc26] |

**Older guides say "you need Premium for DevEx".** The 2026 DevEx page doesn't list that requirement. Third-party pages still repeat it [U]. Trust the official page and re-check before your first cash-out.

### Robux → USD quick table (standard rate, Calc)

| Earned Robux | At $0.0038 | At $0.0054 (eligible US 18+ spend) | At old $0.0035 |
|---|---|---|---|
| 30,000 (minimum) | **$114** | $162 | $105 |
| 100,000 | $380 | $540 | $350 |
| 250,000 | $950 | $1,350 | $875 |
| 1,000,000 | $3,800 | $5,400 | $3,500 |

---

## 4. How much does a game earn per player?

**Roblox does not publish per-game ARPDAU benchmarks.** Anything you read like "Roblox games make $X per DAU" is **[U]** unless it names the game and source. What we *do* know:

| Clue | Number | Tag |
|---|---|---|
| Whole-platform bookings per DAU per day | $0.15 (2025) | [P] [10k-25] |
| Whole-platform DevEx per hour played | ~$0.012 (2025) | Calc |
| Games eligible for Earnings ad campaigns | **ARPU ≥ 6 Robux** in H1 2026. The post doesn't define the ARPU period. | [P] [ads-rdc26] |
| Roblox's 2026 shift | Engagement moved to games "with lower hourly monetization". Younger US/Canada cohorts spend less per hour. | [P] [q2-26] |
| US 18+ vs under-18 | US 18+ monetizes **50%+ higher** | [P] [q2-26] |

### Worked scenarios (hypothetical: plug in your own numbers)

Assumption: **earned Robux per DAU per day** (your net share after the 30% fee). The values below are made up to show the maths; they are **not** benchmarks.

| DAU | Earned R$/DAU/day (assumed) | Earned R$/month (×30) | USD/month at $0.0038 |
|---|---|---|---|
| 500 | 1 | 15,000 | $57 (can't cash out yet: under 30k) |
| 1,000 | 1 | 30,000 | $114 |
| 1,000 | 3 | 90,000 | $342 |
| 5,000 | 3 | 450,000 | $1,710 |
| 5,000 | 6 | 900,000 | $3,420 |

**Add Creator Rewards (Calc):** if 200 Active Spenders a day play your game 10+ min as one of their first 3 games → 200 × 5 = 1,000 R$/day ≈ 30,000 R$/month ≈ **$114/month**.

**Find your real numbers:** Creator Hub → Monetization dashboards (ARPDAU, payer conversion, ARPPU, revenue by product). Use 28-day windows, since RFY uses 28 days too.

---

## 5. Pricing tools: let Roblox test for you

| Tool | What it does | Results Roblox published | Tag |
|---|---|---|---|
| **Regional pricing** (passes: default-on since **Mar 30, 2026**; dev products: opt-in) | Lowers prices in lower-income regions from your default price. VPN users see the highest price. | Top 2,500 games, 2025: **+4–10% Robux spend**, **+1–6% players/playtime**, **+43–52% pass purchases** in discounted regions | [P] [regional], [managed] |
| **Price optimization** | Tests price points per item | **+4%** earnings on average. Slap Battles **+15%**. | [P] [managed] |
| **Managed Pricing** (launched **Jun 15, 2026**) | Merges both. Auto-tests at least every 90 days (~3 weeks each). Applies a new price **only if total revenue goes up**. | — | [P] [managed] |

**Gotchas** [P] [managed]:
- Hard-coded prices in your UI break it. Read prices with `MarketplaceService:GetProductInfo` and show what the player will actually pay.
- Price-optimised passes must run purchase scripts **client-side** so players see personalised prices [P] [passes].
- No "price linking": if two items must match, opt one out.
- For gifting/trading, compare price levels with `GetUsersPriceLevelsAsync`.

---

## 6. Pricing for kid audiences (Lesson + rules)

Rules first [P]:
- **Promoted passes** on the Buy Robux page must be **50–800 Robux** (">49 and <801") and can't grant paid random items [P] [passes].
- Subscriptions: **≥49 Robux** if priced in Robux [P] [subs].
- Parents can set **monthly spend caps** for under-13s and get high-spend alerts ($100/$250/$500 by default) [P] [Parental controls][parents].
- Texas law requires **parental consent for minors' digital purchases** (enacted 2024) [P] [10-K risk factors][10k-25].

Suggested TD price ladder (**Lesson, not data.** Let Managed Pricing test it):

| Item | Suggested Robux | Why |
|---|---|---|
| Small convenience (2× speed, extra loadout slot) | 25–99 | Impulse-sized for pocket-money Robux |
| Cosmetic tower skin | 49–199 | Pure fun, zero pay-to-win |
| "Supporter" pass (badge, chat tag, small daily bonus) | 99–249 | Lets fans give back |
| VIP server / private match | Use Roblox private servers (free for Plus subs) | You still earn Plus private-server rewards |
| Monthly subscription (daily currency + cosmetic) | 149–499 R$ or $2.99–4.99 | 70%/mo. Must give the same benefits everywhere. |
| Premium tower (strong but **earnable** by play) | 199–499 | Paying = shortcut, not exclusive power |
| Big bundles | 799+ | Only for confirmed whales. Keep below parent alert levels for kids. |

**Ethics (repo rule):** no hidden odds, fake timers, fake discounts, pay-to-win walls or guilt popups. Kids notice them and leave, and many are illegal or against Roblox rules. See `07-engagement-and-retention/03-ethics-and-law-for-kids-games.md`.

---

## 7. What Roblox bans or requires (money edition)

| Rule | Detail | Tag |
|---|---|---|
| **Paid random items must show odds** | All outcomes with **numerical odds, before purchase**, as percentages totalling **100%**. A pop-up is OK, but it needs a **descriptive word** (a lone (i) icon isn't enough). Live-update odds when outcomes can only be won once. Explain luck boosts numerically. | [P] [pri] |
| Counts as paid random | Crates, eggs, spins, random-duration potions, upgrade chances, combine/fuse, luck boosts, pity systems, **and keys/tickets/rerolls bought with Robux or Robux-bought currency** | [P] [pri] |
| **Every outcome must give a benefit** | No "nothing" results | [P] [Community Standards][cs] |
| **Restricted regions/users** | Check `PolicyService:GetPolicyInfoForPlayerAsync().ArePaidRandomItemsRestricted`. If true: earnable path, fixed order disclosed up front, direct purchase at expected value, hide, block, or keep the user out of those areas. | [P] [pri] |
| **Trading paid items** | Gate with `IsPaidItemTradingAllowed` | [P] [pri], [cs] |
| **No gambling** | No real money, Robux or valuable items in gambling. No independent contests with Robux/real prizes. | [P] [cs] |
| **No off-platform sales or fee dodging** | Can't sell on-platform items off-platform or circumvent Roblox payments | [P] [cs] |
| **Subscription honesty** | Same benefits on all platforms. Can't revoke silently. No extra tasks after payment. Can't push buying on another platform. | [P] [subs] |
| **Ads** | Rewarded ads **banned for under-13s**. No personalised ads for **under-18s**. Third-party ad SDKs banned. Paid brand integrations must be registered 5 business days ahead. | [P] [ad-policy], [cs] |
| **Grant what was paid for** | `ProcessReceipt` must return `PurchaseGranted` only after granting | [P] [devprod] |
| **Metadata** | No "free Robux" bait. Giveaway-style titles lose exposure. | [P] [disc] |

### Code: odds that always add to 100%

```lua
-- ReplicatedStorage/CrateOdds.lua
-- Show this table BEFORE purchase. Label the button "Odds", not just (i).
local CrateOdds = {}

CrateOdds.Weights = {
	{ name = "Common Archer Skin",   weight = 600 },
	{ name = "Rare Frost Cannon Skin", weight = 300 },
	{ name = "Epic Laser Tower Skin",  weight = 90 },
	{ name = "Legendary Dragon Skin",  weight = 10 },
}

-- Returns { {name=..., percent="60%"}, ... } and whether rounding needs a disclaimer
function CrateOdds.percentages()
	local total = 0
	for _, entry in CrateOdds.Weights do
		total += entry.weight
	end
	local rows, needsDisclaimer = {}, false
	for _, entry in CrateOdds.Weights do
		local pct = entry.weight / total * 100
		-- %.5g keeps 4+ digits after the first non-zero digit, so tiny odds (0.0012%) never show as 0.00%
		local shown = string.format("%.5g", pct)
		if tonumber(shown) ~= pct then
			needsDisclaimer = true -- Roblox requires a "rounded, may not total 100%" note
		end
		table.insert(rows, { name = entry.name, percent = shown .. "%" })
	end
	return rows, needsDisclaimer
end

return CrateOdds
```

### Code: safe developer-product receipts (no lost or double grants)

```lua
-- ServerScriptService/Receipts.server.lua
local MarketplaceService = game:GetService("MarketplaceService")
local DataStoreService = game:GetService("DataStoreService")
local Players = game:GetService("Players")

local purchaseHistory = DataStoreService:GetDataStore("PurchaseHistory_v1")

local handlers: { [number]: (Player) -> boolean } = {
	[1234567] = function(player) -- 100 Gems (replace with your product id)
		local gems = player:FindFirstChild("leaderstats") and player.leaderstats:FindFirstChild("Gems")
		if not gems then return false end
		gems.Value += 100
		return true
	end,
}

MarketplaceService.ProcessReceipt = function(receiptInfo)
	local key = receiptInfo.PlayerId .. "_" .. receiptInfo.PurchaseId

	local ok, recorded = pcall(function()
		return purchaseHistory:UpdateAsync(key, function(alreadyGranted)
			if alreadyGranted then
				return true -- already handled on an earlier call
			end
			local player = Players:GetPlayerByUserId(receiptInfo.PlayerId)
			local handler = handlers[receiptInfo.ProductId]
			if not player or not handler then
				return nil -- cancel write; Roblox retries later
			end
			local granted, result = pcall(handler, player)
			if not granted or not result then
				return nil
			end
			return true
		end)
	end)

	if ok and recorded then
		return Enum.ProductPurchaseDecision.PurchaseGranted
	end
	return Enum.ProductPurchaseDecision.NotProcessedYet
end
```

Caveat: `UpdateAsync` can run its function more than once. Production games usually save the receipt id **inside the player's profile data** and grant within the same save, e.g., with a session-locking profile module. Treat this as a starting point.

---

## Exercise (one sitting)

1. List every product in your TD game: type, price, and whether it's random.
2. For each random one, add an **"Odds"** button using `CrateOdds.percentages()` and a `PolicyService` check.
3. Turn on Managed Pricing for passes and dev products **without** gifting/trading risks. Replace hard-coded prices in your UI with `GetProductInfo`.
4. Convert last month's earned Robux to USD at $0.0038. Write it next to your DAU to get your own earned-Robux-per-DAU-per-day.

---

## Sources

[10k-25]: https://www.sec.gov/Archives/edgar/data/1315098/000131509826000024/rblx-20251231.htm
[q4-25]: https://www.sec.gov/Archives/edgar/data/1315098/000131509826000009/ex991-q42025shareholder.htm
[q2-26]: https://www.sec.gov/Archives/edgar/data/0001315098/000162828026051059/ex991-robloxq22026earnin.htm
[devex]: https://create.roblox.com/docs/production/monetization/developer-exchange
[devex-42]: https://about.roblox.com/newsroom/2026/04/roblox-fuels-high-fidelity-games-over-18-players-increases-qualifying-devex-rate-42
[netinf]: https://www.netinfluencer.com/roblox-to-raise-developer-exchange-rate-for-games-aimed-at-18-plus-players-as-adult-cohort-surges/
[subs]: https://create.roblox.com/docs/production/monetization/subscriptions
[devprod]: https://create.roblox.com/docs/production/monetization/developer-products
[passes]: https://create.roblox.com/docs/production/monetization/game-passes
[monet]: https://create.roblox.com/docs/production/monetization
[regional]: https://devforum.roblox.com/t/enabling-regional-prices-for-all-passes-to-grow-your-global-audience/4471199
[managed]: https://devforum.roblox.com/t/managed-pricing-one-system-for-better-pricing-and-earnings-growth/4684738
[creator-rewards]: https://create.roblox.com/docs/creator-rewards
[deprecated]: https://create.roblox.com/docs/production/monetization/engagement-based-payouts
[tubefilter]: https://www.tubefilter.com/2026/04/13/roblox-plus-creator-payouts/
[gamesgg]: https://games.gg/news/roblox-plus-subscription-replaces-premium/
[immersive]: https://create.roblox.com/docs/production/monetization/immersive-ads
[ad-policy]: https://devforum.roblox.com/t/new-advertising-policies-standards/4527365
[ads-rdc26]: https://devforum.roblox.com/t/ads-manager-rdc-recap-earnings-roas-reporting-incrementality/4909790
[fees]: https://create.roblox.com/docs/marketplace/marketplace-fees-and-commissions
[commerce]: https://create.roblox.com/docs/production/monetization/commerce-products
[rdc26]: https://about.roblox.com/newsroom/2026/09/rdc-2026-the-world-needs-more-play
[parents]: https://about.roblox.com/parental-controls
[pri]: https://create.roblox.com/docs/production/monetization/paid-random-items
[cs]: https://about.roblox.com/community-standards
[disc]: https://create.roblox.com/docs/discovery

- SEC: FY2025 10-K [link][10k-25]; Q4 2025 letter [link][q4-25]; Q2 2026 letter [link][q2-26]
- Creator Docs: DevEx [link][devex], Subscriptions [link][subs], Developer products [link][devprod], Passes [link][passes], Monetization overview [link][monet], Creator Rewards [link][creator-rewards], Engagement payouts (deprecated) [link][deprecated], Immersive ads [link][immersive], Marketplace fees [link][fees], Commerce [link][commerce], Paid random items [link][pri], Discovery [link][disc]
- Roblox newsroom: 42% DevEx increase (Apr 30, 2026) [link][devex-42]; RDC 2026 (Sep 11, 2026) [link][rdc26]; Parental controls [link][parents]; Community Standards [link][cs]
- DevForum: Regional pricing default (Mar 5, 2026) [link][regional]; Managed Pricing (Jun 15, 2026) [link][managed]; Advertising policies (Mar 20, 2026, updated Jun 17) [link][ad-policy]; Ads Manager RDC recap (Oct 2, 2026) [link][ads-rdc26]
- Press: Tubefilter on Roblox Plus (Apr 13, 2026) [link][tubefilter]; games.gg [link][gamesgg]; NetInfluencer on DevEx 18+ [link][netinf]

---

## 🤖 Train the Model

**What the model should learn:** do Roblox money maths correctly and honestly. That means:
- Robux → USD at the right DevEx rate, including old-rate ordering and the US 18+ rate,
- creator share by product type,
- 2026 programs (Creator Rewards, Roblox Plus, Managed Pricing),
- legal/ethical limits (odds disclosure, PolicyService, no rewarded ads under 13).

It must never invent per-game ARPDAU benchmarks. It should give working, safe Luau for receipts and odds.

**Dataset:** `08-roblox/train/monetization.jsonl` (convert Robux, price a pass ladder, critique a crate, fix a ProcessReceipt bug, explain Creator Rewards).

**How to check it:** `08-roblox/train/monetization.eval.jsonl`. A good answer:
- uses $0.0038 (and $0.0054 only for eligible US 18+ spend),
- states 30,000 Robux minimum,
- requires odds before purchase summing to 100%,
- says Premium Payouts were replaced by Creator Rewards (Jul 24, 2025),
- labels hypotheticals as hypotheticals.
