# Planeación para el Backend ZCore (sin contratos inteligentes)

## Objetivo

Levantar el backend de la API ZCore con toda la lógica y endpoints posibles, sin requerir contratos inteligentes ni integración blockchain. Esto permite pruebas locales, integración con plataformas DeFi y desarrollo incremental.

---

## Alcance de esta fase

- Todo el backend Node.js/TypeScript
- Endpoints REST y lógica de negocio
- Base de datos (MySQL/Prisma)
- Validaciones, autenticación, perfiles, scoring simulado
- Sin interacción real con blockchain ni ZK proofs

---

## Endpoints a implementar

- `POST /registro` — Registro de usuario y cuestionario
- `POST /login` — Autenticación de wallet (simulada)
- `POST /solicitud` — Solicitud de scoring (simulado, genera perfil)
- `GET /usuario/{wallet}/perfil` — Consulta de perfil asignado
- `POST /pago` — Reporte de pago o default por prestamista
- `POST /perfiles` — Definición de perfiles de riesgo por prestamista

---

## Tareas técnicas detalladas

### 1. Inicialización del proyecto

**Archivos a crear:**

- `Server/package.json` — Configuración del proyecto con dependencias
- `Server/tsconfig.json` — Configuración de TypeScript
- `Server/.env.example` — Variables de entorno de ejemplo
- `Server/.gitignore` — Archivos a ignorar

**Dependencias a instalar:**

```bash
# Producción
npm install express cors dotenv zod @prisma/client swagger-jsdoc swagger-ui-express

# Desarrollo
npm install -D typescript @types/node @types/express @types/cors @types/swagger-jsdoc @types/swagger-ui-express ts-node nodemon prisma
```

---

### 2. Estructura de carpetas

```
Server/
├── src/
│   ├── index.ts              # Punto de entrada + Swagger setup
│   ├── config/
│   │   ├── database.ts       # Configuración Prisma
│   │   └── swagger.ts        # Configuración Swagger
│   ├── routes/
│   │   ├── index.ts          # Router principal
│   │   ├── auth.routes.ts    # Rutas de autenticación
│   │   ├── user.routes.ts    # Rutas de usuario
│   │   ├── lender.routes.ts  # Rutas de prestamista
│   │   └── payment.routes.ts # Rutas de pagos
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── lender.controller.ts
│   │   └── payment.controller.ts
│   ├── services/
│   │   ├── scoring.service.ts    # Lógica de scoring
│   │   ├── profile.service.ts    # Lógica de perfiles
│   │   └── payment.service.ts    # Lógica de pagos
│   ├── middleware/
│   │   ├── validation.middleware.ts
│   │   ├── schemas.ts            # Schemas Zod
│   │   └── error.middleware.ts
│   └── types/
│       └── index.ts          # Tipos TypeScript
├── prisma/
│   └── schema.prisma         # Schema de base de datos
└── package.json
```

---

### 3. Modelado de base de datos (Prisma Schema)

**Archivo: `Server/prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id              String        @id @default(uuid())
  walletAddress   String        @unique
  score           Int           @default(500)
  profileTier     String        @default("C") // A, B, C
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  questionnaire   Json?
  requests        Request[]
  payments        Payment[]
  @@index([walletAddress])
}

model Lender {
  id              String        @id @default(uuid())
  name            String
  apiKey          String        @unique
  profiles        Json          // [{ tier, minScore, maxAmount, rate }]
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  requests        Request[]
  payments        Payment[]
  @@index([apiKey])
}

model Request {
  id              String        @id @default(uuid())
  userId          String
  lenderId        String
  profileAssigned String        // A, B, C
  maxAmount       Float
  requestedAmount Float
  status          String        // pending, approved, rejected
  createdAt       DateTime      @default(now())
  user            User          @relation(fields: [userId], references: [id])
  lender          Lender        @relation(fields: [lenderId], references: [id])
  @@index([userId, lenderId])
}

model Payment {
  id              String        @id @default(uuid())
  userId          String
  lenderId        String
  requestId       String?
  amount          Float
  status          String        // paid, defaulted
  paymentDate     DateTime
  createdAt       DateTime      @default(now())
  user            User          @relation(fields: [userId], references: [id])
  lender          Lender        @relation(fields: [lenderId], references: [id])
  @@index([userId, lenderId, status])
}
```

---

### 4. Configuración de Swagger

**Archivo: `Server/src/config/swagger.ts`**

```typescript
import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ZCore API",
      version: "1.0.0",
      description: "API middleware de scoring para plataformas DeFi",
      contact: {
        name: "ZCore Team",
        url: "https://zcore.dev",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      schemas: {
        User: {
          type: "object",
          properties: {
            walletAddress: { type: "string" },
            profileTier: { type: "string", enum: ["A", "B", "C"] },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: { type: "string" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
```

---

### 5. Endpoints implementados con Swagger

#### **POST /api/auth/register**

- Registra usuario con wallet y cuestionario
- Calcula score inicial (simulado)
- Asigna perfil inicial (A/B/C)
- **Request:** `{ walletAddress, questionnaire }`
- **Response:** `{ success, message, profileTier }`
- **Swagger annotations en controller**

#### **POST /api/auth/login**

- Autenticación simulada por wallet
- **Request:** `{ walletAddress }`
- **Response:** `{ success, token, profileTier }`

#### **POST /api/user/request**

- Usuario solicita scoring
- Evalúa score vs perfiles del prestamista
- **Request:** `{ walletAddress, lenderId, requestedAmount }`
- **Response:** `{ eligible, profileAssigned, maxAmount }`

#### **GET /api/user/:wallet/profile**

- Consulta perfil asignado del usuario
- **Response:** `{ walletAddress, profileTier, createdAt }`

#### **POST /api/lender/profiles**

- Prestamista define perfiles de riesgo
- **Request:** `{ apiKey, profiles: [{ tier, minScore, maxAmount, rate }] }`
- **Response:** `{ success, message }`

#### **POST /api/payment/report**

- Prestamista reporta pago o default
- Actualiza score y perfil
- **Request:** `{ apiKey, walletAddress, amount, status, paymentDate }`
- **Response:** `{ success, newProfileTier }`

---

### 6. Lógica de negocio (Services)

**scoring.service.ts:**

- `calculateInitialScore(questionnaire)` — Calcula score 300-850
- `updateScoreFromPayment(userId, status)` — +10 si pagó, -30 si default
- `assignProfileTier(score)` — Asigna A (750+), B (650+), C (500+)

**profile.service.ts:**

- `getUserProfile(walletAddress)` — Obtiene perfil sin score
- `evaluateEligibility(score, lenderProfiles, amount)` — Retorna perfil y monto máximo

**payment.service.ts:**

- `recordPayment(data)` — Registra pago y actualiza score

---

### 7. Validaciones (Zod)

**Schemas de validación en `middleware/schemas.ts`:**

- `RegisterSchema` — wallet + questionnaire
- `LoginSchema` — wallet
- `RequestSchema` — wallet + lenderId + amount
- `ProfileSchema` — perfiles array
- `PaymentSchema` — payment data

---

### 8. Integración Swagger en index.ts

**Archivo: `Server/src/index.ts`**

```typescript
import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import routes from "./routes";

const app = express();
app.use(express.json());

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rutas
app.use("/api", routes);

// Ruta para spec JSON
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
});
```

---

### 9. Scripts npm

**package.json scripts:**

```json
{
  "dev": "nodemon src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js",
  "prisma:generate": "prisma generate",
  "prisma:migrate": "prisma migrate dev",
  "prisma:studio": "prisma studio"
}
```

---

### 10. Testing con Swagger

- Acceder a `http://localhost:3000/api-docs`
- Probar todos los endpoints desde la UI de Swagger
- Validar respuestas y códigos de error
- Exportar colección de Postman desde Swagger spec

---

## Pasos para ejecución local

1. `cd Server`
2. `npm install`
3. `npx prisma generate`
4. Configura tus variables en `.env` basadas en `.env.example`
5. Levanta MySQL local (ej. MySQL 8.x) y actualiza `DATABASE_URL` (ejemplo: `mysql://user:password@localhost:3306/zcore`)
6. Ejecuta migraciones: `npm run prisma:migrate -- --name init`
7. Inicia el servidor: `npm run dev`
8. Abre `http://localhost:3000/api-docs` para probar los endpoints

---

## Exclusiones de esta fase

- No se implementa interacción real con blockchain
- No se generan ni validan ZK proofs
- No se expone score numérico al usuario
- No se implementa frontend (solo endpoints y lógica)

---

## Siguiente fase

- Integrar contratos inteligentes y lógica blockchain
- Implementar generación y verificación de ZK proofs
- Conectar scoring real y publicación on-chain

---

> **Nota:** Esta planeación permite levantar y probar toda la API y lógica de negocio, facilitando la integración temprana con prestamistas y el desarrollo incremental hacia la versión blockchain/ZK.
