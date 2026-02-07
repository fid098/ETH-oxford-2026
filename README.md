# Oracle

A prediction market platform where users stake reputation points on claims, build public track records, and earn credibility through prediction accuracy.

## Architecture

```
Browser (React + Vite :5173)
    |
    | /api/* proxy
    v
FastAPI Backend (:8000)
    |
    | read/write
    v
data.json (flat file DB)
    |
    | (oracle claims only)
    v
Chainlink Price Feeds (Ethereum mainnet via Web3 RPC)
```

## Tech Stack

- **Backend:** FastAPI, Pydantic, uvicorn
- **Frontend:** React, TypeScript, Vite, recharts, RainbowKit + wagmi
- **Auth:** SIWE (Sign In With Ethereum) via wallet signature
- **Oracle:** Chainlink on-chain price feeds for automated claim resolution
- **Storage:** JSON flat file (`backend/data.json`)

## Data Model

- **Users** - username, display_name, wallet_address, points (start at 1000)
- **Claims** - a yes/no prediction with a category (crypto, ai, policy, tech, science). Status is `active`, `resolved_yes`, or `resolved_no`. Resolution can be `manual` or `oracle` (Chainlink price feed)
- **Positions** - a user's bet on a claim: side (yes/no), stake (points deducted immediately), confidence (50-99%), optional reasoning text

## Development

**Backend:**

1. `cd backend`
2. `python -m venv venv`
3. `venv\Scripts\activate`
4. `pip install -r requirements.txt`
5. `python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`

**Frontend:**

1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Environment Variables

| Variable                        | Purpose                                         | Default                      |
| ------------------------------- | ----------------------------------------------- | ---------------------------- |
| `WEB3_PROVIDER_URL`             | Ethereum mainnet RPC for Chainlink oracle reads | `https://cloudflare-eth.com` |
| `VITE_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID for RainbowKit         | (none)                       |

## API Routes

| Method | Path                             | Purpose                          |
| ------ | -------------------------------- | -------------------------------- |
| GET    | `/api/claims/`                   | List all claims with odds        |
| GET    | `/api/claims/{id}`               | Single claim with odds           |
| POST   | `/api/claims/`                   | Create claim                     |
| DELETE | `/api/claims/{id}?username=`     | Delete empty claim (owner only)  |
| POST   | `/api/claims/{id}/resolve`       | Manual resolve                   |
| GET    | `/api/claims/{id}/oracle-status` | Live oracle price data           |
| POST   | `/api/claims/{id}/check-oracle`  | Trigger oracle resolution check  |
| GET    | `/api/users/`                    | All users with profiles          |
| GET    | `/api/users/{username}`          | Single user with category stats  |
| GET    | `/api/positions/`                | All positions                    |
| POST   | `/api/positions/`                | Create position (deducts points) |
| GET    | `/api/auth/nonce?address=`       | Get SIWE nonce (5-min TTL)       |
| POST   | `/api/auth/connect-wallet`       | Verify SIWE signature            |
| GET    | `/api/health`                    | Health check                     |

## User Flows

**Browse Claims** - Feed page with filtering (all/active/resolved), category dropdown, text search, and sorting (trending/recent/ending). Each claim card shows a mini belief graph sparkline and believer/skeptic user stacks.

**Create a Claim** - Modal form with title, description, category, and resolution type. Oracle claims specify a Chainlink price feed, comparator, target price, and resolution date.

**Take a Position** - On the claim detail page, pick a side (True/False), stake amount, confidence level, and optional reasoning. Points are deducted immediately.

**Claim Resolution** - Manual claims are resolved by posting a resolution. Oracle claims auto-resolve when their Chainlink price condition is met after the resolution date. Losers' stake pool is redistributed to winners proportionally.

**User Profile** - Shows points, accuracy, category breakdown with progress bars, confidence calibration chart (stated confidence vs actual accuracy), created claims list, and active/resolved position history.

**Leaderboard** - Users ranked by prediction accuracy with medals for top 3.

**Wallet Auth** - RainbowKit connect button triggers SIWE flow: request nonce, sign message, verify on backend. New wallet addresses auto-create a user record.

## Notes

- The Vite dev server proxies `/api` to `http://localhost:8000` (see `frontend/vite.config.ts`).
- If port 5173 is in use, Vite will choose the next available port.
- Auth nonces expire after 5 minutes. Stale nonces are pruned on each new request.
- Oracle endpoints return HTTP 502 if the Web3 RPC is unreachable.
- The JSON database has no file locking; not suitable for concurrent production use.
