# Contributing to ZCore

ZCore is a portable credit scoring layer for Stellar DeFi, built in the open. We welcome contributions that help grow the ecosystem.

## What we're building

ZCore aggregates verified on-chain payment events from partner platforms (Trustless Work, Blend Protocol, Vaquita) into a portable credit score that any lending protocol on Stellar can query. If you're contributing, understanding [the Model B architecture](Docs/plan_modelo_b.md) first will save you time.

## Ways to contribute

- **Bug reports** — Open an issue with reproduction steps and expected vs. actual behavior.
- **Platform integrations** — Add support for a new event source. See [how Trustless Work integration works](Docs/plan_modelo_b.md#prioridad-2--trustless-work) as a reference.
- **Scoring improvements** — Propose changes to event weights or anti-Sybil rules with data or reasoning.
- **Frontend** — The `Front/` directory is a Next.js app that's actively being updated.
- **Documentation** — Improve setup guides, API docs, or the integration guide.

## Setup

### Prerequisites

- Node.js 20+
- MySQL 8.0+
- Git

### Backend

```bash
git clone https://github.com/Zcorehub/ZCore-dev.git
cd ZCore-dev/Server

npm install

# Copy env and fill in your MySQL credentials
cp .env.example .env
# Edit .env: set DATABASE_URL and ADMIN_SECRET

# Initialize database
npx prisma generate
npx prisma migrate dev --name init

# Run development server
npm run dev
# API:      http://localhost:3000/api
# Swagger:  http://localhost:3000/api-docs
```

### Frontend

```bash
cd ZCore-dev/Front
npm install
npm run dev
```

## Branch conventions

| Branch pattern | Purpose |
|---|---|
| `main` | Stable, deployable |
| `feat/<name>` | New feature |
| `fix/<name>` | Bug fix |
| `docs/<name>` | Documentation only |

## Pull Request guidelines

1. **One concern per PR.** A bug fix should not include a refactor.
2. **Update Swagger docs** if you add or modify an endpoint (JSDoc comments in the controller file).
3. **No secrets in code.** Use `.env` for all credentials. The `.env.example` is the single source of truth for required variables.
4. **Keep `txHash` uniqueness enforced.** Never remove the `@unique` constraint on `CreditEvent.txHash` — it is the primary duplicate-payment guard.
5. **Test your changes against a real Stellar testnet wallet.** Set `STELLAR_NETWORK=testnet` in your `.env` for development.

## Adding a new partner platform

1. Register the platform via `POST /api/platforms/register` (see Swagger).
2. The platform receives an API key to call `POST /api/events/report`.
3. Map the platform's payment events to one of the supported `eventType` values:
   - `escrow_completed`
   - `loan_repaid`
   - `tanda_round_paid`
   - `tanda_cycle_completed`
4. If the platform has a new event type, propose it in an issue first with the suggested `base` / `perUSDC` / `maxPerEvent` weights.

## Anti-Sybil rules

Do not modify the counterparty decay table or the txHash uniqueness constraint without opening an issue first. These are load-bearing security properties.

## Code style

- TypeScript strict mode is on. No `any` casts unless absolutely necessary and documented.
- No comments that explain *what* the code does — only *why* when it's non-obvious.
- Zod schemas live in `Server/src/middleware/schemas.ts`. Add new ones there.

## Questions?

Open an issue or reach out to the team.
