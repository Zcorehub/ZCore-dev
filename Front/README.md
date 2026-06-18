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

Runs at `http://localhost:3000` by default (Next.js). The API backend runs separately at `http://localhost:3000` or configure `NEXT_PUBLIC_API_BASE_URL` in `.env.local`.

## Features

- **Register / Login** — Stellar wallet only (no email, no JWT)
- **Credit Overview** — Score (0–850), tier badge, Stellar Base vs Partner Events breakdown
- **Credit History** — Verified events from Trustless Work, Blend Protocol, and Vaquita

## Environment

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | ZCore API base URL (default: `http://localhost:3000`) |
| `NEXT_PUBLIC_STELLAR_NETWORK` | `testnet` or `mainnet` for tx explorer links |

## Stack

Next.js 16 · TypeScript · shadcn/ui · Tailwind CSS
