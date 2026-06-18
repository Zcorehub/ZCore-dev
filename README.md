# ZCore

**Portable credit scoring infrastructure for Stellar DeFi.**

ZCore is the credit layer that converts verified on-chain payment events — from escrows, tandas, and DeFi loans — into a portable credit score that any lending protocol on Stellar can query.

> "ZCore is the FICO Score for DeFi: built from verified behavior, not wallet activity."

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

### Prerequisites

- Node.js 20+
- MySQL 8.0+
- Git

### Steps

```bash
# 1. Clone and install
git clone https://github.com/Zcorehub/ZCore-dev.git
cd ZCore-dev/Server
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env: set DATABASE_URL, ADMIN_SECRET, and STELLAR_NETWORK

# 3. Create MySQL database
mysql -u root -p -e "CREATE DATABASE zcore;"

# 4. Run migrations and generate Prisma client
npx prisma generate
npx prisma migrate dev --name init

# 5. Start development server
npm run dev
```

Server runs at `http://localhost:3000`.  
Swagger UI at `http://localhost:3000/api-docs`.

### Register a partner platform (first-time setup)

```bash
curl -X POST http://localhost:3000/api/platforms/register \
  -H "Content-Type: application/json" \
  -d '{
    "adminKey": "your_ADMIN_SECRET_from_env",
    "platformId": "trustless-work",
    "name": "Trustless Work",
    "webhookUrl": "https://api.trustlesswork.com/webhooks/zcore"
  }'
```

The response contains the `apiKey` to share with the partner.

### Available scripts

```bash
npm run dev              # Development server with hot reload
npm run build            # Compile TypeScript
npm start                # Run compiled server
npm run prisma:generate  # Regenerate Prisma client after schema changes
npm run prisma:migrate   # Apply new migrations
npm run prisma:studio    # Visual DB browser
```

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
