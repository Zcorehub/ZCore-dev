# ZCore DApp

User dashboard for ZCore — portable credit scoring on Stellar.

> Marketing landing page: [Zcore-Landing](https://github.com/Zcorehub/Zcore-Landing)

## Live

**DApp:** [https://dapp-zcore.vercel.app](https://dapp-zcore.vercel.app)

**API:** [https://zcore-api.vercel.app](https://zcore-api.vercel.app)

## Quick start (local)

From the **repo root** (not this folder):

```powershell
npm run setup        # once — creates .env.local automatically
npm run dev:front    # start DApp → http://localhost:3001
```

The API must also be running: `npm run dev:server` (port 3000).

## Environment

Copy `Front/.env.example` → `Front/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_STELLAR_NETWORK=testnet
```

For production builds on Vercel, `NEXT_PUBLIC_API_BASE_URL` is set to `https://zcore-api.vercel.app`.

These defaults work for local development without changes.
