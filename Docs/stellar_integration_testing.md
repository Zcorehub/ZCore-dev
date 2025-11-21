# Pruebas de Integración Stellar - Scoring Simplificado

## Endpoints Actualizados

### Registro de Usuario (Solo Wallet)

```bash
POST /api/auth/register
Content-Type: application/json

{
  "walletAddress": "GAYR3DYYONOZMFQT5KA7VO4LHMDWEDMVOFXONGEPPLQAL5ZWQQXYAJUP"
}
```

### Login de Usuario

```bash
POST /api/auth/login
Content-Type: application/json

{
  "walletAddress": "GAYR3DYYONOZMFQT5KA7VO4LHMDWEDMVOFXONGEPPLQAL5ZWQQXYAJUP"
}
```

## Ejemplos de Wallets para Testing

### Wallet Válida con Historial

```
Wallet: GAYR3DYYONOZMFQT5KA7VO4LHMDWEDMVOFXONGEPPLQAL5ZWQQXYAJUP
URL Horizon: https://horizon.stellar.org/accounts/GAYR3DYYONOZMFQT5KA7VO4LHMDWEDMVOFXONGEPPLQAL5ZWQQXYAJUP
```

### Wallet para Testing (Activa)

```
Wallet: GAHK7EEG2WWHVKDNT4CEQFZGKF2LGDSW2IVM4S5DP42RBW3K6BTODB4A
URL Horizon: https://horizon.stellar.org/accounts/GAHK7EEG2WWHVKDNT4CEQFZGKF2LGDSW2IVM4S5DP42RBW3K6BTODB4A
```

## Casos de Prueba

### 1. Registro Exitoso (Wallet Válida)

**Request:**

```json
{
  "walletAddress": "GAYR3DYYONOZMFQT5KA7VO4LHMDWEDMVOFXONGEPPLQAL5ZWQQXYAJUP"
}
```

**Response Esperada:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "score": 280
  }
}
```

### 2. Wallet Inexistente

**Request:**

```json
{
  "walletAddress": "INVALID123WALLET456NOTREAL789"
}
```

```json
{
  "success": false,
  "error": "Invalid Stellar wallet address",
  "message": "The provided wallet address does not exist on Stellar network",
  "details": {
    "walletAddress": "INVALID123WALLET456NOTREAL789",
    "stellarNetwork": "mainnet",
    "suggestion": "Please verify your Stellar wallet address and try again"
  }
}
```

### 3. Login de Usuario Registrado

**Request:**

```json
{
  "walletAddress": "GAYR3DYYONOZMFQT5KA7VO4LHMDWEDMVOFXONGEPPLQAL5ZWQQXYAJUP"
}
```

**Response Esperada:**

```json
{
  "success": true,
  "data": {
    "score": 280
  }
}
```

### 4. Login de Usuario No Registrado

**Request:**

```json
{
  "walletAddress": "GAHK7EEG2WWHVKDNT4CEQFZGKF2LGDSW2IVM4S5DP42RBW3K6BTODB4A"
}
```

**Response Esperada:**

```json
{
  "success": false,
  "error": "User not found"
}
```

## Beneficios de la Implementación Actual

1. **100% Verificado**: Todos los datos provienen de Stellar blockchain
2. **Sin Auto-Reporte**: Elimina la posibilidad de manipulación de datos
3. **Simplificado**: Solo requiere wallet address, sin formularios complejos
4. **Transparente**: Score basado completamente en actividad on-chain
5. **Escalable**: Arquitectura preparada para múltiples blockchains

---

## Cálculo del Stellar Score (Máximo 350 puntos)

El **Stellar Score** se calcula automáticamente basado en datos reales de la blockchain Stellar obtenidos desde Horizon API.

### Componentes del Score Optimizado

#### 1. Edad de Wallet (Máximo: 80 puntos)

- **Fuente**: Primera transacción encontrada en orden ascendente
- **Cálculo**: `Math.min(walletAge / 365 * 40, 80)`
- **Lógica**: 40 puntos por año de antigüedad, máximo 80 puntos (2+ años)
- **Ejemplo**: Wallet de 1.5 años = 75 puntos

#### 2. Actividad Transaccional (Máximo: 70 puntos)

- **Fuente**: Total de transacciones (límite 200 más recientes)
- **Cálculo**: `Math.min(totalTransactions * 0.4, 70)`
- **Lógica**: 0.4 puntos por transacción, máximo 70 puntos (175+ transacciones)
- **Ejemplo**: 100 transacciones = 40 puntos

#### 3. Tasa de Éxito (Máximo: 50 puntos)

- **Fuente**: Transacciones exitosas vs total
- **Cálculo**: `(successfulTransactions / totalTransactions) * 50`
- **Lógica**: Penaliza transacciones fallidas
- **Ejemplo**: 95% éxito = 47.5 puntos

#### 4. Balance XLM (Máximo: 60 puntos)

- **Fuente**: Balance actual en asset nativo (XLM)
- **Cálculo**: `Math.min(Math.log10(averageBalance + 1) * 15, 60)`
- **Lógica**: Escala logarítmica para evitar dominancia de balances altos
- **Ejemplo**: 1000 XLM = 45 puntos

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
