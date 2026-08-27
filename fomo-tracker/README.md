# 🚀 FOMO Radar

A live, zero-backend meme-coin screener. Open `index.html` in a browser (or serve it via GitHub Pages) — no build step, no API keys.

## What it does

- **Scans fresh + trending DEX pools** on Solana, Base, Ethereum, and BNB Chain every 60 seconds using the free [GeckoTerminal](https://www.geckoterminal.com) public API.
- **Filters for the FOMO profile**: low market cap, price going up rapidly (5m/1h/6h/24h), and lots of unique buyers starting to pile in.
- **FOMO Score (0–100)** blends recent price momentum, unique-buyer growth and acceleration, buy-side pressure, and volume turnover.
- **Rug-risk heuristics** produce a safety score with human-readable flags:
  - thin liquidity, or liquidity tiny relative to market cap
  - brand-new pools (capped at "Caution" — most rugs happen in the first hours)
  - zero sells despite many buys (honeypot pattern)
  - volume wildly above liquidity (wash-trading pattern)
  - very few unique buyers, or sell-dominated flow (dump pattern)
- **Hype badge (⚡)** when the token is running a paid DexScreener boost — marketing signal, not an endorsement.
- **One-click audit links** per coin: DexScreener chart, GeckoTerminal, and RugCheck (Solana) or Honeypot.is + GoPlus (EVM chains) for real contract/LP checks.

## Important limitations

- "Buyers" counts are unique buying wallets reported by the DEX pool — a proxy for holder growth, not an on-chain holder count.
- The safety checks are **heuristics**. They catch obvious red flags but cannot see hidden mint authority, blacklists, or unlocked LP. Always verify with the audit links before touching anything.
- **Not financial advice.** Most meme coins go to zero.

## Data sources

| Source | Endpoint | Used for |
|---|---|---|
| GeckoTerminal | `/networks/{net}/new_pools`, `/networks/{net}/trending_pools` | prices, liquidity, market cap, buyers/sellers, pool age |
| DexScreener | `/token-boosts/latest/v1` | hype badge |

Both are free public APIs with CORS enabled; the app stays within their rate limits at the default 60s refresh.
