# ZCore Frontend — Contexto completo para issues

> Este documento es para el repositorio de la landing/frontend de ZCore.  
> Contiene todo lo necesario para entender el producto, el estado actual del código, y qué hay que construir.

---

## 1. Qué es ZCore (Modelo B)

ZCore es una **capa de scoring crediticio portable para Stellar DeFi**. Convierte eventos de pago verificados on-chain en un historial crediticio que cualquier protocolo de lending puede consultar.

```
PLATAFORMAS PARTNER        ZCORE API               LENDERS
──────────────────         ─────────               ───────
Trustless Work   ────►  verifica txHash  ────►  GET /score
Blend Protocol   ────►  calcula impacto  ────►  mejores tasas
Vaquita          ────►  actualiza score  ────►  menos colateral
```

**ZCore NO presta dinero, NO custodia fondos.** Responde una pregunta: *"¿Esta persona ha sido confiable con el dinero en Stellar?"*

### Sistema de score (0–850)

```
Score Total = Stellar Base (0–150) + Eventos de Partners (0–700)
```

| Componente | Puntos máx | Fuente |
|---|---|---|
| Antigüedad de wallet | 40 | Stellar Horizon |
| Actividad transaccional | 60 | Stellar Horizon |
| Tasa de éxito de txs | 30 | Stellar Horizon |
| Balance XLM | 20 | Stellar Horizon |
| Escrow completado | 60 por evento | Trustless Work |
| Préstamo repagado | 80 por evento | Blend Protocol |
| Ronda de tanda pagada | 30 por evento | Vaquita |
| Ciclo de tanda completo | 100 por evento | Vaquita |

### Tiers

| Tier | Score | Límite típico | Tasa típica |
|---|---|---|---|
| A | 600–850 | $10,000+ | 8–12% |
| B | 350–599 | $2,000–$10,000 | 12–18% |
| C | 100–349 | $200–$2,000 | 18–25% |
| REJECTED | 0–99 | Sin acceso | — |

---

## 2. API del backend (referencia completa)

**Base URL:** `http://localhost:3000` (dev) / producción TBD

### Endpoints de usuario

#### `POST /api/auth/register`
Registra un usuario solo con su wallet Stellar. El backend verifica la wallet en Stellar Horizon y calcula el score base automáticamente.

**Request:**
```json
{ "walletAddress": "GAYR3DYYONOZMFQT5KA7VO4LHMDWEDMVOFXONGEPPLQAL5ZWQQXYAJUP" }
```
**Response 201:**
```json
{ "success": true, "message": "User registered successfully", "data": { "score": 87 } }
```
**Response 200** (si ya existe):
```json
{ "success": true, "message": "User already registered", "data": { "score": 87 } }
```
**Response 400** (wallet inválida o no existe en Stellar):
```json
{ "success": false, "error": "Invalid Stellar wallet address" }
```

#### `POST /api/auth/login`
Login con wallet. **No hay JWT, no hay email, no hay password.** Solo busca la wallet en DB y devuelve el score.

**Request:**
```json
{ "walletAddress": "GAYR3DYYONOZMFQT5KA7VO4LHMDWEDMVOFXONGEPPLQAL5ZWQQXYAJUP" }
```
**Response 200:**
```json
{ "success": true, "data": { "score": 87 } }
```
**Response 404:**
```json
{ "success": false, "error": "User not found" }
```

#### `GET /api/user/{wallet}/score`
Score completo con breakdown. Pensado para que los lenders lo consulten.

**Response 200:**
```json
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
    "lastUpdated": "2026-06-17T10:00:00Z"
  }
}
```

#### `GET /api/user/{wallet}/history`
Historial de eventos de crédito del usuario.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "eventId": "uuid",
        "platform": "Trustless Work",
        "eventType": "escrow_completed",
        "amount": 500,
        "currency": "USDC",
        "scoreImpact": 22,
        "txHash": "abc123...",
        "date": "2026-06-10"
      }
    ],
    "totalPositive": 320,
    "totalNegative": 0
  }
}
```

#### `GET /api/user/{wallet}/profile`
Perfil básico del usuario.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "walletAddress": "GAYR3...",
    "score": 387,
    "profileTier": "B",
    "createdAt": "2026-05-01T00:00:00Z",
    "updatedAt": "2026-06-17T10:00:00Z"
  }
}
```

#### `GET /health`
Health check del servidor.

---

## 3. Estado actual del frontend y qué está mal

El frontend fue construido para ZCore v1 y **está desalineado con el backend actual** en varios puntos críticos.

### `Front/app/page.tsx` — Landing page
**Problemas:**
- El paso 1 de "How It Works" dice *"answer a quick questionnaire about your financial activity"* — el cuestionario no existe más en el backend
- No menciona las plataformas partner (Trustless Work, Blend, Vaquita) que son el corazón del producto
- El sistema de score descrito no coincide con el real (0-850, dos fuentes)
- El hero copy no refleja el Modelo B: "portable credit scoring from verified on-chain payments"

### `Front/app/login/page.tsx` — Login
**Problemas críticos:**
- Tiene campos `email` y `password` — **el backend no acepta email ni password**
- El backend solo acepta `{ walletAddress }` para login
- `AuthService.setUser` guarda `email`, `walletAddress`, `fullName` — pero el backend solo devuelve `{ score }`
- No hay JWT: el backend no emite tokens. La "sesión" debe manejarse solo con la wallet address en localStorage

### `Front/app/register/page.tsx` — Register
(Asumir que tiene problema similar al login — probablemente pide email/password o tiene campos extra)

### `Front/app/dashboard/page.tsx` — Dashboard principal
**Problemas:**
- Muestra solo "Request Credit Scoring" (llama a `POST /api/user/request` que requiere `lenderId`)
- No muestra el score del usuario en ningún lado
- No hay vista del historial de crédito
- No tiene breakdown del score (stellarBase vs eventsScore)

### `Front/app/dashboard/payments/page.tsx` — Pagos
**Problemas:**
- Es una página para lenders reportando pagos — pero el flujo correcto es `POST /api/events/report`, no este endpoint viejo
- El placeholder dice `0x...` (formato Ethereum) en vez de dirección Stellar (empieza con G, 56 chars)
- El campo se llama `userWallet` pero el backend espera `walletAddress`

### `Front/lib/auth.ts` — AuthService
**Problemas:**
- Guarda y lee `token` (JWT) — no hay JWT en el backend
- La interfaz `User` tiene `email` y `fullName` — el backend no maneja estos campos
- `isAuthenticated()` basa la sesión en si hay token — debería basarse en si hay `walletAddress` guardada

### `Front/lib/api-client.ts` — API Client
**Problemas:**
- Envía header `Authorization: Bearer {token}` — el backend no valida este header
- Faltan los métodos para los nuevos endpoints: `/score`, `/history`

---

## 4. Stack del frontend

```
Framework:    Next.js 14+ (App Router)
Lenguaje:     TypeScript
UI:           shadcn/ui + Tailwind CSS
Estado:       React useState (local)
Auth:         localStorage (sin JWT, solo wallet address)
```

**Componentes disponibles en `Front/components/`:**
- `auth-guard.tsx` — wrapper que redirige a login si no hay sesión
- `dashboard-nav.tsx` — nav del dashboard
- `api-response-card.tsx` — card que muestra respuestas JSON de la API
- `ui/` — componentes shadcn (button, card, input, label, select, table, textarea, alert)

**Iconos disponibles:** `lucide-react`

---

## 5. Flujos correctos que debe tener el frontend

### Flujo de registro
1. Usuario va a `/register`
2. Ingresa su wallet Stellar (56 chars, empieza con G)
3. Frontend llama `POST /api/auth/register` con `{ walletAddress }`
4. Si éxito → guardar `walletAddress` en localStorage → redirigir a `/dashboard`
5. Si error → mostrar mensaje ("wallet no encontrada en Stellar", etc.)

### Flujo de login
1. Usuario va a `/login`
2. Ingresa su wallet Stellar
3. Frontend llama `POST /api/auth/login` con `{ walletAddress }`
4. Si éxito → guardar `walletAddress` en localStorage → redirigir a `/dashboard`
5. Si 404 → mostrar "Wallet not registered, please register first"

### Dashboard principal (lo que debe mostrar)
- **Score actual** prominente con tier badge (A/B/C/REJECTED)
- **Breakdown** del score: barra dividida entre Stellar Base y Eventos de Partners
- **Últimos eventos** — lista de las últimas 5 entradas del historial
- Botón para ver historial completo

### Vista de historial (`/dashboard/history`)
- Lista paginada de `CreditEvent` con:
  - Plataforma (Trustless Work / Blend / Vaquita)
  - Tipo de evento (escrow completed, loan repaid, etc.)
  - Monto en USDC
  - Score impact (+22, -50, etc.) coloreado en verde/rojo
  - Fecha
  - txHash (con link al explorador de Stellar)

---

## 6. Variables de entorno del frontend

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

---

## 7. Issues a crear en el repo del frontend

### Easy — Good First Issues

**Issue A:** Reemplazar flujo de login de email/password a wallet Stellar  
**Issue B:** Reemplazar flujo de registro para usar solo wallet Stellar  
**Issue C:** Actualizar AuthService para manejar sesión por wallet (sin JWT)  
**Issue D:** Actualizar api-client: agregar métodos para `/score` y `/history`, quitar header Bearer  
**Issue E:** Corregir copy de la landing page (quitar questionnaire, actualizar How It Works)

### Medium

**Issue F:** Construir pantalla principal del dashboard con score y tier del usuario  
**Issue G:** Construir vista de historial de crédito (`/dashboard/history`)  
**Issue H:** Agregar score breakdown visual (barra Stellar Base vs Eventos de Partners)

---

## 8. Notas importantes para contribuidores

1. **No hay JWT.** La autenticación es puramente por wallet address guardada en localStorage. Si existe `walletAddress` en localStorage → usuario autenticado.

2. **El formato de wallet Stellar** es siempre 56 caracteres comenzando con `G`. Usar este regex para validar en el frontend: `/^G[A-Z2-7]{55}$/`

3. **El backend está en otro repo:** [Zcorehub/ZCore-dev](https://github.com/Zcorehub/ZCore-dev). Para correrlo localmente ver el README de ese repo. La URL default es `http://localhost:3000`.

4. **Para probar el score** de un usuario, primero hay que registrarlo con `POST /api/auth/register`. El score inicial viene del análisis automático de la wallet en Stellar Horizon.

5. **Stellar Horizon** es la API pública de Stellar. Las wallets de testnet se crean en [Stellar Laboratory](https://laboratory.stellar.org).
