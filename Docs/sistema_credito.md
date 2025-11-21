# Sistema de Crédito Programable con ZK -- Documento Técnico Completo

## 1. Zero-Knowledge (ZK): Concepto y Aplicación

Un ZK (Zero-Knowledge Proof) es una técnica criptográfica que permite
demostrar que cierta información es verdadera sin revelar la información
en sí.

### Usos relevantes:

- Validación de identidad sin exponer datos.
- Comprobación de solvencia o score sin mostrar datos privados.
- Verificación de cálculos fuera de cadena sin revelar entradas.
- Privacidad en operaciones financieras.
- Crear reputación verificable sin comprometer privacidad.

En una API financiera, los ZK permiten: 1. Validar requisitos sin
mostrar datos sensibles. 2. Guardar pruebas verificables para evitar
manipulación. 3. Cumplir requisitos de privacidad y auditoría.

---

## 2. Cómo funciona una tarjeta de crédito

Una tarjeta de crédito es una línea de crédito rotativa.

### Flujo:

1.  Evaluación de riesgo y asignación de límite.
2.  El usuario compra; el banco paga al comercio.
3.  El usuario adquiere una deuda.
4.  Se genera estado de cuenta mensual.
5.  Pago total, parcial o mínimo.
6.  Intereses si no se liquida.
7.  Consecuencias por impago.

---

## 3. Por qué la gente paga una tarjeta

- Evitar intereses altos.
- Evitar afectar su historial crediticio.
- Evitar bloqueos o restricciones.
- Evitar cobranza.
- Evitar consecuencias legales.

---

## 4. Lógica replicable para la API

Componentes clave: - Motor de scoring. - Motor de crédito y límites. -
Registro de transacciones. - Motor de pagos. - Motor de reputación
dinámica. - Auditoría de eventos. - Opcional: blockchain + ZK.

### Flujo:

1.  Score inicial.
2.  Asignación de límite.
3.  Consumo de crédito.
4.  Registro de uso.
5.  Pagos.
6.  Ajustes de score.
7.  Penalizaciones y recompensas.

---

## 5. Sistema de Score Dinámico

### Scoring Híbrido Implementado

El sistema ZCore combina **dos fuentes de datos** para generar un score más confiable:

#### Peso 40% - Cuestionario Auto-Reportado

- **walletAge** (meses) × 0.2
- **averageBalance** × 0.0001
- **transactionCount** × 0.1
- **defiInteractions** × 5.0
- **monthlyIncome** × 0.0005

#### Peso 60% - Datos Verificados de Stellar Blockchain

Obtenidos automáticamente vía Horizon API:

**1. Edad de Wallet (Máximo: 100 puntos)**

- **Fuente**: Primera transacción encontrada en orden ascendente
- **Cálculo**: `Math.min(walletAge / 365 * 50, 100)`
- **Lógica**: 50 puntos por año de antigüedad, máximo 100 puntos (2+ años)

**2. Actividad Transaccional (Máximo: 80 puntos)**

- **Fuente**: Total de transacciones (límite 200 más recientes)
- **Cálculo**: `Math.min(totalTransactions * 0.5, 80)`
- **Lógica**: 0.5 puntos por transacción, máximo 80 puntos (160+ transacciones)

**3. Tasa de Éxito (Máximo: 50 puntos)**

- **Fuente**: Transacciones exitosas vs total
- **Cálculo**: `(successfulTransactions / totalTransactions) * 50`
- **Lógica**: Penaliza transacciones fallidas

**4. Balance XLM (Máximo: 70 puntos)**

- **Fuente**: Balance actual en asset nativo (XLM)
- **Cálculo**: `Math.min(Math.log10(averageBalance + 1) * 20, 70)`
- **Lógica**: Escala logarítmica para evitar dominancia de balances altos

**5. Diversidad de Activos (Máximo: 50 puntos)**

- **Fuente**: Número de trustlines (activos no nativos)
- **Cálculo**: `Math.min(trustlineCount * 10, 50)`
- **Lógica**: Más activos = mayor sofisticación DeFi

**6. Actividad de Operaciones (Máximo: 30 puntos)**

- **Fuente**: Operaciones realizadas (límite 200 más recientes)
- **Cálculo**: `Math.min(operationsCount * 0.2, 30)`
- **Lógica**: Operaciones indican uso activo de la red

### Fórmula de Integración Final

```javascript
// Stellar Score máximo: 380 puntos
stellarScore =
  ageScore + txScore + successScore + balanceScore + trustlineScore + opsScore;

// Combinación final (40% cuestionario + 60% Stellar)
finalScore = questionnaireScore * 0.4 + stellarScore * 0.6;

// Normalización al rango 300-850
normalizedScore = 300 + (finalScore / 600) * 550;
```

### Reglas de Actualización Dinámica

Ejemplos de reglas implementadas:

- **Pago a tiempo**: +10 puntos
- **Default/No pago**: -30 puntos

Reglas futuras planeadas:

- Pago adelantado: +15
- Pago tardío: -20
- Bajo uso del límite (<30%): +5
- Uso constante del 100%: -5

### Casos Especiales del Sistema

- **Wallet inexistente en Stellar**: Score = 0 para componente blockchain, fallback a cuestionario únicamente
- **API failure**: Fallback automático a scoring tradicional solo con cuestionario
- **Wallet nueva**: Se valora la existencia misma en Stellar (puntos base por estar en la red)

### Transparencia del Scoring

El sistema retorna breakdown completo:

```json
{
  "scoringBreakdown": {
    "questionnaireScore": 450,
    "stellarScore": 200,
    "finalScore": 680
  }
}
```

---

## 6. Cómo llegar a tener consecuencias legales reales

Para que un sistema digital genere obligaciones legales deben cumplirse:

### 1. Contrato legal válido

El usuario debe aceptar términos donde reconoce: - la existencia de una
línea de crédito - las obligaciones de pago - las consecuencias del
incumplimiento

### 2. Identificación del usuario

Debe existir forma de identificar quién aceptó: - email o teléfono
verificado - firma electrónica - KYC

### 3. Registro verificable e inalterable

Debe demostrarse: - monto adeudado - operaciones realizadas - aceptación
del contrato - fechas y firmas

Aquí blockchain puede reforzar la inmutabilidad.\
Los ZK ayudan a demostrar integridad sin exponer datos sensibles.

---

## 7. Fases recomendadas para el proyecto

### Fase 1: Simulación (hackathon)

- Score
- Límite
- Deuda simulada
- Pagos internos No hay obligación legal real.

### Fase 2: Contrato digital

Base para responsabilidad formal.

### Fase 3: Firma electrónica y/o KYC

Permite ejecutar procesos legales si fuera necesario.

### Fase 4: Registro en blockchain + ZK

Transacciones verificables sin exponer datos privados.

---

## 8. Cómo integrar todo en la API

### Endpoints sugeridos

- POST /score
- POST /credito/asignar
- POST /transaccion
- POST /pago
- GET /estado-cuenta
- GET /score/dinamico
- POST /zk/validar-prueba
- POST /contrato/aceptar
- POST /usuario/verificar

### Arquitectura sugerida

- Servicio de scoring
- Servicio de crédito
- Servicio de transacciones
- Servicio de pagos
- Servicio de auditoría
- Servicio de identidad
- Módulo opcional ZK
- Módulo opcional blockchain

---

## 9. Objetivo final del sistema

Crear un sistema de crédito programable donde: - se asignen límites
basados en score - el usuario consuma y pague - se registre
comportamiento - se genere reputación verificable - exista posibilidad
de responsabilidad legal - se use ZK para privacidad y verificación
