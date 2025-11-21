# Plan de Implementación: Sistema de Scoring ZCore

## Resumen del Estado Actual

**✅ Completado en MVP:**

- API REST funcional con scoring básico
- Base de datos MySQL con modelos User, Lender, Request, Payment
- Algoritmo de scoring inicial basado en cuestionario
- Sistema de tiers A/B/C para clasificación de riesgo
- Actualización de score basada en pagos/defaults
- Documentación Swagger completa

**🎯 Objetivo:** Documentar la metodología de scoring implementada y planificar mejoras futuras.

---

## Metodología de Scoring Actual

### 1. Variables del Cuestionario Inicial

El sistema evalúa 5 variables cuantitativas principales:

```javascript
// Pesos actuales en la fórmula
const weights = {
  walletAge: 0.2, // Edad de wallet en meses
  averageBalance: 0.0001, // Balance promedio (normalizado)
  transactionCount: 0.1, // Número de transacciones
  defiInteractions: 5.0, // Interacciones DeFi (peso alto)
  monthlyIncome: 0.0005, // Ingreso mensual declarado
};
```

**Justificación de Pesos:**

- `defiInteractions` tiene el mayor peso (5.0) porque indica experiencia real en DeFi
- `walletAge` y `transactionCount` miden madurez del usuario
- `averageBalance` y `monthlyIncome` indican capacidad financiera

### 2. Cálculo del Score (300-850)

```javascript
const rawScore =
  300 +
  (walletAge * 0.2 +
    averageBalance * 0.0001 +
    transactionCount * 0.1 +
    defiInteractions * 5 +
    monthlyIncome * 0.0005);

const finalScore = Math.min(Math.max(Math.round(rawScore), 300), 850);
```

### 3. Asignación de Tiers

| Tier | Score Range | Características                 |
| ---- | ----------- | ------------------------------- |
| A    | 750-850     | Usuarios premium, máximo límite |
| B    | 650-749     | Usuarios experimentados         |
| C    | 300-649     | Usuarios nuevos o limitados     |

### 4. Actualización Dinámica

**Eventos de Pago:**

- ✅ Pago exitoso: +10 puntos
- ❌ Default: -30 puntos

```javascript
const updateScoreFromPayment = (score, status) => {
  const delta = status === "paid" ? 10 : -30;
  return Math.min(Math.max(score + delta, 300), 850);
};
```

---

## Proceso de Evaluación de Solicitudes

### Flujo Implementado

1. **Usuario registrado** solicita préstamo con monto específico
2. **Sistema recupera** score actual del usuario
3. **Prestamista tiene perfiles** configurados (A/B/C con límites)
4. **Algoritmo busca** el mejor perfil que el usuario califique
5. **Evalúa elegibilidad** comparando monto solicitado vs límite del perfil
6. **Retorna decisión** con perfil asignado y monto máximo

### Configuración de Prestamistas

Los prestamistas pueden definir perfiles personalizados:

```json
{
  "apiKey": "lender_12345",
  "profiles": [
    {
      "tier": "A",
      "minScore": 700,
      "maxAmount": 10000,
      "interestRate": 8.5
    },
    {
      "tier": "B",
      "minScore": 600,
      "maxAmount": 5000,
      "interestRate": 12.0
    }
  ]
}
```

---

## Casos de Uso Implementados

### Caso 1: Usuario Nuevo

```json
// Input del cuestionario
{
  "walletAge": 3,
  "averageBalance": 500,
  "transactionCount": 10,
  "defiInteractions": 2,
  "monthlyIncome": 3000
}

// Output
{
  "score": 313,
  "tier": "C"
}
```

### Caso 2: Usuario Avanzado

```json
// Input del cuestionario
{
  "walletAge": 36,
  "averageBalance": 25000,
  "transactionCount": 800,
  "defiInteractions": 50,
  "monthlyIncome": 15000
}

// Output
{
  "score": 647,
  "tier": "B"
}
```

### Caso 3: Evolución por Pagos

**Escenario:** Usuario con score 620 realiza pagos puntuales

- Pago 1: 620 + 10 = 630 (Tier C)
- Pago 2: 630 + 10 = 640 (Tier C)
- Pago 3: 640 + 10 = 650 (Tier B) ⬆️ **Promoción automática**

---

## Próximas Mejoras Planificadas

### Fase 2: Validación On-Chain Real

**🎯 Objetivo:** Reemplazar datos auto-reportados con verificación blockchain

**Implementación:**

```javascript
// En lugar de cuestionario manual
const onChainAnalysis = {
  walletAge: await getWalletCreationDate(address),
  averageBalance: await calculateHistoricalBalance(address, 90), // 90 días
  transactionCount: await getTransactionCount(address),
  defiInteractions: await analyzeDeFiProtocols(address),
  liquidityProvision: await checkLPTokens(address),
};
```

**APIs a Integrar:**

- Etherscan/Polygonscan para datos básicos
- Alchemy/Infura para análisis avanzado
- DefiPulse/DefiLlama para scoring de protocolos

### Fase 3: Machine Learning

**🎯 Objetivo:** Modelo predictivo para reducir defaults

**Features Adicionales:**

- Patrones de timing en transacciones
- Diversificación de assets
- Participación en governance
- Staking behavior
- Bridge usage patterns

**Modelo Propuesto:**

```python
# Ejemplo conceptual
from sklearn.ensemble import RandomForestClassifier

features = [
    'wallet_age_months',
    'avg_balance_90d',
    'tx_count_30d',
    'defi_protocols_used',
    'governance_participation',
    'staking_duration_avg',
    'bridge_usage_count'
]

model = RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    random_state=42
)
```

### Fase 4: Zero-Knowledge Proofs

**🎯 Objetivo:** Privacidad en verificación de umbrales

**Circuitos ZK Planeados:**

1. **Proof of Score Threshold:** "Mi score ≥ 700" sin revelar valor exacto
2. **Proof of Income Range:** "Mis ingresos están en rango X-Y"
3. **Proof of DeFi Experience:** "He usado ≥ N protocolos DeFi"

**Implementación Técnica:**

```circom
// Circuito ejemplo para threshold proof
template ScoreThreshold() {
    signal input score;
    signal input threshold;
    signal output valid;

    component geq = GreaterEqualThan(10);
    geq.in[0] <== score;
    geq.in[1] <== threshold;
    valid <== geq.out;
}
```

---

## Validación y Métricas

### KPIs para Monitorear

1. **Accuracy del Modelo:**

   - % de defaults predichos correctamente
   - False positives/negatives por tier

2. **Distribución de Usuarios:**

   - % en cada tier A/B/C
   - Flujo de migrations entre tiers

3. **Performance Operacional:**
   - Tiempo de respuesta API (<200ms)
   - Uptime del sistema (>99.9%)

### A/B Testing Planeado

**Experimento 1:** Pesos de Variables

- Grupo A: Pesos actuales
- Grupo B: Mayor peso a transactionCount
- Métrica: Default rate a 30 días

**Experimento 2:** Ajuste de Tiers

- Grupo A: Thresholds actuales (650/750)
- Grupo B: Thresholds ajustados (600/700)
- Métrica: Volumen de préstamos vs defaults

---

## Consideraciones de Seguridad

### Validaciones Implementadas

1. **Input Sanitization:** Todos los endpoints usan Zod schemas
2. **Rate Limiting:** Prevenir spam de consultas
3. **API Key Authentication:** Prestamistas autenticados

### Medidas Futuras

1. **Anomaly Detection:**

   ```javascript
   // Detectar patrones sospechosos
   const detectAnomalies = (userBehavior) => {
     const suspiciousPatterns = [
       "sudden_balance_spike",
       "tx_burst_before_request",
       "multiple_wallets_same_ip",
     ];
     return analyzePatterns(userBehavior, suspiciousPatterns);
   };
   ```

2. **Sybil Resistance:**
   - Graph analysis de wallets conectadas
   - Temporal correlation de actividades
   - Cross-chain identity verification

---

## Plan de Implementación

### Sprint 1 (2 semanas): On-Chain Integration

- [ ] Integrar APIs de blockchain explorers
- [ ] Implementar análisis básico de wallet
- [ ] A/B test: datos on-chain vs cuestionario
- [ ] Métricas de accuracy

### Sprint 2 (3 semanas): ML Model

- [ ] Recolectar datos históricos de pagos
- [ ] Entrenar modelo de clasificación
- [ ] Validar con datos holdout
- [ ] Deploy modelo en producción

### Sprint 3 (4 semanas): ZK Proofs

- [ ] Diseñar circuitos para score threshold
- [ ] Implementar generación/verificación
- [ ] Integrar con API existente
- [ ] Testing de performance

### Sprint 4 (1 semana): Monitoring & Optimization

- [ ] Dashboard de métricas en tiempo real
- [ ] Alertas automáticas por anomalías
- [ ] Optimización de queries de base de datos
- [ ] Documentation update

---

## Recursos Necesarios

### Técnicos

- **Backend Developer:** Integraciones on-chain
- **Data Scientist:** Modelo ML y análisis
- **Blockchain Engineer:** ZK circuits
- **DevOps:** Infraestructura y monitoreo

### Infraestructura

- **Node Providers:** Alchemy/Infura para múltiples chains
- **Database:** Upgrade a cluster para handling de volumen
- **ML Pipeline:** Airflow para entrenamiento regular
- **Monitoring:** Datadog/Grafana para observabilidad

---

## Riesgos y Mitigaciones

| Riesgo                | Probabilidad | Impacto | Mitigación                                    |
| --------------------- | ------------ | ------- | --------------------------------------------- |
| Manipulación de score | Media        | Alto    | Detección de anomalías + verificación cruzada |
| Sybil attacks         | Media        | Alto    | Graph analysis + KYC opcional                 |
| Model drift           | Alta         | Medio   | Reentrenamiento regular + monitoring          |
| API rate limits       | Alta         | Bajo    | Caching + múltiples providers                 |
| Regulatory changes    | Baja         | Alto    | Diseño modular + compliance by design         |

---

## Conclusiones

El sistema de scoring actual de ZCore proporciona una base sólida para evaluación crediticia en Web3. La metodología implementada balanceaefectividad para el MVP con extensibilidad futura.

**Fortalezas del Modelo Actual:**

- Simplicidad y transparencia en cálculos
- Flexibilidad para prestamistas
- Actualización dinámica basada en comportamiento
- API robusta y bien documentada

**Próximos Pasos Críticos:**

1. Validación on-chain para reducir dependencia en auto-reporte
2. Modelo ML para mejorar precisión predictiva
3. ZK proofs para privacidad sin sacrificar verificabilidad
4. Métricas robustas para validación continua del modelo

La arquitectura modular permite evolución incremental sin romper integraciones existentes, posicionando ZCore como infraestructura crediticia estándar para el ecosistema Web3.
