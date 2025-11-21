# ZCore

Credit Score & Reputación Programable para DeFi y Web3.

> "ZCore es el FICO Score para DeFi: habilita préstamos sub-colateralizados mediante reputación portable, verificable y privada (ZK)."

---

## Elevator Pitch (Resumen)

En DeFi hoy necesitas depositar 150%–200% de colateral porque no existe historial crediticio descentralizado. Eso bloquea miles de millones y frena adopción. ZCore provee una API que entrega en milisegundos: score del usuario, límite recomendado y nivel de riesgo. Cada pago confirmado on-chain actualiza su reputación; buenos pagadores obtienen mejores condiciones en cualquier protocolo integrado. Usamos Zero-Knowledge Proofs para validar umbrales (ej. "score > 700") sin revelar datos sensibles.

**Estado Actual:** MVP Backend implementado con API REST funcional, base de datos MySQL, y documentación Swagger.

---

## Qué es ZCore

Infraestructura de scoring y reputación crediticia para protocolos de lending y productos financieros Web3. No prestamos dinero: somos middleware de evaluación y registro.

### Roles

- **Protocolo DeFi (Cliente B2B):** Consulta score, registra préstamos y pagos.
- **Prestatario:** Usuario que solicita crédito en DeFi.
- **Prestamista / Liquidez:** Pool o usuario que aporta capital.

---

## Arquitectura Lógica

```
DeFi Protocol ──> ZCore API ──> Servicios internos ──> DB / Blockchain / ZK
                      │
                      ├─ Scoring Service
                      ├─ Credit & Limit Service
                      ├─ Transaction & Payment Service
                      ├─ Reputation Engine (reglas dinámicas)
                      ├─ Identity/KYC Service
                      ├─ ZK Proof Module
                      └─ Audit & Logging (on/off-chain)
```

### Servicios Clave

| Servicio            | Función                                                  |
| ------------------- | -------------------------------------------------------- |
| Scoring Service     | Calcular score inicial y dinámico (300–850).             |
| Credit Service      | Recomendar límites y ajustar exposición.                 |
| Transaction Service | Registro de préstamos y movimientos.                     |
| Payment Service     | Procesar pagos registrados / verificados on-chain.       |
| Reputation Engine   | Aplicar reglas (+/- puntos por eventos).                 |
| ZK Proof Module     | Generar/verificar pruebas de umbral y solvencia privada. |
| Identity Service    | Wallet binding, firma, KYC opcional.                     |
| Audit Service       | Trazabilidad inmutable (logs + opcional blockchain).     |

---

## Flujo Básico

1. Usuario se registra con `POST /api/auth/register` proporcionando wallet y cuestionario.
2. Sistema calcula score inicial y asigna tier (A/B/C).
3. Usuario solicita préstamo con `POST /api/user/request` especificando prestamista y monto.
4. Sistema evalúa elegibilidad basado en score vs perfiles del prestamista.
5. Prestamista puede reportar pagos con `POST /api/payment/report`.
6. Sistema actualiza score dinámicamente (+10 pago, -30 default).
7. Futuras solicitudes obtienen mejores/peores condiciones según historial.

---

## Reglas de Score Dinámico (Implementado)

### Score Inicial (300-850)

Basado en cuestionario de 5 variables:

- **walletAge** (meses) × 0.2
- **averageBalance** × 0.0001
- **transactionCount** × 0.1
- **defiInteractions** × 5.0
- **monthlyIncome** × 0.0005

### Tiers Automáticos

- **Tier A:** Score ≥ 750 (Premium)
- **Tier B:** Score 650-749 (Intermedio)
- **Tier C:** Score 300-649 (Básico)

### Actualización por Pagos

- **Pago exitoso:** +10 puntos
- **Default:** -30 puntos

---

## Endpoints (Implementados)

### Autenticación

- `POST /api/auth/register` – Registrar usuario con cuestionario
- `POST /api/auth/login` – Login de usuario existente

### Usuarios

- `POST /api/user/request` – Solicitar evaluación de scoring
- `GET /api/user/{wallet}/profile` – Obtener perfil del usuario

### Prestamistas

- `POST /api/lender/profiles` – Definir perfiles de riesgo

### Pagos

- `POST /api/payment/report` – Reportar pago o default

### Documentación

- `GET /api-docs` – Interfaz Swagger UI
- `GET /api-docs.json` – OpenAPI JSON spec

**Nota:** Todos los endpoints están documentados y probables en Swagger UI en `/api-docs`

---

## Seguridad & Validación

- Validación de esquemas con Zod en todos los endpoints.
- Manejo centralizado de errores con middleware dedicado.
- Estructura de respuesta consistente con success/error.
- Tipos TypeScript estrictos para type safety.
- Prisma ORM para queries seguras y prevención de SQL injection.

---

## Ventajas vs Desafíos

### Ventajas

- Sistema de scoring transparente y auditable.
- API REST simple y bien documentada.
- Actualización dinámica de reputación basada en comportamiento.
- Flexibilidad para prestamistas (perfiles personalizados).
- Arquitectura modular preparada para extensiones futuras.

### Desafíos Futuros

- Integración con datos on-chain reales.
- Prevención de manipulación y ataques Sybil.
- Escalabilidad para múltiples blockchains.
- Cumplimiento regulatorio en diferentes jurisdicciones.

---

## Fases de Implementación

| Fase                | Objetivo                           | Alcance                                                                                                                                 |
| ------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 1. MVP Hackathon    | ZK + API núcleo                    | API básica (score inicial, límite provisional), prototipo ZK (prueba score > X), registro mínimo de pagos simulado, sin dashboard ni ML |
| 2. Integración DeFi | Primeros partners reales           | Webhooks, dashboard inicial, documentación pública                                                                                      |
| 3. ZK Layer         | Privacidad y verificación avanzada | ZK proofs adicionales (solvencia, historial agregado), optimización circuitos                                                           |
| 4. Legal & Identity | Responsabilidad formal             | KYC, firma electrónica, contratos legales, trazabilidad ampliada                                                                        |
| 5. Escalabilidad    | Multi-chain + ML                   | Adaptadores multi-chain, modelos predictivos, tuning de riesgo                                                                          |

### Estado Actual del MVP

**✅ Completado:**

1. API REST completa con 6 endpoints funcionales
2. Base de datos MySQL con 4 modelos (User, Lender, Request, Payment)
3. Sistema de scoring con 5 variables y actualización dinámica
4. Clasificación automática en tiers A/B/C
5. Documentación Swagger interactiva completa
6. Validaciones Zod y middleware de errores
7. Configuración de prestamistas con perfiles personalizados
8. Evaluación de elegibilidad automática

**🚧 En Desarrollo:**

1. Integración blockchain para verificación de pagos
2. Circuitos ZK para pruebas de scoring privado
3. Frontend/dashboard para prestamistas

**📋 Roadmap:**

1. Integración on-chain (smart contracts + listeners)
2. Implementación ZK proofs
3. Dashboard web
4. Testing e2e
5. Despliegue producción

---

## Ejemplo de Pago (Webhook Simplificado)

```json
POST /pago
{
  "userId": "0x123...",
  "monto": 5000,
  "txHash": "0xabc...",
  "defiPlatform": "MyDeFi",
  "fechaPago": "2025-11-20T10:30:00Z"
}
```

Respuesta:

```json
{
  "success": true,
  "nuevoScore": 760,
  "limiteActualizado": 10500
}
```

---

## Stack Tecnológico

### Implementado

- **Backend:** Node.js + Express + TypeScript
- **DB:** MySQL + Prisma ORM
- **Documentación:** Swagger/OpenAPI 3.0
- **Validación:** Zod schemas
- **Dev Tools:** nodemon, ts-node

### Próximas Fases

- **Blockchain:** Ethereum / Polygon + listeners
- **ZK:** Circom + snarkjs (zk-SNARKs)
- **Cache:** Redis para scores
- **Infra:** Docker, CI/CD GitHub Actions
- **Auth:** JWT + firmas de wallet (EIP-4361)

---

## Desarrollo Local

### Prerrequisitos

- Node.js 16+
- MySQL 8.0+
- Git

### Configuración

1. **Clonar repositorio:**

   ```bash
   git clone https://github.com/Zcorehub/ZCore-dev.git
   cd ZCore-dev/Server
   ```

2. **Instalar dependencias:**

   ```bash
   npm install
   ```

3. **Configurar base de datos:**

   ```bash
   # Crear base de datos MySQL
   mysql -u root -p -e "CREATE DATABASE zcore;"

   # Copiar variables de entorno
   cp .env.example .env

   # Editar .env con tus credenciales MySQL
   # DATABASE_URL="mysql://user:password@localhost:3306/zcore"
   ```

4. **Ejecutar migraciones:**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Iniciar servidor de desarrollo:**

   ```bash
   npm run dev
   ```

6. **Acceder a la API:**
   - API: http://localhost:3000/api
   - Swagger UI: http://localhost:3000/api-docs

### Inicio Rápido

```bash
# Clonar e instalar
git clone https://github.com/Zcorehub/ZCore-dev.git
cd ZCore-dev/Server
npm install

# Configurar MySQL y variables de entorno
mysql -u root -p -e "CREATE DATABASE zcore;"
cp .env.example .env
# Editar .env con tus credenciales MySQL

# Inicializar base de datos y correr
npx prisma generate
npm run prisma:migrate -- --name init
npm run dev

# Probar endpoints en Swagger UI
# http://localhost:3000/api-docs
```

### Scripts Disponibles

- `npm run dev` – Servidor de desarrollo con recarga automática
- `npm run build` – Compilar TypeScript
- `npm start` – Ejecutar servidor compilado
- `npm run prisma:generate` – Generar cliente Prisma
- `npm run prisma:migrate` – Aplicar migraciones
- `npm run prisma:studio` – Abrir Prisma Studio

---

## Métricas Clave (Tracking Futuro)

- Accuracy y drift del modelo de score.
- Default rate antes vs después de integración.
- Latencia promedio de actualización post-pago.
- % préstamos con colateral reducido.

---

## Contribución

1. Fork / branch feature.
2. Cambios mínimos y enfocados.
3. Pull Request con descripción clara (impacto + verificación).
4. No incluir datos sensibles en ejemplos.

---

## Visión

Estándar de reputación crediticia descentralizada multi-chain: interoperable, privado, auditado y portable. Capa de confianza universal para Web3 y puente hacia productos TradFi.

---

## Contacto (Placeholder)

- Email: team@zcore.finance
- Twitter: @ZCore_Finance

---

## Licencia

(Definir más adelante — MIT / Apache 2.0 sugerido para adopción temprana.)

---

## Nota

Este README es un resumen operativo; para detalle profundo ver `Docs/arquitectura_zcore.md` y `Docs/ElevatorPitch.md`.
