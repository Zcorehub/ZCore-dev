# Planeación de Desarrollo de Casos de Uso ZCore API

## Objetivo

Desarrollar una API middleware de scoring y reputación para plataformas DeFi (prestamistas), donde el usuario final nunca ve su score y toda la gestión de préstamos/pagos/historial es responsabilidad del prestamista. El enfoque es 100% API-first, sin prioridad en frontend.

---

## Casos de Uso a Implementar

### 1. Usuario (Cliente Final)

- Identificación vía wallet (EIP-4361, SEP-10)
- Completa formulario de datos personales
- Autoriza generación de scoring (consentimiento explícito)
- Autoriza uso de score para evaluación (no visualiza score)

### 2. Prestamista (Plataforma DeFi)

- Integra la API de ZCore como proveedor de scoring
- Solicita scoring de usuario específico (por wallet)
- Recibe resultado de elegibilidad (perfil A/B/C, monto máximo, NUNCA el score numérico)
- Verifica autenticidad de la prueba (ZK Proof, Soroban opcional)
- Decide otorgar crédito y reporta pagos/defaults vía API

### 3. API (ZCore)

- Recibe identidad del usuario (wallet)
- Procesa formulario y genera score
- Almacena score en blockchain (oculto al usuario)
- Genera ZK Proof de elegibilidad para prestamista
- Expone endpoints para consulta de perfil, registro de pagos, definición de perfiles de riesgo
- Publica/verifica score y pruebas en blockchain (Soroban/EVM)

---

## Planeación Técnica y Tareas

### Backend/API

- [ ] Endpoint POST `/registro` (registro usuario + cuestionario)
- [ ] Endpoint POST `/login` (autenticación wallet)
- [ ] Endpoint POST `/solicitud` (solicitud de scoring, genera ZK proof)
- [ ] Endpoint GET `/usuario/{wallet}/perfil` (perfil asignado, sin score)
- [ ] Endpoint POST `/pago` (prestamista reporta pago/default)
- [ ] Endpoint POST `/perfiles` (prestamista define perfiles de riesgo)
- [ ] Endpoint POST `/zk/validar-prueba` (verificación de ZK proof)

### Blockchain/ZK

- [ ] Smart contract para registro y actualización de score
- [ ] Circuito ZK (circom) para validación de score >= umbral
- [ ] Integración con Soroban/EVM para publicación/verificación

### Integración Prestamista

- [ ] Documentar flujo de integración para plataformas DeFi
- [ ] Ejemplo de cómo reportar pagos y consultar perfil vía API

### Testing

- [ ] Pruebas unitarias de endpoints
- [ ] Pruebas de integración (API + blockchain)
- [ ] Mock de plataforma prestamista para pruebas end-to-end

---

## Consideraciones

- El usuario final nunca ve su score ni historial, solo recibe confirmaciones y perfil asignado
- El prestamista es responsable de la gestión de préstamos, pagos y métricas en su plataforma
- ZCore solo provee scoring, validación y registro on-chain
- El frontend es mínimo o solo para pruebas internas

---

## Cronograma Sugerido

1. Modelado de endpoints y base de datos (Prisma)
2. Implementación de endpoints core (`/registro`, `/solicitud`, `/perfil`)
3. Desarrollo de smart contract y circuito ZK
4. Integración API-blockchain
5. Documentación y ejemplos para prestamistas
6. Pruebas end-to-end y ajustes

---

## Revisión y Cierre

- Validar que ningún endpoint exponga el score al usuario
- Validar que la API sea usable por cualquier plataforma DeFi
- Documentar claramente el flujo de integración y responsabilidades

---

> **Nota:** Este documento es vivo y debe actualizarse conforme avance el desarrollo y se ajusten los requerimientos.
