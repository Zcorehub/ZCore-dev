# Arquitectura ZCore - Model B

## Posicionamiento

ZCore es **infraestructura portátil de crédito para Stellar DeFi**. No presta dinero. Agrega eventos de pago verificables desde plataformas partner en un score 0-850 que viaja con el wallet del usuario, no con el protocolo.

**Clientes de ZCore (plataformas partner):** Trustless Work, Blend Protocol, Vaquita.  
**Usuarios finales:** Cualquier wallet Stellar que se registre en ZCore.

---

## Diagrama del Sistema

```
┌──────────────────────────────────────────────────────────────┐
│                  Partner Platforms                           │
│   Trustless Work    Blend Protocol    Vaquita               │
│   (escrow)          (lending)         (tandas)              │
└───────────┬──────────────┬───────────────┬──────────────────┘
            │              │               │
            │  POST /api/events/report (apiKey + txHash + event)
            ▼              ▼               ▼
┌──────────────────────────────────────────────────────────────┐
│                        ZCore API                             │
│                                                              │
│  ┌─────────────────────┐   ┌──────────────────────────────┐ │
│  │  Auth Controller    │   │   Events Controller          │ │
│  │  POST /auth/register│   │   POST /events/report        │ │
│  │  POST /auth/login   │   │                              │ │
│  └──────────┬──────────┘   └─────────────┬────────────────┘ │
│             │                            │                   │
│  ┌──────────▼──────────────────────────▼────────────────┐  │
│  │               Scoring Service                         │  │
│  │  calculateStellarBase()     calculateEventImpact()   │  │
│  │  assignProfileTier()        applyCounterpartyDecay() │  │
│  └──────────┬──────────────────────────┬────────────────┘  │
│             │                          │                     │
│  ┌──────────▼──────┐      ┌───────────▼──────────────────┐ │
│  │ Stellar Service │      │        Prisma ORM            │ │
│  │ verifyTx()      │      │  User, CreditEvent, Platform │ │
│  └──────────┬──────┘      └──────────────────────────────┘ │
└─────────────┼────────────────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────────────────────────┐
│                 Stellar Horizon API                          │
│   horizon.stellar.org  /  horizon-testnet.stellar.org       │
└──────────────────────────────────────────────────────────────┘
```

---

## Modelos de Datos

### User
```
id, walletAddress @unique, score (0-850, default 0),
profileTier ("A"|"B"|"C"|"REJECTED", default "REJECTED"),
stellarData (Json?), createdAt, updatedAt
creditEvents CreditEvent[]
```

### Platform
```
id (string, stable key: "trustless-work"),
name, apiKey @unique, webhookUrl?, active (default true),
createdAt, events CreditEvent[]
```

### CreditEvent
```
id, userId, platformId, eventType, amount, currency,
txHash @unique,  ← anti-replay: un txHash = un evento
counterpartyWallet?, scoreImpact, verifiedAt, createdAt
```

Índices compuestos: `(userId, platformId)`, `(userId, eventType)`, `txHash`.

---

## Flujo Principal: Reporte de Evento

```
Partner Platform
      │
      │ POST /api/events/report
      │ { apiKey, eventType, walletAddress, amount, txHash, counterpartyWallet?, timestamp }
      ▼
Events Controller
  1. Platform.findUnique(apiKey) → 401 si no existe/inactiva
  2. User.findUnique(walletAddress) → 404 si no registrado
  3. CreditEvent.findUnique(txHash) → 409 si ya procesado
  4. verifyTransaction(txHash) en Horizon → 400 si no válida
  5. CreditEvent.count(userId + counterpartyWallet) → decayFactor
  6. calculateEventImpact(eventType, amount, decayFactor) → scoreImpact
  7. newScore = clamp(user.score + scoreImpact, 0, 850)
  8. prisma.$transaction([createCreditEvent, updateUser])
      │
      ▼
  Response: { eventId, scoreImpact, newScore, newTier, verified: true }
```

---

## Flujo de Registro de Usuario

```
User (o plataforma en nombre del usuario)
      │
      │ POST /api/auth/register { walletAddress }
      ▼
Auth Controller
  1. Validar formato wallet Stellar
  2. StellarService.getAccountData(walletAddress) → Horizon API
  3. Si wallet no existe en Stellar → 400
  4. calculateStellarBase(accountData) → 0-150 pts
  5. User.create({ walletAddress, score: stellarBase, stellarData })
      │
      ▼
  Response: { success, data: { score } }
```

---

## Todos los Endpoints

| Método | Endpoint | Actor | Descripción |
|---|---|---|---|
| POST | `/api/auth/register` | Usuario | Registro con wallet Stellar |
| POST | `/api/auth/login` | Usuario | Login, retorna score actual |
| POST | `/api/events/report` | Platform (apiKey) | Reporta evento de crédito verificado |
| POST | `/api/platforms/register` | Admin (ADMIN_SECRET) | Registra plataforma partner y emite apiKey |
| GET | `/api/user/:wallet/score` | Cualquiera | Score actual + breakdown completo |
| GET | `/api/user/:wallet/history` | Cualquiera | Últimos 50 eventos con audit trail |
| GET | `/api/user/:wallet/profile` | Cualquiera | Perfil de usuario |
| POST | `/api/user/request` | DeFi | Evalúa elegibilidad vs perfiles de prestamista |
| POST | `/api/lender/profiles` | DeFi (apiKey) | Define criterios de riesgo del prestamista |
| POST | `/api/payment/report` | DeFi | Reporta pago (legacy) |

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express + TypeScript |
| ORM | Prisma 5.22.0 |
| Database | MySQL 8+ |
| Blockchain | Stellar Horizon REST API |
| Validación | Zod schemas |
| Docs | Swagger/OpenAPI (swagger-jsdoc) |
| CI | GitHub Actions |

---

## Anti-Sybil y Seguridad

### txHash Único (Anti-Replay)
`CreditEvent.txHash` tiene `@unique` en el schema. Un mismo txHash no puede procesarse dos veces.

### Counterparty Decay (Anti-Farming)
Interacciones repetidas con la misma contraparte tienen peso decreciente:
- 1ª transacción: 100%
- 2ª transacción: 70%
- 3ª transacción: 40%
- 4ª+ transacción: 10%

### Verificación On-Chain
Todo txHash se verifica contra Stellar Horizon antes de impactar el score. Si la transacción no existe o falló, el evento se rechaza con 400.

### API Keys de Plataforma
Las plataformas partner se registran con `POST /api/platforms/register` usando `ADMIN_SECRET`. Cada plataforma recibe un apiKey único que debe incluir en cada llamada a `/api/events/report`.

---

## Variables de Entorno Requeridas

```env
DATABASE_URL="mysql://user:pass@localhost:3306/zcore"
JWT_SECRET="your_jwt_secret"
ADMIN_SECRET="your_admin_secret"
STELLAR_NETWORK="mainnet"   # o "testnet"
PORT=3001
```

---

## Roadmap

| Estado | Feature |
|---|---|
| ✅ | Stellar Base scoring (0-150) |
| ✅ | Credit Event aggregation (0-700+) |
| ✅ | txHash uniqueness (anti-replay) |
| ✅ | Counterparty decay (anti-Sybil) |
| ✅ | On-chain txHash verification |
| ✅ | Platform API key system |
| ✅ | Score/history public endpoints |
| 🔄 | Monthly rate limit per platform per wallet |
| 🔄 | Minimum wallet age for registration |
| 🔄 | ZK proof of score range |
| 🔄 | Batch event reporting |
| 🔄 | Score decay for inactivity |
