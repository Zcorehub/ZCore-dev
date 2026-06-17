# Metodología de Scoring - ZCore Model B

## Resumen

ZCore calcula un score 0-850 desde dos fuentes de datos verificables en Stellar:

1. **Stellar Base (0-150)** — actividad on-chain del wallet, calculada vía Horizon API en el momento del registro.
2. **Credit Events (0-700)** — eventos de pago verificados reportados por plataformas partner (Trustless Work, Blend Protocol, Vaquita).

El score se almacena en la tabla `User.score` y se recalcula atómicamente cada vez que un partner reporta un evento verificado.

---

## Parte 1: Stellar Base (máximo 150 puntos)

Calculado por `calculateStellarBase()` en `scoring.service.ts` al registrar o hacer login.

| Componente | Máximo | Cálculo |
|---|---|---|
| Edad de wallet | 40 pts | `Math.min((walletAgeDays / 365) * 20, 40)` |
| Actividad transaccional | 30 pts | `Math.min(totalTransactions * 0.2, 30)` |
| Tasa de éxito | 20 pts | `(successfulTx / totalTx) * 20` |
| Balance XLM | 30 pts | `Math.min(Math.log10(balance + 1) * 8, 30)` |
| Diversidad de activos | 20 pts | `Math.min(trustlineCount * 5, 20)` |
| Operaciones activas | 10 pts | `Math.min(operationsCount * 0.1, 10)` |
| **Total** | **150** | |

**Fuente:** Stellar Horizon API (`https://horizon.stellar.org` en mainnet, `https://horizon-testnet.stellar.org` en testnet).

**Cuándo se calcula:** En `POST /api/auth/register`. En `POST /api/auth/login` se puede recalcular si el usuario ya existe.

---

## Parte 2: Credit Events (máximo ~700 puntos acumulables)

Cada evento reportado por una plataforma partner agrega puntos al score. El impacto depende del tipo de evento, el monto en USDC, y el factor de decay de contraparte.

### Pesos por Tipo de Evento

```typescript
const EVENT_WEIGHTS = {
  escrow_completed:      { base: 15, perUSDC: 0.005, maxPerEvent: 60  },
  loan_repaid:           { base: 20, perUSDC: 0.008, maxPerEvent: 80  },
  tanda_round_paid:      { base: 10, perUSDC: 0.003, maxPerEvent: 30  },
  tanda_cycle_completed: { base: 40, perUSDC: 0.010, maxPerEvent: 100 },
}
```

### Fórmula de Impacto

```typescript
calculateEventImpact(eventType, amountUSDC, decayFactor):
  rawImpact = base + (perUSDC × amountUSDC)
  cappedImpact = Math.min(rawImpact, maxPerEvent)
  finalImpact = Math.round(cappedImpact × decayFactor)
```

### Ejemplos

| Evento | Monto | Decay | Impacto |
|---|---|---|---|
| `escrow_completed` | 500 USDC | 1.0 (primera vez) | `min(15 + 2.5, 60) × 1.0 = 17` |
| `escrow_completed` | 500 USDC | 0.7 (segunda vez misma contraparte) | `17 × 0.7 = 12` |
| `loan_repaid` | 2000 USDC | 1.0 | `min(20 + 16, 80) = 36` |
| `tanda_cycle_completed` | 300 USDC | 1.0 | `min(40 + 3, 100) = 43` |

---

## Mecanismo Anti-Sybil: Counterparty Decay

Para prevenir que usuarios inflen su score transaccionando repetidamente con la misma contraparte:

```typescript
applyCounterpartyDecay(interactionCount):
  1  → 1.0  (100%)
  2  → 0.7  (70%)
  3  → 0.4  (40%)
  4+ → 0.1  (10%)
```

`interactionCount` = número total de `CreditEvent` con `userId` + `counterpartyWallet` iguales (incluyendo el actual).

Si `counterpartyWallet` no se provee, `decayFactor = 1.0`.

---

## Mecanismo Anti-Replay: txHash único

La tabla `CreditEvent` tiene `txHash @unique`. Si una plataforma intenta reportar el mismo txHash dos veces, el endpoint retorna `409 Conflict` antes de tocar el score:

```
1. findUnique({txHash}) → 409 si existe
2. verifyTransaction(txHash) en Horizon → 400 si no válida/exitosa
3. $transaction([createEvent, updateUser])
```

---

## Verificación On-Chain

Cada evento pasa por `verifyTransaction(txHash)` en `stellar.service.ts`:

- Llama a `GET {HORIZON_URL}/transactions/{txHash}`
- Verifica que la transacción exista y que `successful === true`
- Retorna `{ valid, successful, sourceAccount, createdAt, error? }`

Un evento con txHash no verificable o fallido en Stellar nunca impacta el score.

---

## Tiers de Perfil

```typescript
assignProfileTier(score):
  score >= 600  → "A"
  score >= 350  → "B"
  score >= 100  → "C"
  else          → "REJECTED"
```

| Tier | Score Mínimo | Descripción |
|---|---|---|
| A | 600 | Historial sólido de pagos verificados |
| B | 350 | Buena actividad, acceso estándar |
| C | 100 | Actividad limitada, acceso restringido |
| REJECTED | 0 | Sin suficiente historial verificado |

El tier se actualiza en el mismo `$transaction` que crea el `CreditEvent`.

---

## Score Total

```
score = stellarBase (0-150) + sum(scoreImpact of all CreditEvents)
score = clamp(score, 0, 850)
```

El breakdown completo se expone en `GET /api/user/:wallet/score`:

```json
{
  "score": 243,
  "tier": "C",
  "breakdown": {
    "stellarBase": 87,
    "eventsScore": 156,
    "totalEvents": 4,
    "platforms": [
      { "name": "Trustless Work", "eventCount": 3, "totalImpact": 89 },
      { "name": "Vaquita",        "eventCount": 1, "totalImpact": 67 }
    ]
  }
}
```

---

## Limitaciones Actuales y Roadmap

### Implementado (v1.0)
- Stellar Base + Credit Events
- txHash uniqueness (anti-replay)
- Counterparty decay (anti-Sybil)
- Verificación on-chain de txHash

### Pendiente (issues abiertos)
- Monthly rate limit por plataforma (max N eventos/mes por wallet+platform)
- Wallet age minimum para registro
- Score decay por inactividad
- Batch event reporting
