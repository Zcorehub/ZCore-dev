# Arquitectura ZCore - API de Scoring y Reputación Crediticia

## Modelo de Negocio

**ZCore es una API de scoring y gestión de reputación crediticia** que actúa como middleware entre plataformas DeFi y usuarios finales.

### 🎯 Posicionamiento

**Clientes de ZCore:** Plataformas DeFi (protocolos de préstamos descentralizados)

**Usuarios finales:**

- **Prestamistas:** Los usuarios de DeFi con capital (o la misma pool de liquidez DeFi)
- **Prestatarios:** Usuarios que solicitan crédito

**Modelo:** ZCore NO presta dinero. Provee infraestructura de scoring y reputación.

---

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────┐
│              Plataforma DeFi                    │
│         (Aave, Compound, Custom)                │
└────────────┬────────────────────────────────────┘
             │
             │ Consulta API
             ▼
┌─────────────────────────────────────────────────┐
│                   ZCore API                     │
│  ┌──────────────────────────────────────────┐  │
│  │  • Motor de Scoring Dinámico             │  │
│  │  • Sistema de Reputación Verificable     │  │
│  │  • Registro de Historial Crediticio      │  │
│  │  • Validación con ZK Proofs              │  │
│  │  • Cálculo de Límites de Crédito         │  │
│  │  • Track de Pagos/Defaults               │  │
│  │  • Análisis de Riesgo                    │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
             │
             │ Datos del usuario
             ▼
┌─────────────────────────────────────────────────┐
│         Prestatario (Usuario Final)             │
└─────────────────────────────────────────────────┘
```

---

## Servicios Clave de ZCore

### 1. **Scoring Service**

Evalúa la creditworthiness del usuario basado en:

- Historial de pagos
- Ratio de utilización de crédito
- Antigüedad de la cuenta
- Diversidad de operaciones
- Comportamiento en múltiples plataformas

### 2. **Credit Service**

Calcula y sugiere límites de crédito para cada usuario:

- Límite máximo recomendado
- Nivel de riesgo
- Condiciones sugeridas

### 3. **Transaction Service**

Registra todas las operaciones:

- Solicitudes de préstamo
- Desembolsos
- Pagos parciales/totales
- Defaults

### 4. **Payment Service**

Track del comportamiento de pago:

- Pagos a tiempo
- Pagos adelantados
- Pagos tardíos
- Incumplimientos

### 5. **Reputation Service**

Score dinámico que se ajusta en tiempo real:

- Pago a tiempo: +10 puntos
- Pago adelantado: +15 puntos
- Pago tarde: -20 puntos
- No pago: -30 puntos
- Bajo uso del límite: +5 puntos
- Uso constante del 100%: -5 puntos

### 6. **ZK Proof Service**

Validaciones con privacidad:

- Verificar solvencia sin revelar datos
- Probar score mínimo sin exponer valor exacto
- Demostrar historial sin mostrar detalles

### 7. **Identity Service**

Gestión de identidad verificable:

- KYC básico
- Verificación de wallet
- Firma electrónica
- Vinculación cross-platform

### 8. **Audit Service**

Registro inmutable de eventos:

- Blockchain registry opcional
- Logs de todas las operaciones
- Trazabilidad completa

---

## Flujo de Uso

### 1️⃣ Solicitud de Préstamo

```
Usuario → DeFi Platform → ZCore API
                          ↓
                    GET /score/{userId}
                    GET /credito/limite/{userId}
                    GET /historial/{userId}
```

### 2️⃣ Respuesta de ZCore

```json
{
  "userId": "0x123...",
  "score": 750,
  "limiteRecomendado": 10000,
  "nivelRiesgo": "bajo",
  "historial": {
    "prestamosAnteriores": 5,
    "pagosATiempo": 4,
    "defaults": 0
  },
  "zkProof": "0xabc..."
}
```

### 3️⃣ DeFi Toma Decisión

La plataforma DeFi decide:

- Si aprueba el préstamo
- Cuánto prestar
- Qué tasa de interés aplicar

### 4️⃣ Notificación de Eventos

```
DeFi → ZCore
POST /transaccion
{
  "userId": "0x123...",
  "tipo": "prestamo",
  "monto": 5000,
  "fecha": "2025-11-20"
}
```

### 5️⃣ Actualización de Score

ZCore actualiza automáticamente:

- Score del usuario
- Límite disponible
- Historial
- Reputación

### 6️⃣ Próximo Préstamo

Usuario tiene mejor/peor reputación para futuras solicitudes en cualquier plataforma DeFi integrada.

---

## Flujo de Pagos: ¿Cómo se registran?

### 🔄 Proceso de Registro de Pagos

**Importante:** ZCore NO maneja el dinero. Solo registra eventos de pago que ocurren en la DeFi.

### Opción 1: Webhooks de DeFi → ZCore (Recomendado)

```
┌─────────────────────────────────────────────────────────────┐
│  1. Usuario paga préstamo directamente al smart contract    │
│     de la DeFi (on-chain)                                    │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Smart Contract emite evento PaymentReceived              │
│     event PaymentReceived(address user, uint amount, ...)    │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  3. DeFi Backend escucha evento on-chain                     │
│     (usando ethers.js, web3.py, o similar)                   │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  4. DeFi Backend notifica a ZCore vía webhook                │
│     POST https://api.zcore.com/pago                          │
│     {                                                         │
│       "userId": "0x123...",                                   │
│       "monto": 5000,                                          │
│       "fechaPago": "2025-11-20T10:30:00Z",                   │
│       "txHash": "0xabc...",                                   │
│       "defiPlatform": "MyDeFi",                              │
│       "apiKey": "secret_key_123"                             │
│     }                                                         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  5. ZCore verifica el pago on-chain                          │
│     - Consulta el txHash en blockchain                       │
│     - Valida que el monto sea correcto                       │
│     - Confirma que el destinatario es correcto               │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  6. ZCore actualiza el score del usuario                     │
│     - Registra el pago en la base de datos                   │
│     - Actualiza score (+10 puntos por pago a tiempo)         │
│     - Actualiza límite disponible                            │
│     - Guarda evento en audit log                             │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  7. ZCore responde a la DeFi                                 │
│     {                                                         │
│       "success": true,                                        │
│       "nuevoScore": 760,                                      │
│       "limiteActualizado": 10500                             │
│     }                                                         │
└─────────────────────────────────────────────────────────────┘
```

### Opción 2: ZCore Escucha Blockchain Directamente (Avanzado)

```
┌─────────────────────────────────────────────────────────────┐
│  1. Usuario paga préstamo en smart contract de DeFi          │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Smart Contract emite evento PaymentReceived              │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  3. ZCore Event Listener (propio) detecta evento             │
│     - ZCore corre nodos o usa servicios como Alchemy         │
│     - Escucha contratos registrados de DeFi partners         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  4. ZCore procesa automáticamente                            │
│     - Verifica evento                                        │
│     - Actualiza score                                        │
│     - NO necesita llamada de la DeFi                         │
└─────────────────────────────────────────────────────────────┘
```

**Ventajas Opción 2:**

- ✅ Más descentralizado
- ✅ No depende de que la DeFi nos notifique
- ✅ Podemos detectar pagos de cualquier DeFi registrada

**Desventajas Opción 2:**

- ❌ Más costoso (infraestructura de nodos)
- ❌ Mayor complejidad técnica
- ❌ Necesitamos conocer todos los contratos de antemano

### Opción 3: Híbrido (Mejor para MVP)

```
- DeFi nos notifica via webhook (rápido, barato)
- ZCore verifica on-chain para seguridad
- Opcionalmente: Event listener como backup/validación
```

### Ejemplo de Implementación

#### Smart Contract de DeFi (Solidity)

```solidity
// En el contrato de la plataforma DeFi
event PaymentReceived(
    address indexed borrower,
    uint256 amount,
    uint256 loanId,
    uint256 timestamp
);

function repayLoan(uint256 loanId) external payable {
    // ... lógica de pago ...

    emit PaymentReceived(
        msg.sender,
        msg.value,
        loanId,
        block.timestamp
    );

    // Opcional: llamar a ZCore
    IZCoreOracle(zCoreAddress).recordPayment(msg.sender, msg.value);
}
```

#### Backend DeFi (Node.js)

```javascript
// Escuchar eventos del smart contract
contract.on("PaymentReceived", async (borrower, amount, loanId, timestamp) => {
  // Notificar a ZCore
  await axios.post("https://api.zcore.com/pago", {
    userId: borrower,
    monto: ethers.utils.formatEther(amount),
    loanId: loanId.toString(),
    fechaPago: new Date(timestamp * 1000).toISOString(),
    txHash: event.transactionHash,
    defiPlatform: "MyDeFi",
    apiKey: process.env.ZCORE_API_KEY,
  });
});
```

#### API ZCore (Endpoint de Pago)

```javascript
// POST /pago
router.post("/pago", async (req, res) => {
  const { userId, monto, txHash, defiPlatform, apiKey } = req.body;

  // 1. Validar API key de la plataforma DeFi
  if (!validateApiKey(apiKey, defiPlatform)) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  // 2. Verificar transacción on-chain
  const txVerified = await verifyTransactionOnChain(txHash);
  if (!txVerified) {
    return res.status(400).json({ error: "Transaction not verified" });
  }

  // 3. Registrar pago en base de datos
  await db.payments.create({
    userId,
    monto,
    txHash,
    defiPlatform,
    timestamp: new Date(),
  });

  // 4. Actualizar score del usuario
  const nuevoScore = await scoringService.updateScore(userId, "PAGO_A_TIEMPO");

  // 5. Actualizar límite disponible
  const limiteActualizado = await creditService.updateLimit(userId);

  // 6. Responder
  res.json({
    success: true,
    nuevoScore,
    limiteActualizado,
    mensaje: "Pago registrado exitosamente",
  });
});
```

### ⚠️ Consideraciones de Seguridad

1. **Validación de API Keys:** Solo DeFi registradas pueden notificar pagos
2. **Verificación On-Chain:** Siempre verificar el txHash en blockchain
3. **Prevención de Replay Attacks:** Guardar txHash usado, rechazar duplicados
4. **Rate Limiting:** Limitar requests por DeFi para evitar spam
5. **Idempotencia:** Mismo pago notificado múltiples veces = procesado una sola vez

### 💰 ZCore NO Custodia Dinero

**Crítico:** ZCore **NUNCA** recibe, custodia o transfiere dinero. Solo:

- ✅ Registra que un pago ocurrió
- ✅ Verifica on-chain que el pago es real
- ✅ Actualiza el score del usuario
- ✅ Mantiene historial de pagos

El flujo de dinero es siempre: **Usuario → Smart Contract DeFi**

---

## Endpoints de la API

### Scoring

- `POST /score` - Calcular score inicial
- `GET /score/{userId}` - Obtener score actual
- `GET /score/dinamico/{userId}` - Score con detalles

### Crédito

- `POST /credito/asignar` - Asignar límite inicial
- `GET /credito/limite/{userId}` - Consultar límite
- `PUT /credito/actualizar/{userId}` - Ajustar límite

### Transacciones

- `POST /transaccion` - Registrar operación
- `GET /transaccion/{userId}` - Historial de transacciones
- `GET /transaccion/{transactionId}` - Detalle de transacción

### Pagos

- `POST /pago` - Registrar pago (llamado por DeFi cuando detecta pago on-chain)
- `GET /pago/{userId}` - Historial de pagos
- `POST /pago/validar` - Validar pago pendiente
- `POST /pago/webhook` - Webhook para notificaciones de pago desde smart contract

### Estado de Cuenta

- `GET /estado-cuenta/{userId}` - Estado actual
- `GET /estado-cuenta/{userId}/detalle` - Desglose completo

### ZK Proofs

- `POST /zk/validar-prueba` - Validar ZK proof
- `POST /zk/generar-prueba` - Generar nueva prueba
- `GET /zk/verificar/{proofId}` - Verificar prueba existente

### Contrato/Legal

- `POST /contrato/aceptar` - Aceptar términos
- `GET /contrato/{userId}` - Ver contrato vigente

### Identidad

- `POST /usuario/verificar` - Iniciar KYC
- `GET /usuario/{userId}` - Datos del usuario
- `PUT /usuario/{userId}` - Actualizar perfil

---

## Ventajas y Desafíos

### ✅ Ventajas

#### Para Plataformas DeFi

- ✅ No necesitan construir su propio sistema de scoring
- ✅ Reducción de riesgo crediticio
- ✅ Integración simple vía API REST
- ✅ Actualizaciones en tiempo real

#### Para Usuarios

- ✅ Reputación portable entre plataformas
- ✅ Mejores condiciones con buen historial
- ✅ Privacidad mediante ZK Proofs
- ✅ Transparencia en scoring

#### Para el Ecosistema

- ✅ Estandarización de scoring DeFi
- ✅ Reducción de defaults
- ✅ Mayor confianza en préstamos descentralizados
- ✅ Interoperabilidad cross-platform

### ⚠️ Desafíos y Problemas a Resolver

#### 1. Confianza y Adopción Inicial

- ❌ **Problema:** ¿Por qué las DeFi confiarían en nuestro scoring?
- 💡 **Solución:**
  - Comenzar con datos públicos on-chain verificables
  - Ofrecer período de prueba gratuito
  - Mostrar métricas de accuracy en tiempo real
  - Auditorías de terceros del modelo de scoring

#### 2. Sincronización de Datos

- ❌ **Problema:** Latencia entre eventos en DeFi y actualización en ZCore
- 💡 **Solución:**
  - Webhooks en tiempo real
  - Event listeners on-chain
  - Sistema de confirmación de eventos
  - Cache distribuido con Redis

#### 3. Sybil Attacks

- ❌ **Problema:** Usuarios creando múltiples identidades para obtener mejores scores
- 💡 **Solución:**
  - KYC obligatorio para límites altos
  - Análisis de patrones de comportamiento
  - Costo de entrada (stake inicial)
  - Graph analysis de wallets relacionadas

#### 4. Manipulación del Score

- ❌ **Problema:** Usuarios haciendo micropréstamos para inflar su score
- 💡 **Solución:**
  - Ponderación por monto prestado
  - Análisis de patrones sospechosos
  - Cooldown periods entre préstamos
  - Score decay si no hay actividad real

#### 5. Cold Start Problem

- ❌ **Problema:** Nuevos usuarios sin historial = sin score = sin crédito
- 💡 **Solución:**
  - Score inicial basado en datos on-chain (balance, antigüedad wallet)
  - Programa de "primeros préstamos" con límites bajos
  - Integración con sistemas de reputación existentes (Gitcoin Passport, etc.)
  - Social vouching system

#### 6. Privacidad vs Transparencia

- ❌ **Problema:** Balance entre privacidad del usuario y necesidad de datos de la DeFi
- 💡 **Solución:**
  - ZK Proofs para validaciones sensibles
  - Datos agregados y anonimizados
  - Usuario controla qué datos compartir
  - Diferentes niveles de privacidad según límite solicitado

#### 7. Responsabilidad Legal

- ❌ **Problema:** ¿Quién es responsable si el scoring falla y hay defaults?
- 💡 **Solución:**
  - Términos y condiciones claros: ZCore solo provee información
  - La decisión final es de la DeFi
  - Disclaimers en todas las respuestas
  - Seguro de responsabilidad civil

#### 8. Competencia con Sistemas Existentes

- ❌ **Problema:** Protocolos como Aave ya tienen sus propios sistemas
- 💡 **Solución:**
  - Enfocarse en DeFi emergentes sin infraestructura
  - Ofrecer datos cross-platform (nuestro diferenciador)
  - API complementaria, no reemplazo
  - Partnerships estratégicos

#### 9. Costos de Infraestructura

- ❌ **Problema:** Mantener nodos, bases de datos, listeners on-chain es costoso
- 💡 **Solución:**
  - Modelo freemium con límites de queries
  - Fees por transacción
  - Optimización con cachés
  - Infraestructura escalable según demanda

#### 10. Regulación y Compliance

- ❌ **Problema:** Regulaciones diferentes por país/jurisdicción
- 💡 **Solución:**
  - Comenzar en jurisdicciones crypto-friendly
  - Asesoría legal especializada
  - Módulos de compliance configurables
  - Partnership con proveedores KYC establecidos

---

## Stack Tecnológico Sugerido

### Backend

- **Runtime:** Node.js / Bun
- **Framework:** Express / Fastify / NestJS
- **Base de datos:** PostgreSQL (relacional) + Redis (cache)
- **Blockchain:** Ethereum / Polygon / Arbitrum
- **ZK Library:** snarkjs / circom

### Seguridad

- **Autenticación:** JWT + Wallet signatures
- **Encriptación:** AES-256
- **ZK Proofs:** zk-SNARKs

### Infraestructura

- **Cloud:** AWS / GCP / Azure
- **Contenedores:** Docker + Kubernetes
- **CI/CD:** GitHub Actions
- **Monitoring:** Grafana + Prometheus

---

## Fases de Implementación

### Fase 1: MVP (Hackathon)

- ✅ Score básico
- ✅ Asignación de límites
- ✅ Registro de transacciones
- ✅ Sistema de pagos simulado
- ✅ API REST funcional

### Fase 2: Integración DeFi

- 🔄 Webhooks para eventos
- 🔄 SDK para integración
- 🔄 Dashboard para plataformas
- 🔄 Documentación completa

### Fase 3: ZK Proofs

- 🔄 Validaciones privadas
- 🔄 Pruebas de solvencia
- 🔄 Verificación on-chain

### Fase 4: Legal & Compliance

- 🔄 KYC completo
- 🔄 Firma electrónica
- 🔄 Contratos legales
- 🔄 Auditoría blockchain

### Fase 5: Escalabilidad

- 🔄 Multi-chain
- 🔄 ML para scoring avanzado
- 🔄 Análisis predictivo
- 🔄 Mercado secundario de reputación

---

## Modelo de Ingresos

### Opciones para ZCore

1. **Fee por consulta:** Cobro por cada query de score/límite
2. **Suscripción mensual:** Para plataformas DeFi integradas
3. **Fee por transacción:** Porcentaje de cada préstamo procesado
4. **Freemium:** Básico gratis, avanzado de pago
5. **Data insights:** Venta de análisis agregados (anónimos)

---

## Métricas de Éxito

- **Para ZCore:**

  - Número de plataformas DeFi integradas
  - Volumen de préstamos procesados
  - Accuracy del modelo de scoring
  - Reducción de defaults

- **Para DeFi:**

  - Reducción de tasa de impago
  - Incremento en volumen de préstamos
  - Mejora en time-to-decision

- **Para Usuarios:**
  - Mejora en condiciones obtenidas
  - Acceso a más plataformas
  - Tiempo de aprobación
