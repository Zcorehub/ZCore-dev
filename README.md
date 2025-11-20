# ZCore

Credit Score & Reputación Programable para DeFi y Web3.

> "ZCore es el FICO Score para DeFi: habilita préstamos sub-colateralizados mediante reputación portable, verificable y privada (ZK)."

---

## Elevator Pitch (Resumen)

En DeFi hoy necesitas depositar 150%–200% de colateral porque no existe historial crediticio descentralizado. Eso bloquea miles de millones y frena adopción. ZCore provee una API que entrega en milisegundos: score del usuario, límite recomendado y nivel de riesgo. Cada pago confirmado on-chain actualiza su reputación; buenos pagadores obtienen mejores condiciones en cualquier protocolo integrado. Usamos Zero-Knowledge Proofs para validar umbrales (ej. "score > 700") sin revelar datos sensibles.

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

1. Usuario solicita préstamo en DeFi.
2. Protocolo consulta `GET /score/{userId}` y `GET /credito/limite/{userId}`.
3. ZCore responde score, límite recomendado, riesgo y (opcional) ZK proof.
4. Protocolo decide y desembolsa (on-chain).
5. Pago futuro: smart contract emite evento; DeFi notifica a `POST /pago` (o ZCore lo detecta directamente).
6. ZCore verifica txHash on-chain, actualiza score y reputación.
7. Nuevas solicitudes obtienen mejores (o peores) condiciones.

---

## Reglas de Score Dinámico (Ejemplo MVP)

```
+ Pago a tiempo:        +10
+ Pago adelantado:      +15
+ Bajo uso (<30% límite) +5
- Pago tardío:          -20
- Default / no pago:    -30
- Uso constante 100%:    -5
```

Ponderaciones base sugeridas: Pagos 40% · Utilización 30% · Antigüedad 15% · Diversidad 10% · Comportamiento on-chain 5%.

---

## Endpoints (MVP)

### Scoring & Crédito

- `POST /score` – Calcular score inicial.
- `GET /score/{userId}` – Score actual.
- `GET /score/dinamico/{userId}` – Componentes del score.
- `POST /credito/asignar` – Asignar límite inicial.
- `GET /credito/limite/{userId}` – Límite recomendado.

### Transacciones & Pagos

- `POST /transaccion` – Registrar préstamo/desembolso.
- `GET /transaccion/{userId}` – Historial de transacciones.
- `POST /pago` – Registrar pago (notificación webhook DeFi).
- `POST /pago/validar` – Validar estado de pago pendiente.
- `POST /pago/webhook` – Endpoint dedicado para eventos.

### Estado / Identidad / Legal

- `GET /estado-cuenta/{userId}` – Resumen deuda y uso.
- `POST /contrato/aceptar` – Aceptación términos (firma/kvc).
- `POST /usuario/verificar` – Inicio proceso KYC / verificación.

### ZK Proofs

- `POST /zk/generar-prueba` – Generar prueba (ej: score > X).
- `POST /zk/validar-prueba` – Validar prueba enviada.
- `GET /zk/verificar/{proofId}` – Verificación posterior.

---

## Seguridad & Integridad

- Verificación on-chain de `txHash` antes de impactar score.
- Idempotencia: pagos duplicados (mismo hash) se rechazan.
- API Keys por plataforma + firma de payload opcional.
- Rate limiting por cliente B2B.
- ZK Proofs para privacidad de atributos sensibles.

---

## Ventajas vs Desafíos

### Ventajas

- Reducción de colateral → Más eficiencia de capital.
- Reputación portable cross-protocol → Network effects.
- Privacidad con ZK → Cumplimiento sin fuga de datos.
- Fácil integración → API-first / webhooks.

### Desafíos

- Adopción inicial (confianza en el modelo).
- Sybil / identidades múltiples → Mitigar con KYC opcional + análisis de grafos.
- Manipulación del score → Ponderaciones + detección de patrones.
- Cold start usuarios nuevos → Score inicial on-chain (antigüedad, balance, actividad).
- Regulación multinacional → Modular compliance.

---

## Fases de Implementación

| Fase                | Objetivo                           | Alcance                                                                                                                                 |
| ------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 1. MVP Hackathon    | ZK + API núcleo                    | API básica (score inicial, límite provisional), prototipo ZK (prueba score > X), registro mínimo de pagos simulado, sin dashboard ni ML |
| 2. Integración DeFi | Primeros partners reales           | Webhooks, dashboard inicial, documentación pública                                                                                      |
| 3. ZK Layer         | Privacidad y verificación avanzada | ZK proofs adicionales (solvencia, historial agregado), optimización circuitos                                                           |
| 4. Legal & Identity | Responsabilidad formal             | KYC, firma electrónica, contratos legales, trazabilidad ampliada                                                                        |
| 5. Escalabilidad    | Multi-chain + ML                   | Adaptadores multi-chain, modelos predictivos, tuning de riesgo                                                                          |

### Enfoque del MVP (Hackathon)

Durante el hackathon nos centraremos en:

1. Circuito ZK mínimo que demuestre "score ≥ umbral" sin revelar el valor exacto.
2. API REST básica: endpoints para crear usuario, calcular score inicial, consultar score y límite provisional, generar / validar prueba ZK.
3. Simulación de registro de pago (sin integración on-chain completa) para mostrar actualización del score y regeneración de la prueba.
4. Código modular preparado para extender a pagos verificados on-chain y más tipos de pruebas.

Quedan fuera del MVP: dashboard visual, ML avanzado, multi-chain, KYC formal, auditoría on-chain completa y optimización de performance de circuitos.

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

## Ejemplo de Regla ZK (Conceptual)

Usuario genera prueba de que `score >= 700` sin revelar valor exacto; protocolo verifica con `POST /zk/validar-prueba` y habilita mejores términos.

---

## Stack Sugerido

- **Backend:** Node.js (Express / Fastify / NestJS)
- **DB:** PostgreSQL + Redis (cache de scores)
- **Blockchain:** Inicial Ethereum / Polygon / (Hackathon: Stellar posible) + listeners.
- **ZK:** Circom + snarkjs (zk-SNARKs) / Exploración de zkVM.
- **Infra:** Docker, CI/CD GitHub Actions, Observabilidad (Grafana + Prometheus).
- **Auth:** JWT + firmas de wallet (EIP-4361) + API Keys.

---

<!-- Sección de desarrollo local removida temporalmente: aún no existe sistema ejecutable. Se añadirá cuando se prepare la primera versión de código. -->

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
