# Stellar Integration Testing - ZCore Model B

## Configuración

El servidor usa Horizon API configurado por `STELLAR_NETWORK` en `.env`:

```env
STELLAR_NETWORK=mainnet   # https://horizon.stellar.org
STELLAR_NETWORK=testnet   # https://horizon-testnet.stellar.org
```

Para desarrollo se recomienda `testnet`. Para demo con wallets reales, `mainnet`.

---

## Wallets de Prueba

### Wallet con historial real (mainnet)
```
GAYR3DYYONOZMFQT5KA7VO4LHMDWEDMVOFXONGEPPLQAL5ZWQQXYAJUP
Horizon: https://horizon.stellar.org/accounts/GAYR3DYYONOZMFQT5KA7VO4LHMDWEDMVOFXONGEPPLQAL5ZWQQXYAJUP
```

### Wallet activa para pruebas
```
GAHK7EEG2WWHVKDNT4CEQFZGKF2LGDSW2IVM4S5DP42RBW3K6BTODB4A
Horizon: https://horizon.stellar.org/accounts/GAHK7EEG2WWHVKDNT4CEQFZGKF2LGDSW2IVM4S5DP42RBW3K6BTODB4A
```

---

## Pruebas: Auth

### 1. Registro exitoso (wallet válida en Stellar)

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"GAYR3DYYONOZMFQT5KA7VO4LHMDWEDMVOFXONGEPPLQAL5ZWQQXYAJUP"}'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": { "score": 87 }
}
```

El score varía según la actividad real de la wallet en Stellar (0-150).

### 2. Registro fallido (wallet no existe en Stellar)

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"GINVALIDWALLET123NOTREAL456"}'
```

**Respuesta esperada:**
```json
{
  "success": false,
  "error": "Wallet does not exist on Stellar network"
}
```

### 3. Login de usuario registrado

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"GAYR3DYYONOZMFQT5KA7VO4LHMDWEDMVOFXONGEPPLQAL5ZWQQXYAJUP"}'
```

**Respuesta esperada:**
```json
{ "success": true, "data": { "score": 87 } }
```

### 4. Login de usuario no registrado

```json
{ "success": false, "error": "User not found" }
```

---

## Pruebas: Platform Registration

### 5. Registrar plataforma partner (requiere ADMIN_SECRET)

```bash
curl -X POST http://localhost:3001/api/platforms/register \
  -H "Content-Type: application/json" \
  -d '{
    "adminKey": "change_me_in_production",
    "platformId": "trustless-work",
    "name": "Trustless Work",
    "webhookUrl": "https://api.trustlesswork.com/webhooks/zcore"
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "platformId": "trustless-work",
    "apiKey": "trustless_work_abc123def456..."
  }
}
```

Guarda ese apiKey — es lo que usarás en los siguientes pasos.

---

## Pruebas: Credit Events

### 6. Reportar evento exitoso

```bash
curl -X POST http://localhost:3001/api/events/report \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "trustless_work_abc123def456...",
    "eventType": "escrow_completed",
    "walletAddress": "GAYR3DYYONOZMFQT5KA7VO4LHMDWEDMVOFXONGEPPLQAL5ZWQQXYAJUP",
    "amount": 500,
    "currency": "USDC",
    "txHash": "REAL_STELLAR_TXHASH_HERE",
    "counterpartyWallet": "GDEFGHIJK...",
    "timestamp": "2026-06-17T10:00:00Z"
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "eventId": "evt_uuid",
    "scoreImpact": 17,
    "newScore": 104,
    "newTier": "C",
    "verified": true
  }
}
```

### 7. Replay del mismo txHash → 409

```bash
# Mismo curl que arriba (mismo txHash)
{ "success": false, "error": "This transaction has already been processed" }
```

### 8. txHash inválido en Stellar → 400

```bash
# Con txHash="FAKEHASHNOTINSTELLA"
{ "success": false, "error": "Transaction could not be verified on Stellar network" }
```

### 9. apiKey inválida → 401

```bash
{ "success": false, "error": "Invalid or inactive platform API key" }
```

### 10. Usuario no registrado → 404

```bash
{ "success": false, "error": "User not found. The wallet must be registered in ZCore first." }
```

---

## Pruebas: Score y Historial

### 11. Consultar score con breakdown

```bash
curl http://localhost:3001/api/user/GAYR3DYYONO.../score
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "score": 104,
    "tier": "C",
    "breakdown": {
      "stellarBase": 87,
      "eventsScore": 17,
      "totalEvents": 1,
      "platforms": [
        { "name": "Trustless Work", "eventCount": 1, "totalImpact": 17 }
      ]
    }
  }
}
```

### 12. Historial de eventos

```bash
curl http://localhost:3001/api/user/GAYR3DYYONO.../history
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "eventType": "escrow_completed",
        "platform": "Trustless Work",
        "amount": 500,
        "currency": "USDC",
        "scoreImpact": 17,
        "txHash": "abc123...",
        "date": "2026-06-17T10:00:00Z"
      }
    ],
    "totalPositive": 17,
    "totalNegative": 0
  }
}
```

---

## Secuencia de Prueba Completa

Para validar el flujo completo de Model B:

```
1. POST /api/platforms/register  (adminKey)       → apiKey
2. POST /api/auth/register       (wallet válida)   → score base
3. POST /api/events/report       (apiKey + txHash) → scoreImpact
4. GET  /api/user/:wallet/score                    → score actualizado
5. POST /api/events/report       (mismo txHash)    → 409 anti-replay
6. POST /api/events/report       (nueva tx, misma contraparte) → decay 0.7
7. GET  /api/user/:wallet/history                  → audit trail
```

---

## Cálculo del Stellar Base

El `stellarBase` (0-150 pts) se calcula en `scoring.service.ts:calculateStellarBase()` a partir de los datos que retorna Horizon API:

| Componente | Máximo | Cálculo |
|---|---|---|
| Edad de wallet | 40 pts | `Math.min((walletAgeDays/365)*20, 40)` |
| Actividad transaccional | 30 pts | `Math.min(totalTransactions*0.2, 30)` |
| Tasa de éxito | 20 pts | `(successfulTx/totalTx)*20` |
| Balance XLM | 30 pts | `Math.min(Math.log10(balance+1)*8, 30)` |
| Diversidad de activos | 20 pts | `Math.min(trustlineCount*5, 20)` |
| Operaciones activas | 10 pts | `Math.min(operationsCount*0.1, 10)` |

Para una wallet con historial real, el base suele estar entre 40-130 pts dependiendo de la actividad.
