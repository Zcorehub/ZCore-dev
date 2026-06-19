# ZCore

[![CI](https://github.com/Zcorehub/ZCore-dev/actions/workflows/ci.yml/badge.svg)](https://github.com/Zcorehub/ZCore-dev/actions/workflows/ci.yml)

**Portable credit scoring infrastructure for Stellar DeFi.**

ZCore is the credit layer that converts verified on-chain payment events — from escrows, tandas, and DeFi loans — into a portable credit score that any lending protocol on Stellar can query.

> "ZCore is the FICO Score for DeFi: built from verified behavior, not wallet activity."

---

## Live

| Service | URL |
|---|---|
| **DApp** | [dapp-zcore.vercel.app](https://dapp-zcore.vercel.app) |
| **API** | [zcore-api.vercel.app](https://zcore-api.vercel.app) |
| **API docs** | [zcore-api.vercel.app/api-docs](https://zcore-api.vercel.app/api-docs) |
| **Landing** | [zcore-landing.vercel.app](https://zcore-landing.vercel.app) |

### Deploy security

- **Never commit** `.env` / `.env.local` — they are in `.gitignore` and `.vercelignore`.
- **Front (dapp-zcore):** only `NEXT_PUBLIC_*` vars belong in Vercel (they are public in the browser bundle).
- **API (zcore-api):** set `DATABASE_URL`, `ADMIN_SECRET`, `STELLAR_NETWORK` via `vercel env add` in the Vercel dashboard — **do not** deploy with a local `.env` file in the upload.
- After the first API deploy, a local `.env` was accidentally included; that deployment was replaced. Production `ADMIN_SECRET` was rotated in Vercel. If you reused `dev_admin_secret_local` elsewhere, change it.

---

## What ZCore does

Partner platforms (Trustless Work, Blend Protocol, Vaquita) call `POST /api/events/report` whenever a user completes a credit-relevant payment. ZCore verifies the transaction on Stellar Horizon, calculates the score impact, and stores an immutable credit event. Lenders query `GET /api/user/{wallet}/score` to get the score and offer better conditions to creditworthy users.

```
PARTNER PLATFORMS          ZCORE CORE              LENDERS
─────────────────          ──────────              ───────
Trustless Work  ──────►  verify txHash       ──►  GET /score
Blend Protocol  ──────►  calculate impact    ──►  offer better rates
Vaquita         ──────►  update score        ──►  reduce collateral
```

ZCore does not lend money, custody funds, or decide whether to approve a loan. It answers one question: **"Has this person been reliable with money on Stellar?"**

---

## Score system (v2)

```
Score (0–850) = Stellar Base (0–150) + Verified Events (0–700)
```

| Component | Max points | Source |
|---|---|---|
| Wallet age | 40 | Stellar Horizon |
| Transaction activity | 60 | Stellar Horizon |
| Success rate | 30 | Stellar Horizon |
| XLM balance | 20 | Stellar Horizon |
| Escrow completed | 60/event | Trustless Work |
| Loan repaid | 80/event | Blend Protocol |
| Tanda round paid | 30/event | Vaquita |
| Tanda cycle completed | 100/event | Vaquita |

### Tiers

| Tier | Score | Typical limit | Typical rate |
|---|---|---|---|
| A | 600–850 | $10,000+ | 8–12% |
| B | 350–599 | $2,000–$10,000 | 12–18% |
| C | 100–349 | $200–$2,000 | 18–25% |
| REJECTED | 0–99 | No access | — |

### Anti-Sybil

- Every event requires a Stellar `txHash` — real capital must move on-chain.
- `txHash` is unique in the DB — the same payment cannot be counted twice.
- Repeated interactions with the same counterparty have diminishing returns (decay: 100% → 70% → 40% → 10%).

---

## API

### Partner events (called by platforms)

```
POST /api/events/report
```

```json
{
  "apiKey": "trustless_work_abc123...",
  "eventType": "escrow_completed",
  "walletAddress": "GAYR3DY...",
  "amount": 500,
  "currency": "USDC",
  "txHash": "stellar_tx_hash_here",
  "counterpartyWallet": "GDEFG...",
  "timestamp": "2026-06-17T10:00:00Z"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "eventId": "evt_uuid",
    "scoreImpact": 22,
    "newScore": 187,
    "newTier": "C",
    "verified": true
  }
}
```

### Score query (called by lenders)

```
GET /api/user/{wallet}/score
```

```json
{
  "success": true,
  "data": {
    "walletAddress": "GAYR3DY...",
    "score": 387,
    "tier": "B",
    "breakdown": {
      "stellarBase": 67,
      "eventsScore": 320,
      "totalEvents": 8,
      "platforms": ["trustless-work", "blend-protocol"]
    },
    "lastUpdated": "2026-06-15T08:22:00Z"
  }
}
```

### All endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register user by Stellar wallet |
| `POST` | `/api/auth/login` | Login (wallet-based, returns score) |
| `POST` | `/api/events/report` | Report credit event (partner platforms) |
| `GET` | `/api/user/{wallet}/score` | Full score with breakdown (lenders) |
| `GET` | `/api/user/{wallet}/history` | Credit event history (users) |
| `GET` | `/api/user/{wallet}/profile` | User profile and tier |
| `POST` | `/api/user/request` | Request scoring evaluation |
| `POST` | `/api/lender/profiles` | Configure lender risk profiles |
| `POST` | `/api/payment/report` | Report payment or default |
| `POST` | `/api/platforms/register` | Register partner platform (admin) |
| `GET` | `/api-docs` | Swagger UI |

---

## Local setup

ZCore runs as **two services**: the API (`Server/`, port 3000) and the DApp (`Front/`, port 3001).  
The marketing landing page is a separate repo: [Zcore-Landing](https://github.com/Zcorehub/Zcore-Landing).

### Inicio rápido (español)

1. Instala **Node.js 20+** y **Docker Desktop** (debe estar abierto y en ejecución).
2. Clona el repo y, desde la raíz, ejecuta el setup:

   ```powershell
   # Windows
   npm run setup
   ```

   ```bash
   # macOS / Linux
   npm run setup:unix
   ```

3. Abre **dos terminales** y levanta los servicios:

   ```bash
   npm run dev:server   # API  → http://localhost:3000
   npm run dev:front    # DApp → http://localhost:3001
   ```

4. Instala [Freighter](https://freighter.app) en **Testnet**, crea una wallet en [Stellar Laboratory](https://laboratory.stellar.org) y regístrate en [dapp-zcore.vercel.app/register](https://dapp-zcore.vercel.app/register) (producción) o http://localhost:3001/register (local).

Los archivos de entorno se generan solos desde los ejemplos:

| Archivo origen | Se copia a |
|---|---|
| `Server/.env.example` | `Server/.env` |
| `Front/.env.example` | `Front/.env.local` |

Si Docker no estaba corriendo durante el setup, arráncalo y ejecuta:

```bash
npm run db:up && npm run prisma:migrate && npm run prisma:seed
```

---

### Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | 20+ | `node --version` |
| Docker Desktop | any | MySQL runs in a container — no local MySQL install needed |
| Freighter | browser ext. | [freighter.app](https://freighter.app) — wallet for testnet |

> **Important:** Docker Desktop must be **running** before setup.

---

### Quick start (recommended)

From the repo root:

```powershell
npm run setup
```

This automatically:
1. Copies `Server/.env.example` → `Server/.env`
2. Copies `Front/.env.example` → `Front/.env.local`
3. Starts MySQL via Docker
4. Installs dependencies (Server + Front)
5. Runs Prisma migrations and seeds dev platform API keys

Then open **two terminals**:

```powershell
# Terminal 1 — API
npm run dev:server

# Terminal 2 — DApp
npm run dev:front
```

| URL | What |
|---|---|
| [dapp-zcore.vercel.app](https://dapp-zcore.vercel.app) | **DApp (production)** — register, login, dashboard |
| http://localhost:3001 | **DApp (local)** |
| [zcore-api.vercel.app/api-docs](https://zcore-api.vercel.app/api-docs) | Swagger API docs (production) |
| http://localhost:3000/api-docs | Swagger API docs (local) |
| [zcore-api.vercel.app/health](https://zcore-api.vercel.app/health) | Health check (production) |
| http://localhost:3000/health | Health check (local) |

---

### First use — register your wallet

1. Install [Freighter](https://freighter.app) and switch to **Testnet**
2. Create a testnet wallet at [Stellar Laboratory](https://laboratory.stellar.org)
3. Open [dapp-zcore.vercel.app/register](https://dapp-zcore.vercel.app/register) (or http://localhost:3001/register locally)
4. **Connect Stellar Wallet** → Freighter → sign the message (free, no XLM fee)
5. Dashboard shows your Stellar Base score

---

### Environment files

Copy the examples (done automatically by `npm run setup`):

```powershell
copy Server\.env.example Server\.env
copy Front\.env.example Front\.env.local
```

#### `Server/.env`

| Variable | Default (dev) | Description |
|---|---|---|
| `DATABASE_URL` | `mysql://root:zcore_dev@localhost:3306/zcore` | MySQL (matches `docker-compose.yml`) |
| `ADMIN_SECRET` | `dev_admin_secret_local` | Key for `POST /api/platforms/register` |
| `STELLAR_NETWORK` | `testnet` | `testnet` or `mainnet` |
| `PORT` | `3000` | API port |

#### `Front/.env.local`

| Variable | Default (dev) | Description |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:3000` | Backend API URL |
| `NEXT_PUBLIC_STELLAR_NETWORK` | `testnet` | Network for explorer links |

See `Server/.env.example` and `Front/.env.example` for optional Soroban variables.

---

### Dev platform API keys (from seed)

| Platform | API Key |
|---|---|
| Trustless Work | `dev_tw_key_local` |
| Blend Protocol | `dev_blend_key_local` |
| Vaquita | `dev_vaquita_key_local` |

Re-seed anytime: `npm run prisma:seed` (from repo root).

---

### Useful commands

```powershell
# From repo root
npm run setup          # First-time setup
npm run dev:server     # Start API  → :3000
npm run dev:front      # Start DApp → :3001
npm run db:up          # Start MySQL container
npm run db:down        # Stop MySQL container
npm run db:reset       # Wipe DB and restart MySQL
npm run prisma:migrate # Apply migrations
npm run prisma:seed    # Seed partner platforms

# From Server/
npm run prisma:studio  # Visual DB browser
```

---

### Troubleshooting

| Problem | Fix |
|---|---|
| Docker pipe error | Open **Docker Desktop**, wait until running, then `npm run db:up` |
| `npm install` fails in Front | `npm install --legacy-peer-deps` inside `Front/` |
| Prisma can't connect | Run `npm run db:up`, wait 10s, then `npm run prisma:migrate` |
| Wallet signature rejected | Approve the sign popup in Freighter |
| Port in use | Change `PORT` in `Server/.env` or Front dev port in `Front/package.json` |

---

## Stack

- **Backend:** Node.js + Express + TypeScript
- **DB:** MySQL + Prisma ORM
- **Blockchain:** Stellar Horizon API (transaction verification + wallet scoring)
- **Validation:** Zod schemas
- **API docs:** Swagger/OpenAPI 3.0
- **Frontend (DApp):** Next.js in `Front/` — user dashboard (landing page is a separate repo)

---

## Roadmap

- [x] Stellar wallet-based scoring (0–150 pts base)
- [x] Verified credit event system (`POST /api/events/report`)
- [x] Anti-Sybil: txHash uniqueness + counterparty decay
- [x] Score breakdown endpoint for lenders
- [x] Credit history endpoint for users
- [x] Platform registration (admin API key management)
- [x] Wallet signature authentication (challenge + verify)
- [x] Soroban score-registry smart contract
- [x] On-chain score attestation flow
- [x] Stellar Horizon stats in dapp profile
- [ ] Trustless Work integration (testnet)
- [ ] Blend Protocol integration (testnet)
- [ ] Vaquita integration
- [x] Rate limiting per wallet per month
- [x] Wallet age minimum for anti-Sybil (wallets < 30 days don't count)
- [x] Lender API key auth on score endpoint
- [x] Frontend dashboard with score breakdown
- [ ] ZK proof layer for private score verification

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, branch conventions, and PR guidelines.

---

## License

MIT — see [LICENSE](LICENSE).
