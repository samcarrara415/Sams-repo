# FOMO Radar

A screener for newly listed and trending DEX tokens on Solana, Base, Ethereum and BNB Chain. It ranks pools by short-term momentum and runs a set of rug-risk checks on the pool data, then links out to contract-audit tools for anything worth a closer look.

It is a single static page (`index.html`, inline CSS and JS) with no build step, backend or API key. Live at https://samcarrara415.github.io/Sams-repo/fomo-tracker/. To run it locally, open the file or serve the folder with any static server.

## Data sources

| Source | Endpoint | Used for |
|---|---|---|
| GeckoTerminal | `GET /api/v2/networks/{network}/new_pools?include=base_token` | Newest pools (page 1, 20 pools) |
| GeckoTerminal | `GET /api/v2/networks/{network}/trending_pools?include=base_token` | Trending pools (page 1, 20 pools) |
| DexScreener | `GET /token-boosts/latest/v1` | Marks tokens with a paid DexScreener boost |

Network ids are `solana`, `base`, `eth` and `bsc`. From each pool the page reads the USD price, liquidity (`reserve_in_usd`), market cap (falling back to FDV when market cap is null or 0, which is common for new tokens), pool creation time, price change over 5m/1h/6h/24h, 24h volume, and buy/sell counts and unique buyers/sellers for the last hour and 24 hours.

Some pools are filtered out before scoring:

- pools with no price or no liquidity figure;
- pools whose base token is SOL, ETH, BNB, a wrapped version of one of those, or a stablecoin. In these "backwards" pairs (for example `USDC / NEWTOKEN`) GeckoTerminal's price and FDV describe the stablecoin, not the new token.

When the same token has more than one pool, only the pool with the most liquidity is shown.

## Scores

### FOMO score (0 to 100)

The sum of four capped parts:

| Part | Max | How it is computed |
|---|---|---|
| Price momentum | 45 | 1h change (+150% earns 28), 5m change (+50% earns 9), 6h change (+300% earns 8). Drops subtract. |
| Buyers | 30 | Up to 18 for unique buyers in 24h on a log scale (2,000 earns 18), plus up to 12 when last-hour buyers exceed the pool's average hourly rate (4 times the average earns 12). For pools younger than 24h the average uses the pool's age. |
| Buy pressure | 15 | Share of buys among last-hour trades above 50% (all buys earns 15). 0 if there were fewer than 5 trades. |
| Turnover | 10 | 24h volume divided by the larger of market cap and liquidity (2 times earns 10). |

### Risk score (0 to 100)

Starts at 100 and subtracts points for each warning:

| Warning | Points |
|---|---|
| Liquidity under $5k (under $20k) | 40 (18) |
| Liquidity under 0.5% of FDV (under 2%) | 25 (10) |
| Pool under 1 hour old (under 12 hours) | 20 (10) |
| 20 or more buys and no sells in 24h (honeypot pattern) | 45 |
| 24h volume over 100 times liquidity (possible wash trading) | 15 |
| Fewer than 20 unique buyers in 24h | 12 |
| Over 75% of 24h trades are sells, with more than 50 trades | 12 |

Pools under one hour old are capped at 60. Scores of 70 and above are shown as lower risk, 45 to 69 as caution, and below 45 as high risk. Each row's details list the warnings that applied and the points they cost, plus the four FOMO score parts.

## Refresh and rate limits

The page refreshes every 60 seconds. Each refresh makes two GeckoTerminal requests per selected chain, so 4 with the default two chains and 8 with all four.

GeckoTerminal's free API documents a limit of 30 requests per minute per IP. In testing (November 2026) it started returning HTTP 429 at about 10 per minute, so the page budgets for that:

- requests are made one at a time, at least 5 seconds apart (bursts got rate limited sooner in testing), and never more than 10 in any rolling 61-second window. With four chains a refresh takes about 35 seconds, and the first chain appears as soon as it arrives;
- only one refresh runs at a time. Turning on a chain fetches just that chain, and data fetched in the last minute is reused;
- after a 429 the page stops the current refresh, keeps showing the last data it has, and waits 1 minute before retrying, doubling the wait up to 5 minutes;
- the timer skips refreshes while the tab is hidden.

GeckoTerminal's 429 responses don't include CORS headers, so the browser reports them as a failed request rather than a 429 (and logs a CORS error in the console). The page treats any failed request as a likely rate limit.

## Limitations

- The risk checks only use pool statistics. They cannot see contract code (mint authority, blacklists, transfer taxes) or whether liquidity is locked. Use the RugCheck (Solana), Honeypot.is and GoPlus (EVM) links in each row's details for that.
- "Buyers" are unique wallets that bought through the pool, as counted by GeckoTerminal. They are not holder counts.
- Only the first page of new and trending pools is loaded per chain, so this is a sample of current activity, not a full market scan.
- If several people share an IP address (an office or VPN), they share GeckoTerminal's rate limit and may see more failed refreshes.

Not financial advice. Most newly launched tokens lose nearly all of their value.
