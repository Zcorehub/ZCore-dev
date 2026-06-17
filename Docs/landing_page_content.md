# ZCore Landing Page - Contenido (Model B)

## Tagline Principal

> **"Reputación Crediticia Portable para Stellar DeFi"**

## Value Proposition

ZCore agrega eventos de pago verificados desde plataformas Stellar (Trustless Work, Blend Protocol, Vaquita) en un score 0-850 que viaja con tu wallet, no con el protocolo.

---

## Hero Section

### Headline

# Tu Historial Crediticio Te Pertenece

## No Queda Atrapado en un Solo Protocolo

### Subheadline

Cada escrow completado, préstamo pagado, y tanda completada suma a tu score portable. Verificado en Stellar blockchain. Portable entre todas las plataformas integradas.

### CTAs

```
[Ver Mi Score]  [Integrar ZCore]  [Explorar Documentación]
```

---

## Problema y Solución

### El Problema

```
❌ Tu reputación queda atrapada en cada protocolo DeFi
❌ Trustless Work no ve lo que hiciste en Blend
❌ Blend no ve lo que hiciste en Vaquita
❌ Empiezas desde cero en cada plataforma
```

### La Solución ZCore

```
✅ Un score portable (0-850) que agrega todos tus eventos verificados
✅ Cada txHash verificado en Stellar Horizon antes de impactar tu score
✅ Reputación que viaja con tu wallet Stellar
✅ Anti-Sybil: counterparty decay + txHash único
```

---

## Cómo Funciona

### Para Usuarios

```
1️⃣ Registra tu wallet Stellar en ZCore
2️⃣ Obtienes un score base desde tu actividad on-chain (0-150 pts)
3️⃣ Cada vez que pagas en una plataforma partner, ella reporta a ZCore
4️⃣ ZCore verifica el txHash en Stellar Horizon
5️⃣ Tu score sube (hasta 850 pts acumulando eventos verificados)
6️⃣ Cualquier plataforma puede consultar tu score
```

### Para Plataformas

```
1️⃣ Regístrate como partner → recibes un API key
2️⃣ Cuando un usuario completa un pago, llama POST /api/events/report
3️⃣ ZCore verifica, calcula el impacto, actualiza el score
4️⃣ Opcionalmente consulta scores: GET /api/user/:wallet/score
```

---

## Sistema de Score

### Componentes

| Fuente | Puntos | Descripción |
|---|---|---|
| Stellar Base | 0-150 | Actividad on-chain del wallet (edad, transacciones, balance, trustlines) |
| escrow_completed | hasta 60/evento | Trustless Work — escrow exitoso |
| loan_repaid | hasta 80/evento | Blend Protocol — préstamo repagado |
| tanda_round_paid | hasta 30/evento | Vaquita — ronda de tanda pagada |
| tanda_cycle_completed | hasta 100/evento | Vaquita — ciclo completo de tanda |

**Score total: 0-850 puntos**

### Tiers de Acceso

| Tier | Score | Descripción |
|---|---|---|
| A | ≥ 600 | Historial sólido — mejores condiciones |
| B | ≥ 350 | Buen historial — acceso estándar |
| C | ≥ 100 | Historial en construcción — acceso limitado |
| REJECTED | < 100 | Sin historial suficiente |

---

## Características Técnicas

### Para Desarrolladores

#### Flujo de registro de usuario

```bash
POST /api/auth/register
{ "walletAddress": "GABC..." }
→ { "success": true, "data": { "score": 87 } }
```

#### Consultar score (cualquier plataforma)

```bash
GET /api/user/GABC.../score
→ {
    "score": 243,
    "tier": "C",
    "breakdown": {
      "stellarBase": 87,
      "eventsScore": 156,
      "totalEvents": 4,
      "platforms": [...]
    }
  }
```

#### Reportar evento (plataforma partner)

```bash
POST /api/events/report
{
  "apiKey": "trustless_work_abc...",
  "eventType": "escrow_completed",
  "walletAddress": "GABC...",
  "amount": 500,
  "currency": "USDC",
  "txHash": "stellar_tx_hash",
  "counterpartyWallet": "GDEF...",
  "timestamp": "2026-06-17T10:00:00Z"
}
→ { "eventId": "...", "scoreImpact": 17, "newScore": 104, "newTier": "C" }
```

### Stack

- **Backend:** Node.js + TypeScript + Express
- **ORM:** Prisma 5 + MySQL
- **Blockchain:** Stellar Horizon API
- **Open Source:** MIT License — github.com/Zcorehub/ZCore-dev

---

## Anti-Fraude

### txHash Único
Cada txHash solo se procesa una vez. Llamadas duplicadas retornan 409.

### Verificación On-Chain
ZCore verifica cada txHash directamente en Stellar Horizon antes de actualizar el score. No confiamos en la palabra de la plataforma.

### Counterparty Decay
Transacciones repetidas con la misma contraparte tienen peso decreciente:
- Primera: 100%
- Segunda: 70%
- Tercera: 40%
- Cuarta en adelante: 10%

Esto hace que el farming con cuentas propias sea económicamente ineficiente.

---

## Plataformas Partner

| Plataforma | Tipo | Eventos Soportados |
|---|---|---|
| Trustless Work | Escrow | `escrow_completed` |
| Blend Protocol | Lending | `loan_repaid` |
| Vaquita | Tandas/Savings | `tanda_round_paid`, `tanda_cycle_completed` |

---

## Roadmap

| Estado | Feature |
|---|---|
| ✅ | Score 0-850 desde Stellar Base + Credit Events |
| ✅ | txHash uniqueness (anti-replay) |
| ✅ | Counterparty decay (anti-Sybil) |
| ✅ | Verificación on-chain en Horizon |
| ✅ | Platform API key system |
| ✅ | Open Source en GitHub |
| 🔄 | ZK proof de score range |
| 🔄 | Monthly rate limits |
| 🔄 | Batch event reporting |
| 🔄 | SDK para plataformas |

---

## Call to Actions

### Para Usuarios
```
[Registrar Mi Wallet]
[Ver Documentación]
[GitHub — Contribuir]
```

### Para Plataformas DeFi
```
[Integrar ZCore como Partner]
[Ver API Reference]
[Agendar Llamada]
```

---

## Mensajes de Error (Microcopy)

- "Wallet no encontrada en Stellar. Verifica la dirección."
- "Este txHash ya fue procesado."
- "Transacción no verificable en Stellar — asegúrate de que sea exitosa."
- "Plataforma no autorizada. Contacta al equipo de ZCore."

## Mensajes de Éxito

- "Score actualizado. +17 pts por escrow completado."
- "Wallet registrada. Tu score base es 87 pts."
- "¡Nivel B alcanzado! Tu reputación abre nuevas puertas."
