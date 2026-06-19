# ZCore — Plan de Desarrollo Modelo B
## Score Crediticio Portable desde Infraestructura Existente

> **Estado:** Documento vivo. Reemplaza la dirección original de ZCore.
> **Fecha:** Junio 2026
> **Versión del producto:** 2.0 (Pivot desde scoring de wallet activity → agregador de eventos de crédito verificables)

---

## 1. Por qué pivotamos

### El problema del ZCore original

El ZCore v1 calculaba score basado en **actividad de wallet Stellar**: antigüedad, transacciones, balance XLM, trustlines. Eso mide "¿qué tan activo eres en Stellar?", no "¿eres confiable con el dinero?". Consecuencias:

- Un trader activo con malos hábitos de pago → score alto injusto
- Una persona de Latinoamérica que pagó tandas durante 3 años pero tiene wallet nueva → score 0
- El producto solo sirve a quienes ya son usuarios activos de DeFi (nicho pequeño)
- El chicken-and-egg clásico: sin prestamistas integrados no hay eventos de pago, sin eventos de pago el score no mejora, sin score mejorado los prestamistas no integran

### La intuición correcta que guía el pivot

**Millones de personas en LatAm tienen historial crediticio real pero invisible para el sistema formal.** Pagan tandas religiosamente. Devuelven préstamos a amigos. Tienen fiado en la tienda. Son confiables — pero para un banco o para DeFi no existen.

El FICO Score nació de exactamente este problema en TradFi en los años 50: formalizar lo que comunidades locales ya sabían sobre la confiabilidad de sus miembros. ZCore hace eso para Web3, con la ventaja de que el registro puede ser on-chain, portable e inmutable.

### Qué cambia con el Modelo B

| Dimensión | ZCore v1 | ZCore v2 (Modelo B) |
|---|---|---|
| Fuente de datos | Actividad de wallet Stellar | Eventos de pago verificados de plataformas partner |
| ¿Qué mide? | ¿Qué tan activo eres en DeFi? | ¿Eres confiable con el dinero? |
| Target de usuarios | Usuarios activos de Stellar | Cualquier persona con historial de pagos on-chain |
| Plataformas fuente | Solo Stellar Horizon | Trustless Work + Blend + Vaquita + cualquier partner |
| Posición en ecosistema | Producto standalone | Capa de infraestructura que multiplica el valor de plataformas existentes |
| Track SCF | Open Track | **Integration Track (menos competencia, financiamiento directo)** |

---

## 2. El producto redefinido

### Definición en una frase

> ZCore es la capa de scoring crediticio portable que convierte eventos de pago verificados on-chain — desde escrows, tandas, préstamos DeFi — en un historial crediticio que el usuario puede presentar en cualquier protocolo de lending que integre ZCore.

### Flujo completo

```
┌─────────────────────────────────────────────────────────────────┐
│  PLATAFORMAS FUENTE (generan eventos)                           │
│                                                                  │
│  Trustless Work ──→ escrow completado (pagué mi trabajo)        │
│  Vaquita/Clixpesa ─→ ronda de tanda pagada (cumplí en el grupo) │
│  Blend Protocol ───→ préstamo repagado (devolví lo que pedí)    │
│  Cualquier DeFi ───→ evento de pago verificado                  │
└──────────────────────────────┬──────────────────────────────────┘
                               │ POST /api/events/report
                               │ (con txHash para verificación)
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  ZCORE CORE                                                      │
│                                                                  │
│  1. Verificar txHash en Stellar Horizon (el pago es real)       │
│  2. Calcular impacto en score según tipo + monto + plataforma   │
│  3. Almacenar CreditEvent inmutable                             │
│  4. Actualizar score del usuario                                 │
│  5. Actualizar tier (A/B/C)                                     │
└──────────────────────────────┬──────────────────────────────────┘
                               │ GET /api/user/{wallet}/score
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  LENDERS (consumen el score)                                     │
│                                                                  │
│  Blend Protocol ───→ ofrece colateral reducido al usuario       │
│  Otros protocolos ─→ mejores tasas según tier                   │
│  DeFi nuevas ──────→ no necesitan construir scoring propio      │
└─────────────────────────────────────────────────────────────────┘
```

### Lo que ZCore NO hace

- No presta dinero
- No custodia fondos
- No construye la tanda (eso es Vaquita)
- No construye el escrow (eso es Trustless Work)
- No decide si aprobar el préstamo (eso es el lender)

ZCore solo responde una pregunta: **"¿esta persona ha sido confiable con el dinero en el ecosistema Stellar?"**

---

## 3. Plataformas a integrar (por prioridad)

### Prioridad 1 — Blend Protocol

**Por qué primero:** Blend tiene ~$80M+ TVL hoy. Hay usuarios reales haciendo préstamos reales. Cada repago de Blend es un evento de crédito de alta calidad. Además, el loop de valor es inmediato: repagar en Blend mejora tu score en ZCore, que te da mejores condiciones en Blend.

**Tipo de evento:**
```json
{
  "eventType": "loan_repaid",
  "platformId": "blend-protocol",
  "amount": 1000,
  "currency": "USDC",
  "txHash": "abc123...",
  "walletAddress": "GAYR3..."
}
```

**Conversación a tener con el equipo de Blend:** "¿Estarían dispuestos a llamar nuestro webhook cuando un usuario repaga? A cambio, sus usuarios acumulan historial crediticio portable que los incentiva a volver."

---

### Prioridad 2 — Trustless Work

**Por qué segundo:** Ya está en mainnet con API/SDK maduros. Tiene Integration Track en SCF — su equipo quiere que gente construya encima. Un escrow completado en Trustless Work es una señal muy limpia: alguien recibió un trabajo, lo entregó, y el comprador lo liberó. Eso es confiabilidad verificable.

**Tipo de evento:**
```json
{
  "eventType": "escrow_completed",
  "platformId": "trustless-work",
  "amount": 500,
  "currency": "USDC",
  "txHash": "xyz789...",
  "walletAddress": "GAYR3..."
}
```

**Conversación a tener:** "Cada vez que alguien completa un escrow en Trustless Work, nos llaman. Sus usuarios acumulan score crediticio. Más incentivo para que freelancers usen Trustless Work en vez de Venmo."

---

### Prioridad 3 — Vaquita / Clixpesa

**Por qué tercero:** Este es el más valioso para el caso de uso de crédito informal, pero técnicamente requiere más trabajo (mapear los contratos de Vaquita). Hacer esta integración después de tener las dos primeras andando.

**Tipos de evento:**
```json
// Ronda mensual pagada
{ "eventType": "tanda_round_paid", ... }

// Ciclo completo de tanda terminado (vale más)
{ "eventType": "tanda_cycle_completed", ... }
```

**Nota importante:** Un ciclo completo de tanda (pagaste todos los meses sin fallar) vale significativamente más que una sola ronda. El comportamiento sostenido en el tiempo es la señal más valiosa.

---

## 4. Sistema de scoring rediseñado

### Dos fuentes de score

```
Score Total = Score Base Stellar + Score de Eventos de Partners
```

#### Score Base Stellar (0–150 puntos)
Conservamos la integración existente con Horizon API pero reducimos su peso. Su función ahora es contexto, no el score central.

| Componente | Puntos máx | Por qué conservarlo |
|---|---|---|
| Antigüedad de wallet | 40 | Señal de que la wallet no fue creada ayer para gaming |
| Tasa de éxito de txs | 30 | Wallets con muchas txs fallidas = sospechoso |
| Balance XLM mínimo | 20 | Prueba de que hay algo en la wallet |
| Actividad transaccional | 60 | Señal de uso real, no wallet fantasma |

#### Score de Eventos de Partners (0–700 puntos)
Esta es la fuente principal y la innovación real.

```typescript
const EVENT_WEIGHTS = {
  // Trustless Work
  escrow_completed: {
    base: 15,
    perUSDC: 0.005,       // $100 escrow = 15 + 0.5 = 15.5 pts
    maxPerEvent: 60,
  },

  // Blend Protocol
  loan_repaid: {
    base: 20,
    perUSDC: 0.008,       // $500 repago = 20 + 4 = 24 pts
    maxPerEvent: 80,
  },

  // Vaquita
  tanda_round_paid: {
    base: 10,
    perUSDC: 0.003,
    maxPerEvent: 30,
  },
  tanda_cycle_completed: {
    base: 40,             // Bonus por completar el ciclo entero
    perUSDC: 0.010,
    maxPerEvent: 100,
  },
}
```

**Por qué escala logarítmica por monto:** Para no premiar solo a quienes tienen capital. Un escrow de $100 completado 10 veces vale más que uno de $1,000 completado una vez. El comportamiento repetido y consistente es la señal.

#### Factores de multiplicación

| Condición | Multiplicador |
|---|---|
| Mismo tipo de evento 3+ veces consecutivas | ×1.2 |
| Eventos de 2+ plataformas distintas | ×1.15 |
| Sin ningún default en los últimos 6 meses | ×1.1 |
| Default reciente (< 3 meses) | ×0.5 |

#### Penalizaciones

| Evento | Impacto |
|---|---|
| Default en cualquier plataforma reportado | -50 puntos |
| Default en Blend (mayor visibilidad) | -70 puntos |
| Escrow disputado y resuelto en contra | -30 puntos |

#### Tiers resultantes

| Tier | Score | Límite típico | Tasa típica |
|---|---|---|---|
| A | 600–850 | $10,000+ | 8–12% |
| B | 350–599 | $2,000–$10,000 | 12–18% |
| C | 100–349 | $200–$2,000 | 18–25% |
| REJECTED | 0–99 | Sin acceso | N/A |

---

## 5. Anti-Sybil: cómo el Modelo B se defiende

### Defensas nativas del modelo

**Defensa 1 — El dinero tiene que moverse de verdad**
A diferencia de attestation social puro, aquí hay capital real en juego. Para que un escrow cuente, alguien tuvo que bloquear $X reales en el contrato de Trustless Work. No se puede simular sin capital.

**Defensa 2 — txHash único e irrepetible**
El campo `txHash` en la tabla `CreditEvent` tiene constraint `@unique`. El mismo pago no puede contar dos veces, sin importar cuántas veces lo reporte el partner.

**Defensa 3 — Verificación en Stellar Horizon**
ZCore nunca confía en el reporte del partner. Siempre verifica que el txHash exista en la blockchain y que los datos (monto, wallets, fecha) coincidan.

### Defensas adicionales a implementar

**Análisis de contrapartes repetidas**
Si Alice y Bob se hacen escrows entre ellos una y otra vez sin interactuar con nadie más, eso es señal de gaming. El score de eventos con la misma contraparte repetida tiene rendimientos decrecientes:
- 1er escrow con Bob: 100% del peso
- 2do escrow con Bob: 70%
- 3er escrow con Bob: 40%
- 4to+ con Bob: 10%

**Antigüedad mínima de wallets involucradas**
Un escrow entre dos wallets que tienen menos de 30 días de existencia en Stellar no cuenta para el score. Esto encarece el ataque Sybil.

**Rate limiting por ventana temporal**
Máximo N eventos por wallet por mes que cuentan para el score. Pagos en cadena acelerada (5 escrows en 2 días) levantan flag de revisión.

---

## 6. Arquitectura técnica completa

### Stack (sin cambios)

- **Backend:** Node.js + Express + TypeScript
- **DB:** MySQL + Prisma ORM
- **Blockchain:** Stellar Horizon API (verificación de txHash)
- **Documentación:** Swagger/OpenAPI 3.0
- **Validación:** Zod schemas

### Nuevos modelos de datos

```prisma
// Agregar al schema.prisma existente

model CreditEvent {
  id            String   @id @default(uuid())
  userId        String
  platformId    String   // "trustless-work" | "blend-protocol" | "vaquita"
  eventType     String   // "escrow_completed" | "loan_repaid" | "tanda_round_paid" | "tanda_cycle_completed"
  amount        Float    // monto en USDC o equivalente
  currency      String   @default("USDC")
  txHash        String   @unique  // previene duplicados
  counterpartyWallet String?      // para análisis de contrapartes repetidas
  scoreImpact   Int              // puntos que sumó (positivo) o restó (negativo)
  verifiedAt    DateTime         // cuando ZCore verificó en Stellar
  createdAt     DateTime @default(now())
  user          User     @relation(fields: [userId], references: [id])
  platform      Platform @relation(fields: [platformId], references: [id])

  @@index([userId, platformId])
  @@index([userId, eventType])
  @@index([txHash])
}

model Platform {
  id          String        @id  // "trustless-work", "blend-protocol", "vaquita"
  name        String
  apiKey      String        @unique
  webhookUrl  String?       // URL donde ZCore notifica cuando procesa el evento
  active      Boolean       @default(true)
  createdAt   DateTime      @default(now())
  events      CreditEvent[]
}
```

**Cambio en modelo User:** El campo `score` pasa a rango 0-850, eliminando el default de 500 que era incorrecto. Los usuarios nuevos sin eventos tienen score base derivado solo del Score Base Stellar (típicamente 20-80 puntos).

```prisma
model User {
  id              String        @id @default(uuid())
  walletAddress   String        @unique
  score           Int           @default(0)   // cambia de 500 a 0
  profileTier     String        @default("REJECTED")  // cambia de "C"
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  stellarData     Json?         // renombrado de questionnaire
  requests        Request[]
  payments        Payment[]
  creditEvents    CreditEvent[]

  @@index([walletAddress])
}
```

### Nuevos endpoints

#### POST /api/events/report
El endpoint central del Modelo B. Lo llaman las plataformas partner cuando ocurre un evento de pago.

```typescript
// Request
{
  "apiKey": "tw_prod_key_xyz",          // API key del partner registrado
  "eventType": "escrow_completed",
  "walletAddress": "GAYR3DYYO...",      // wallet del usuario en ZCore
  "amount": 500,
  "currency": "USDC",
  "txHash": "abc123stellar...",
  "counterpartyWallet": "GDEFG...",     // para análisis anti-Sybil
  "timestamp": "2026-06-17T10:00:00Z"
}

// Response
{
  "success": true,
  "data": {
    "eventId": "evt_uuid",
    "scoreImpact": +22,
    "newScore": 187,
    "newTier": "C",
    "verified": true
  }
}
```

**Flujo interno:**
1. Validar API key del partner → buscar en tabla `Platform`
2. Verificar `txHash` en Stellar Horizon → confirmar que la transacción existe y los datos coinciden
3. Verificar que el `txHash` no fue procesado antes → `CreditEvent.txHash` es `@unique`
4. Calcular `scoreImpact` según `EVENT_WEIGHTS` y factores de multiplicación
5. Aplicar análisis de contraparte repetida
6. Crear `CreditEvent` y actualizar `User.score` en una transacción atómica
7. Responder al partner con el resultado

#### GET /api/user/{wallet}/score
Endpoint que consumen los lenders para decidir condiciones.

```typescript
// Response
{
  "success": true,
  "data": {
    "walletAddress": "GAYR3...",
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

#### GET /api/user/{wallet}/history
Para que el usuario vea qué eventos construyeron su score.

```typescript
// Response
{
  "success": true,
  "data": {
    "events": [
      {
        "platform": "Trustless Work",
        "eventType": "escrow_completed",
        "amount": 500,
        "currency": "USDC",
        "scoreImpact": +22,
        "date": "2026-06-10"
      },
      {
        "platform": "Blend Protocol",
        "eventType": "loan_repaid",
        "amount": 200,
        "currency": "USDC",
        "scoreImpact": +31,
        "date": "2026-05-28"
      }
    ],
    "totalPositive": 320,
    "totalNegative": 0
  }
}
```

#### POST /api/platforms/register (admin)
Para registrar nuevas plataformas partner y generar sus API keys.

```typescript
// Request
{
  "adminKey": "zcore_admin_secret",
  "platformId": "trustless-work",
  "name": "Trustless Work",
  "webhookUrl": "https://api.trustlesswork.com/webhooks/zcore"
}

// Response
{
  "success": true,
  "data": {
    "platformId": "trustless-work",
    "apiKey": "tw_prod_generated_key_xyz",
    "webhookSecret": "whsec_..."  // guardar en el partner; no se vuelve a mostrar
  }
}
```

#### Webhook `score_updated` (ZCore → partner)

Cuando un evento reportado cambia el score del usuario, ZCore hace `POST` a `platform.webhookUrl` (si está configurada).

**Headers:**
- `Content-Type: application/json`
- `X-ZCore-Signature`: HMAC-SHA256 del body JSON usando `platform.webhookSecret`

**Payload:**
```json
{
  "event": "score_updated",
  "walletAddress": "G...",
  "previousScore": 380,
  "newScore": 395,
  "profileTier": "B",
  "eventType": "escrow_completed",
  "txHash": "...",
  "timestamp": "2026-06-18T12:00:00Z"
}
```

**Verificación en el partner (Node.js):**
```javascript
const crypto = require("crypto");
const expected = crypto
  .createHmac("sha256", process.env.ZCORE_WEBHOOK_SECRET)
  .update(rawBody)
  .digest("hex");
const valid = crypto.timingSafeEqual(
  Buffer.from(req.headers["x-zcore-signature"]),
  Buffer.from(expected)
);
```

Los fallos de webhook se registran en logs y **no** bloquean la ingesta del evento. Se reintenta una vez tras 5 s ante respuestas 5xx.

---

## 7. Lo que se mantiene del código existente

### Reutilizar sin cambios

| Componente | Archivo | Por qué se mantiene |
|---|---|---|
| Integración Stellar Horizon | `scoring.service.ts` | Se reutiliza para verificar txHash y calcular Score Base |
| Validación de wallets | `auth.controller.ts` | `calculateStellarOnlyScore` → renombrar a `calculateStellarBase` |
| Sistema de tiers A/B/C | `profile.service.ts` | Solo cambian los rangos numéricos |
| Lógica de elegibilidad | `profile.service.ts` | `evaluateEligibility` funciona igual |
| Modelo Lender | `schema.prisma` | Los prestamistas siguen configurando perfiles |
| Endpoint de perfil | `user.controller.ts` | `GET /api/user/{wallet}/profile` sigue igual |
| Swagger + documentación | `swagger.ts` | Agregar nuevos endpoints |
| Validación Zod | `schemas.ts` | Agregar schemas para eventos |
| Error middleware | `error.middleware.ts` | Sin cambios |

### Modificar

| Componente | Cambio necesario |
|---|---|
| `schema.prisma` | Agregar modelos `CreditEvent` y `Platform`. Cambiar `score` default de 500 a 0. Renombrar `questionnaire` a `stellarData` |
| `scoring.service.ts` | Agregar `calculateEventScore()`. Mantener `calculateStellarBase()` (renombrado) |
| `auth.controller.ts` | `registerUser`: el score inicial es solo el Score Base Stellar (0-150), no el score completo |
| `payment.controller.ts` | Migrar `POST /payment/report` para usar el nuevo sistema de eventos. Los pagos reportados por lenders son un tipo de evento más |
| `middleware/schemas.ts` | Agregar schema de validación Zod para el payload de eventos |

### Bugs críticos a corregir antes del Modelo B

Estos deben resolverse en la primera semana porque comprometen la confianza del sistema:

1. **Sin auth real en login:** `POST /auth/login` solo busca la wallet en DB. Cualquiera puede "loguearse" con la wallet de otro. Fix: requerir firma de wallet (SEP-10 de Stellar o challenge-response simple).

2. **Sin API keys para lenders:** `POST /payment/report` y `POST /lender/profiles` no autentican al caller. Fix: en el Modelo B, los partners tienen API keys en tabla `Platform`. Los lenders existentes también necesitan API key válida.

3. **Pagos sin verificación on-chain:** `POST /payment/report` acepta pagos sin verificar el txHash. Fix: el nuevo `POST /api/events/report` siempre verifica en Stellar Horizon antes de procesar.

4. **Rango de score inconsistente:** README dice 0-350, Prisma default es 500, `updateScoreFromPayment` limita entre 300-850. Fix: score unificado 0-850, default 0, Score Base Stellar aporta 0-150, eventos aportan 0-700.

5. **Frontend desactualizado:** La landing dice "answer a quick questionnaire" pero el backend no requiere cuestionario. Fix menor — actualizar copy en `Front/app/page.tsx`.

---

## 8. Modelo de negocio

### Revenue streams

**Stream 1 — Score queries (por consulta):** Lenders pagan $0.01-$0.05 cada vez que consultan el score de un usuario antes de tomar decisión de préstamo.

**Stream 2 — Suscripción de plataforma:** Lenders que integran ZCore pagan $200-$2,000/mes según volumen de queries. Freemium hasta 100 queries/mes para adopción inicial.

**Stream 3 — Fee por volumen prestado:** 0.1% del monto de préstamos donde ZCore fue consultado y el préstamo fue aprobado. Este es el más difícil de implementar al inicio pero el más escalable.

**Sin cobrar a plataformas fuente (Trustless Work, Vaquita, Blend):** Ellas generan los datos. Cobrarles sería incentivarlas a no integrar. Su beneficio es que sus usuarios valen más.

### Proyección conservadora (Año 1)

```
5 lenders integrados
100 score queries/día por lender = 500 queries/día
$0.03 promedio por query
→ $15/día → $450/mes → $5,400/año

+ Suscripción promedio $500/mes × 5 lenders = $2,500/mes
→ $30,000/año

Total Año 1 conservador: ~$35,000
```

Esto no es el objetivo final — es la métrica para llegar a Series A con 25+ lenders integrados.

---

## 9. Pitch para el SCF Integration Track

### Por qué es Integration Track y no Open Track

- Construimos **sobre** Trustless Work (ya financiado por SCF)
- Construimos **sobre** Blend Protocol (ya en mainnet con TVL)
- Construimos **sobre** Vaquita (ya financiado por SCF)
- No competimos con ninguno — multiplicamos su valor

### El pitch en 3 párrafos

> **El problema:** Trustless Work, Blend, y Vaquita tienen usuarios activos en Stellar haciendo cosas financieras reales. Pero ese historial está silado — completar un escrow en Trustless Work no te ayuda a obtener mejores condiciones en Blend.
>
> **La solución:** ZCore es la capa de scoring portable que lee eventos verificados de todas esas plataformas y construye un historial crediticio que el usuario puede presentar en cualquier protocolo de lending integrado. Una persona que completó 6 ciclos de tanda en Vaquita y 4 escrows en Trustless Work tiene prueba on-chain de que es confiable con el dinero.
>
> **El resultado:** Cada plataforma del ecosistema Stellar hace a sus usuarios más crediticios. Los usuarios tienen razón para permanecer en el ecosistema y volver. ZCore es la capa de confianza que hace que Stellar sea más atractivo para lending sub-colateralizado.

### Milestones para el SCF

- M1: Integración con Trustless Work funcionando en testnet
- M2: Integración con Blend funcionando en testnet
- M3: Primer lender usando score en decisiones reales
- M4: 50+ usuarios con score > 100 en mainnet
- M5: Integración con Vaquita

---

## 10. Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Partners (TW, Blend) no quieren integrar | Media | Alto | Hablar con ellos ANTES de escribir el código de integración. Si dicen no, pivotar antes de invertir tiempo |
| Pocos eventos → score inútil | Alta (al inicio) | Alto | Empezar con Blend (ya tiene $80M TVL y usuarios reales). Score útil desde el primer evento |
| Gaming / Sybil attacks | Media | Alto | Defensa multicapa: txHash único, capital real en juego, análisis de contrapartes repetidas |
| Blend construye su propio scoring | Baja | Alto | Diferenciador: ZCore es cross-platform. Blend solo ve sus datos; ZCore ve Blend + Trustless Work + Vaquita |
| Score inútil si no hay lenders | Alta (al inicio) | Alto | Resolver simultáneo: hablar con lender potencial en paralelo con integración de partners |
| Regulación de credit scoring | Media | Medio | ZCore provee datos, no toma decisiones. El lender decide. Disclaimer claro en cada score response |

---

## 11. Plan de 8 semanas

### Semana 1 — Conversaciones (sin código)

- [ ] Contactar equipo de Trustless Work: ¿dispuestos a llamar webhook de ZCore cuando se completa un escrow?
- [ ] Contactar equipo de Blend: ¿dispuestos a emitir evento cuando usuario repaga?
- [ ] Contactar mínimo 1 lender potencial (protocolo DeFi en Stellar): ¿usarían score de ZCore para ofrecer mejores condiciones?
- [ ] Resultado esperado: confirmación de al menos 1 partner fuente y 1 lender antes de escribir una línea

**Criterio go/no-go:** Si ningún partner confirma interés, reevaluar el modelo antes de avanzar.

---

### Semana 2 — Corregir bugs críticos en el código existente

- [ ] Implementar verificación de firma de wallet en `POST /auth/login` (challenge-response con Stellar keypair)
- [ ] Unificar rango de score a 0-850 en schema, service y documentación
- [ ] Agregar autenticación por API key a todos los endpoints que la requieren
- [ ] Actualizar copy del frontend (quitar referencias a "questionnaire")
- [ ] Migración de DB: cambiar `score` default de 500 a 0

---

### Semana 3 — Nuevos modelos de datos y endpoint central

- [ ] Agregar modelos `CreditEvent` y `Platform` a `schema.prisma`
- [ ] Ejecutar migración de Prisma
- [ ] Implementar `POST /api/events/report` con:
  - Validación de API key de partner
  - Verificación de txHash en Stellar Horizon
  - Cálculo de scoreImpact con EVENT_WEIGHTS
  - Análisis de contraparte repetida (basic)
  - Transacción atómica: crear evento + actualizar score
- [ ] Schema Zod para el payload de eventos
- [ ] Tests unitarios del scoring de eventos

---

### Semana 4 — Integración Trustless Work (testnet)

- [ ] Implementar `POST /api/platforms/register` (admin)
- [ ] Registrar Trustless Work como partner en el sistema
- [ ] Hacer prueba completa en testnet:
  1. Alice crea escrow en Trustless Work por $100 USDC
  2. Bob completa el trabajo
  3. Alice libera el escrow
  4. Trustless Work llama `POST /api/events/report` con el txHash
  5. ZCore verifica en Stellar Horizon
  6. Score de Alice se actualiza
- [ ] Documentar el flujo de integración para Trustless Work en Swagger

---

### Semana 5 — Integración Blend Protocol (testnet)

- [ ] Mismo proceso que semana 4 para Blend
- [ ] Mapear qué tipo de transacción en Stellar corresponde a un repago en Blend
- [ ] Probar el loop completo: repagar en Blend → score sube en ZCore → score visible para lenders

---

### Semana 6 — Endpoints de consulta + scoring refinado

- [ ] Implementar `GET /api/user/{wallet}/score` (para lenders)
- [ ] Implementar `GET /api/user/{wallet}/history` (para usuarios)
- [ ] Refinar los pesos del scoring con datos reales de testnet
- [ ] Implementar multiplicadores (comportamiento consistente, multi-plataforma)
- [ ] Actualizar `GET /api/user/{wallet}/profile` para incluir breakdown de score

---

### Semana 7 — Frontend básico actualizado

- [ ] Actualizar landing page: nueva propuesta de valor (eliminar referencias a cuestionario)
- [ ] Crear vista de historial de crédito en dashboard: lista de eventos con plataforma, monto, score impact
- [ ] Crear vista de score actual con breakdown (Stellar Base + Eventos)
- [ ] Integrar con nuevos endpoints del backend

---

### Semana 8 — SCF submission + preparación para mainnet

- [ ] Draft completo de submission al SCF Integration Track
- [ ] Documentar guía de integración para plataformas partner (cómo llamar el webhook)
- [ ] Documentar guía para lenders (cómo consultar score y configurar perfiles)
- [ ] Revisión de seguridad: rate limiting, validaciones, manejo de errores
- [ ] Deploy en testnet de Stellar para demos

---

## 12. Métricas de éxito

### Técnicas (semanas 1-8)
- Score actualiza correctamente desde eventos de Trustless Work en testnet
- Score actualiza correctamente desde eventos de Blend en testnet
- Tiempo de verificación de txHash < 3 segundos
- txHash duplicado rechazado correctamente
- Score se calcula consistentemente (mismo input = mismo output)

### De adopción (meses 2-6)
- Al menos 2 plataformas partner activas en mainnet
- Al menos 1 lender consultando scores activamente
- 50+ usuarios con score > 100 construido desde eventos reales
- Al menos 1 préstamo aprobado usando score de ZCore

### De negocio (mes 6+)
- SCF Integration Track aprobado y financiado
- MRR > $0 (aunque sea un lender en plan freemium)
- Data: ¿el score de ZCore predice defaults mejor que colateral puro?

---

## 13. El momento mágico del producto

El momento mágico es el instante en que el usuario **siente** el valor por primera vez.

Para ZCore Modelo B, ese momento es:

> *Alice lleva 3 meses haciendo trabajos freelance a través de Trustless Work. Nunca falló en entregar ni en completar un escrow. Un día va a Blend, consulta su score en ZCore: 340 puntos. Blend le ofrece un préstamo de $800 con solo 110% de colateral en vez del 150% estándar — porque su historial en Trustless Work lo respalda.*

Ese es el pitch central. No el score en sí. **El score le abre puertas que antes estaban cerradas.**

Todo el producto debe construirse hacia ese momento.

---

## Apéndice: Tabla resumen de cambios al codebase

| Archivo | Acción | Qué cambia |
|---|---|---|
| `Server/prisma/schema.prisma` | MODIFICAR | Agregar `CreditEvent`, `Platform`. Cambiar `User.score` default a 0. Renombrar `questionnaire` a `stellarData` |
| `Server/src/services/scoring.service.ts` | MODIFICAR | Renombrar `calculateStellarOnlyScore` a `calculateStellarBase`. Agregar `calculateEventScore()` y `applyCounterpartyDecay()` |
| `Server/src/services/payment.service.ts` | MODIFICAR | Migrar a usar el nuevo sistema de eventos |
| `Server/src/controllers/auth.controller.ts` | MODIFICAR | Score inicial = solo Score Base Stellar (0-150) |
| `Server/src/controllers/events.controller.ts` | CREAR | Handler para `POST /api/events/report` |
| `Server/src/controllers/platforms.controller.ts` | CREAR | Handler para `POST /api/platforms/register` |
| `Server/src/routes/events.routes.ts` | CREAR | Rutas de eventos |
| `Server/src/routes/index.ts` | MODIFICAR | Agregar rutas de eventos y plataformas |
| `Server/src/middleware/schemas.ts` | MODIFICAR | Agregar schema Zod para evento de crédito |
| `Server/src/types/index.ts` | MODIFICAR | Agregar tipos `CreditEventPayload`, `PlatformEvent` |
| `Front/app/page.tsx` | MODIFICAR | Actualizar copy: quitar "questionnaire", nueva propuesta de valor |
| `Front/app/dashboard/page.tsx` | MODIFICAR | Agregar vista de historial de crédito |
| `Front/lib/api-client.ts` | MODIFICAR | Agregar calls a `/score` y `/history` |

---

*Documento generado a partir de análisis completo del codebase ZCore, el stellar-product-playbook.md, y sesión de redirección estratégica — Junio 2026.*
*Próxima revisión: al cierre de semana 2 (después de conversaciones con partners).*
