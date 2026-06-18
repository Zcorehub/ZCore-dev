# ZCore DApp

User-facing dashboard for ZCore — portable credit scoring on Stellar.

The marketing landing page lives in a separate repository. This app handles wallet registration, login, score overview, and credit history.

## Setup

```bash
cd Front
npm install
cp .env.example .env.local
npm run dev
```

Runs at `http://localhost:3001`. The API backend runs at `http://localhost:3000` — configure via `NEXT_PUBLIC_API_BASE_URL` in `.env.local` if different.

## Features

- **Stellar Wallet Connect** — Freighter, xBull, and Albedo via `@creit.tech/stellar-wallets-kit`
- **Register / Login** — Connect wallet, then register or sign in with ZCore API
- **Credit Overview** — Score (0–850), tier badge, progress to next tier, Stellar Base vs Partner Events breakdown
- **Credit History** — Verified events from Trustless Work, Blend Protocol, and Vaquita
- **Wallet Profile** — Connected wallet details, copy address, explorer link

## Environment

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | ZCore API base URL (default: `http://localhost:3000`) |
| `NEXT_PUBLIC_STELLAR_NETWORK` | `testnet` or `mainnet` for tx explorer links |

## Stack

Next.js 16 · TypeScript · shadcn/ui · Tailwind CSS
