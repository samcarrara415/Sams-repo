--!strict
-- Robux purchases done safely.
--
-- ProcessReceipt rules (from the Roblox docs):
--  * Return PurchaseGranted ONLY after the item is granted AND saved.
--  * Return NotProcessedYet if anything fails; Roblox will call again later.
--  * The same receipt can arrive more than once, so remember PurchaseIds and never grant twice.
--  * Only one ProcessReceipt callback may exist in the whole game.

local MarketplaceService = game:GetService("MarketplaceService")
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Products = require(ReplicatedStorage.Shared.Config.Products)
local DataService = require(script.Parent.DataService)
local Telemetry = require(script.Parent.Telemetry)

local MAX_REMEMBERED_PURCHASES = 100

local ShopService = {}

local function alreadyGranted(purchases: { string }, purchaseId: string): boolean
	return table.find(purchases, purchaseId) ~= nil
end

local function processReceipt(receipt): Enum.ProductPurchaseDecision
	local player = Players:GetPlayerByUserId(receipt.PlayerId)
	if not player then
		return Enum.ProductPurchaseDecision.NotProcessedYet -- they left; Roblox retries next time
	end
	local data = DataService.waitFor(player, 15)
	if not data then
		return Enum.ProductPurchaseDecision.NotProcessedYet
	end

	local purchaseId = tostring(receipt.PurchaseId)
	if alreadyGranted(data.purchases, purchaseId) then
		return Enum.ProductPurchaseDecision.PurchaseGranted
	end

	local product = Products.DevProducts[receipt.ProductId]
	if not product then
		warn(`[Shop] unknown product {receipt.ProductId}`)
		return Enum.ProductPurchaseDecision.NotProcessedYet
	end

	-- Grant
	local gems = product.grant.gems or 0
	data.gems += gems
	table.insert(data.purchases, purchaseId)
	if #data.purchases > MAX_REMEMBERED_PURCHASES then
		table.remove(data.purchases, 1)
	end

	-- Save before telling Roblox it's done. If the save fails, undo and retry later.
	if not DataService.saveNow(player) then
		data.gems -= gems
		table.remove(data.purchases, table.find(data.purchases, purchaseId) :: number)
		return Enum.ProductPurchaseDecision.NotProcessedYet
	end

	Telemetry.economy(player, true, "Gems", gems, data.gems, Enum.AnalyticsEconomyTransactionType.IAP, product.name)
	return Enum.ProductPurchaseDecision.PurchaseGranted
end

-- Game passes: cache ownership per player; refresh when they buy in-game.
local passCache: { [Player]: { [number]: boolean } } = {}

function ShopService.ownsPass(player: Player, passId: number): boolean
	local cache = passCache[player]
	if not cache then
		cache = {}
		passCache[player] = cache
	end
	if cache[passId] == nil then
		local ok, owns = pcall(MarketplaceService.UserOwnsGamePassAsync, MarketplaceService, player.UserId, passId)
		if not ok then
			return false -- don't cache failures; try again next time
		end
		cache[passId] = owns
	end
	return cache[passId]
end

function ShopService.start()
	MarketplaceService.ProcessReceipt = processReceipt

	MarketplaceService.PromptGamePassPurchaseFinished:Connect(function(player, passId, purchased)
		if purchased then
			passCache[player] = passCache[player] or {}
			passCache[player][passId] = true
		end
	end)

	Players.PlayerRemoving:Connect(function(player)
		passCache[player] = nil
	end)
end

return ShopService
