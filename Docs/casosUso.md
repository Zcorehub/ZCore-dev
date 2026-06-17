# Casos de Uso - ZCore Model B

## Actores del Sistema

| Actor | Descripción |
|---|---|
| **Usuario** | Wallet Stellar que se registra en ZCore para construir reputación crediticia |
| **Plataforma Partner** | Trustless Work, Blend Protocol, Vaquita — reportan eventos verificados usando apiKey |
| **Admin ZCore** | Registra plataformas partner usando ADMIN_SECRET |
| **DeFi Consumidora** | Plataforma que consulta el score de un usuario antes de otorgar crédito |

---

## Caso 1: Registro de Usuario

**Actor:** Usuario  
**Endpoint:** `POST /api/auth/register`

**Flujo:**
1. Usuario provee su wallet Stellar
2. ZCore valida que la wallet existe en Stellar Horizon
3. ZCore extrae datos on-chain y calcula Stellar Base (0-150 pts)
4. Se crea el registro en DB con score inicial = stellarBase, tier = según score
5. Usuario recibe su score inicial

**Ejemplo:**
```bash
POST /api/auth/register
{ "walletAddress": "GAYR3DYYONOZMFQT5KA7VO4LHMDWEDMVOFXONGEPPLQAL5ZWQQXYAJUP" }

Response:
{ "success": true, "data": { "score": 87 } }
```

**Error esperado si wallet no existe en Stellar:**
```json
{ "success": false, "error": "Wallet does not exist on Stellar network" }
```

---

## Caso 2: Reporte de Evento de Crédito (Flujo Principal)

**Actor:** Plataforma Partner (Trustless Work, Blend, Vaquita)  
**Endpoint:** `POST /api/events/report`

**Flujo:**
1. Plataforma detecta que el usuario completó un pago (escrow, préstamo, tanda)
2. Plataforma llama a ZCore con apiKey + txHash + eventType + amount + walletAddress
3. ZCore valida la apiKey de la plataforma
4. ZCore verifica que el usuario existe en ZCore
5. ZCore verifica que el txHash no fue ya procesado (anti-replay)
6. ZCore verifica el txHash en Stellar Horizon (debe ser exitoso)
7. ZCore calcula counterparty decay si se provee counterpartyWallet
8. ZCore calcula el scoreImpact según tipo y monto
9. ZCore crea el CreditEvent y actualiza el score del usuario (operación atómica)
10. Plataforma recibe el nuevo score del usuario

**Ejemplo — Trustless Work reporta escrow completado:**
```bash
POST /api/events/report
{
  "apiKey": "trustless_work_abc123...",
  "eventType": "escrow_completed",
  "walletAddress": "GAYR3DYYONO...",
  "amount": 500,
  "currency": "USDC",
  "txHash": "abc123stellarhash...",
  "counterpartyWallet": "GDEFGHIJ...",
  "timestamp": "2026-06-17T10:00:00Z"
}

Response:
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

**Errores posibles:**
- `401` — apiKey inválida o plataforma inactiva
- `404` — wallet no registrada en ZCore
- `409` — txHash ya procesado
- `400` — txHash no verificable en Horizon (no existe o falló)

---

## Caso 3: Consulta de Score

**Actor:** DeFi Consumidora, Usuario, Cualquiera  
**Endpoint:** `GET /api/user/:wallet/score`

**Flujo:**
1. DeFi consulta el score de un usuario antes de aprobar crédito
2. ZCore retorna score, tier, y breakdown detallado

**Ejemplo:**
```bash
GET /api/user/GAYR3DYYONO.../score

Response:
{
  "success": true,
  "data": {
    "score": 243,
    "tier": "C",
    "breakdown": {
      "stellarBase": 87,
      "eventsScore": 156,
      "totalEvents": 4,
      "platforms": [
        { "name": "Trustless Work", "eventCount": 3, "totalImpact": 89 },
        { "name": "Vaquita", "eventCount": 1, "totalImpact": 67 }
      ]
    }
  }
}
```

---

## Caso 4: Historial de Crédito

**Actor:** Usuario, DeFi Consumidora  
**Endpoint:** `GET /api/user/:wallet/history`

**Flujo:**
1. Usuario o DeFi consulta el historial de eventos del usuario
2. ZCore retorna los últimos 50 eventos con audit trail completo

**Ejemplo de respuesta:**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "eventType": "loan_repaid",
        "platform": "Blend Protocol",
        "amount": 1000,
        "currency": "USDC",
        "scoreImpact": 36,
        "txHash": "abc123...",
        "date": "2026-06-15T14:00:00Z"
      }
    ],
    "totalPositive": 156,
    "totalNegative": 0
  }
}
```

---

## Caso 5: Registro de Plataforma Partner

**Actor:** Admin ZCore  
**Endpoint:** `POST /api/platforms/register`

**Flujo:**
1. Admin llama al endpoint con ADMIN_SECRET, un platformId estable, y el nombre de la plataforma
2. ZCore genera un apiKey único para la plataforma
3. Admin comparte el apiKey de forma segura con la plataforma

**Ejemplo:**
```bash
POST /api/platforms/register
{
  "adminKey": "your_admin_secret",
  "platformId": "trustless-work",
  "name": "Trustless Work",
  "webhookUrl": "https://api.trustlesswork.com/webhooks/zcore"
}

Response:
{
  "success": true,
  "data": {
    "platformId": "trustless-work",
    "apiKey": "trustless_work_abc123def456..."
  }
}
```

---

## Caso 6: Integración de DeFi Consumidora

**Actor:** DeFi Consumidora (prestamista, protocolo DeFi, etc.)

**Flujo completo de integración:**
1. DeFi consulta score del usuario: `GET /api/user/:wallet/score`
2. DeFi decide condiciones basadas en tier (A/B/C/REJECTED)
3. Si usuario paga, DeFi (si es partner) puede reportar el evento a ZCore para mejorar el score

**Opcionalmente (si usa el sistema de lender profiles legacy):**
1. DeFi configura sus criterios: `POST /api/lender/profiles`
2. Evalúa elegibilidad: `POST /api/user/request`

---

## Escenarios Anti-Sybil

### Intento de Replay (mismo txHash)
```
Primera llamada con txHash "abc123": → 200 OK, score +17
Segunda llamada con txHash "abc123": → 409 Conflict
```
La constraint `@unique` en `CreditEvent.txHash` garantiza esto a nivel de DB.

### Farming con la misma contraparte
```
Evento 1 con GDEFI...: decayFactor 1.0, impact = 17
Evento 2 con GDEFI...: decayFactor 0.7, impact = 12
Evento 3 con GDEFI...: decayFactor 0.4, impact = 7
Evento 4 con GDEFI...: decayFactor 0.1, impact = 2
```
El score total de 4 transacciones iguales con la misma contraparte = 38, no 68.

### Wallet inexistente en Stellar
```
POST /api/auth/register { "walletAddress": "GINVALID..." }
→ 400: Wallet does not exist on Stellar network
```

---

## Flujo de Evolución de Score

```
Registro:     score = 87  (stellarBase)         tier = REJECTED
Evento 1:     score = 104 (+17 escrow 500 USDC)  tier = C
Evento 2:     score = 140 (+36 loan 1000 USDC)   tier = C
Evento 3:     score = 183 (+43 tanda_cycle)       tier = C
Evento 4:     score = 351 (+168, 3 más eventos)   tier = B  ← tier change
```
