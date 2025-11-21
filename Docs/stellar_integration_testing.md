# Pruebas de Integración Stellar

## Ejemplos de Wallets para Testing

### Wallet Válida con Historial

```
Wallet: GAYR3DYYONOZMFQT5KA7VO4LHMDWEDMVOFXONGEPPLQAL5ZWQQXYAJUP
URL Horizon: https://horizon.stellar.org/accounts/GAYR3DYYONOZMFQT5KA7VO4LHMDWEDMVOFXONGEPPLQAL5ZWQQXYAJUP/transactions?order=asc&limit=1
```

### Payload de Prueba para Registro

```json
{
  "walletAddress": "GAYR3DYYONOZMFQT5KA7VO4LHMDWEDMVOFXONGEPPLQAL5ZWQQXYAJUP",
  "questionnaire": {
    "walletAge": 12,
    "averageBalance": 1000.5,
    "transactionCount": 25,
    "defiInteractions": 5,
    "monthlyIncome": 5000,
    "loanPurpose": "business"
  }
}
```

### Casos de Prueba

1. **Wallet Válida:** Usar wallet con historial real
2. **Wallet Inexistente:** `INVALID123WALLET456` (debería dar error 404)
3. **Wallet Nueva:** Usar una con pocas transacciones

### Respuesta Esperada con Stellar

```json
{
  "success": true,
  "message": "User registered with Stellar integration",
  "data": {
    "profileTier": "B",
    "score": 680,
    "stellarIntegration": {
      "isValid": true,
      "walletAge": 120,
      "totalTransactions": 45,
      "firstTransactionDate": "2024-07-20T15:08:25Z"
    },
    "scoringBreakdown": {
      "questionnaireScore": 450,
      "stellarScore": 200,
      "finalScore": 680
    }
  }
}
```

### Respuesta con Wallet Inexistente

```json
{
  "success": true,
  "message": "User registered with Stellar integration",
  "data": {
    "profileTier": "C",
    "score": 313,
    "stellarIntegration": {
      "isValid": false,
      "walletAge": 0,
      "totalTransactions": 0,
      "firstTransactionDate": null
    },
    "scoringBreakdown": {
      "questionnaireScore": 313,
      "stellarScore": 0,
      "finalScore": 313
    }
  }
}
```

## Beneficios de la Integración

1. **Verificación Automática**: No dependemos solo de datos auto-reportados
2. **Scoring Más Preciso**: Datos reales de blockchain aumentan confiabilidad
3. **Fallback Seguro**: Si Stellar falla, usamos solo el cuestionario
4. **Transparencia**: El breakdown muestra cómo se calculó el score
5. **Escalabilidad**: Fácil agregar otras blockchains en el futuro

---

## Cálculo del Stellar Score

El **Stellar Score** se calcula automáticamente basado en datos reales de la blockchain Stellar obtenidos desde Horizon API.

### Componentes del Score (Máximo 380 puntos)

#### 1. Edad de Wallet (Máximo: 100 puntos)

- **Fuente**: Primera transacción encontrada en orden ascendente
- **Cálculo**: `Math.min(walletAge / 365 * 50, 100)`
- **Lógica**: 50 puntos por año de antigüedad, máximo 100 puntos (2+ años)
- **Ejemplo**: Wallet de 1.5 años = 75 puntos

#### 2. Actividad Transaccional (Máximo: 80 puntos)

- **Fuente**: Total de transacciones (límite 200 más recientes)
- **Cálculo**: `Math.min(totalTransactions * 0.5, 80)`
- **Lógica**: 0.5 puntos por transacción, máximo 80 puntos (160+ transacciones)
- **Ejemplo**: 100 transacciones = 50 puntos

#### 3. Tasa de Éxito (Máximo: 50 puntos)

- **Fuente**: Transacciones exitosas vs total
- **Cálculo**: `(successfulTransactions / totalTransactions) * 50`
- **Lógica**: Penaliza transacciones fallidas
- **Ejemplo**: 95% éxito = 47.5 puntos

#### 4. Balance XLM (Máximo: 70 puntos)

- **Fuente**: Balance actual en asset nativo (XLM)
- **Cálculo**: `Math.min(Math.log10(averageBalance + 1) * 20, 70)`
- **Lógica**: Escala logarítmica para evitar dominancia de balances altos
- **Ejemplo**: 1000 XLM = 60 puntos

#### 5. Diversidad de Activos (Máximo: 50 puntos)

- **Fuente**: Número de trustlines (activos no nativos)
- **Cálculo**: `Math.min(trustlineCount * 10, 50)`
- **Lógica**: Más activos = mayor sofisticación DeFi
- **Ejemplo**: 3 trustlines = 30 puntos

#### 6. Actividad de Operaciones (Máximo: 30 puntos)

- **Fuente**: Operaciones realizadas (límite 200 más recientes)
- **Cálculo**: `Math.min(operationsCount * 0.2, 30)`
- **Lógica**: Operaciones indican uso activo de la red
- **Ejemplo**: 100 operaciones = 20 puntos

### Ejemplo de Cálculo Real

**Wallet hipotética con:**

- Edad: 600 días (1.64 años)
- Transacciones: 45 (43 exitosas)
- Balance: 5000 XLM
- Trustlines: 2
- Operaciones: 78

**Cálculo paso a paso:**

1. Edad: `600 / 365 * 50 = 82.2 puntos` (limitado a 100)
2. Transacciones: `45 * 0.5 = 22.5 puntos`
3. Éxito: `43/45 * 50 = 47.8 puntos`
4. Balance: `log10(5001) * 20 = 74.8 puntos` (limitado a 70)
5. Trustlines: `2 * 10 = 20 puntos`
6. Operaciones: `78 * 0.2 = 15.6 puntos`

**Total Stellar Score: 82.2 + 22.5 + 47.8 + 70 + 20 + 15.6 = 258.1 puntos**

### Integración con Score Final

El sistema combina:

- **40%** Cuestionario (máx ~550 puntos)
- **60%** Stellar Score (máx 380 puntos)

**Fórmula final:**

```
finalScore = (questionnaireScore * 0.4) + (stellarScore * 0.6)
normalizedScore = 300 + (finalScore / 600 * 550)  // Normalizado a 300-850
```

### Casos Especiales

- **Wallet inexistente**: Stellar Score = 0, solo se usa cuestionario
- **API failure**: Fallback automático a scoring tradicional
- **Wallet nueva**: Se valora la existencia misma en Stellar (+puntos base)
