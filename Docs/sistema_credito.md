# Sistema de Crédito ZCore - Conceptos y Roadmap

> **Nota:** Este documento describe el modelo conceptual del sistema de crédito y características en roadmap. Para la implementación actual (Model B), ver `arquitectura_zcore.md` y `metodologia_scoring.md`.

---

## Modelo Actual: Agregador de Eventos Verificados

ZCore NO presta dinero ni gestiona crédito directamente. El modelo actual es:

1. **Plataformas partner** (Trustless Work, Blend, Vaquita) gestionan sus propios productos de crédito/escrow/tandas.
2. **ZCore** agrega los eventos de pago verificados en un score portable (0-850).
3. **Cualquier DeFi** puede consultar ese score para tomar decisiones de crédito.

---

## Zero-Knowledge Proofs (Roadmap)

Un ZK Proof permite demostrar que algo es verdad sin revelar los datos subyacentes.

**Aplicaciones planeadas para ZCore:**

- Demostrar que el score es ≥ N sin revelar el valor exacto
- Demostrar que el usuario está en Tier A/B sin revelar score
- Validar elegibilidad sin exponer historial completo

**Estado:** No implementado en v1.0. Issue abierto para contribuidores.

---

## Cómo se Registra el Comportamiento de Pago

ZCore no maneja dinero. El flujo es:

```
1. Usuario paga en la plataforma partner (on-chain en Stellar)
2. Plataforma detecta el pago exitoso
3. Plataforma llama POST /api/events/report con el txHash
4. ZCore verifica el txHash en Horizon (debe ser exitoso)
5. ZCore actualiza el score del usuario
```

La plataforma es responsable de detectar los pagos. ZCore solo verifica y agrega.

---

## Sistema de Score Dinámico (Actual)

Eventos que impactan el score:

| Evento | Impacto Base | Máximo | Plataforma |
|---|---|---|---|
| `escrow_completed` | +15 pts | +60 pts | Trustless Work |
| `loan_repaid` | +20 pts | +80 pts | Blend Protocol |
| `tanda_round_paid` | +10 pts | +30 pts | Vaquita |
| `tanda_cycle_completed` | +40 pts | +100 pts | Vaquita |

El impacto crece con el monto (perUSDC × amount) hasta el máximo por evento.

Score negativo: No implementado en v1. Los defaults actualmente no restan puntos — issue abierto.

---

## Fases del Sistema

### Fase 1: MVP de Agregación (Implementado)
- Score 0-850 desde Stellar Base + Credit Events
- txHash uniqueness (anti-replay)
- Counterparty decay (anti-Sybil)
- Platform API key system
- Score/history endpoints públicos

### Fase 2: Consecuencias Negativas (Roadmap)
- Penalización por default reportado por plataforma
- Score decay por inactividad
- Monthly rate limits

### Fase 3: ZK Proofs (Roadmap)
- Prueba de score mínimo sin revelar valor
- Prueba de tier sin revelar score
- Verificación off-chain con prueba on-chain

### Fase 4: Contrato Digital (Roadmap)
- Términos de uso vinculantes
- Firma electrónica de compromisos
- KYC opcional para límites altos

---

## Responsabilidad Legal

ZCore provee infraestructura de información. Las decisiones de crédito las toman las plataformas partner. ZCore:

- ✅ Verifica que los txHash sean reales en Stellar
- ✅ Agrega eventos verificados en un score
- ❌ No presta dinero
- ❌ No toma decisiones de crédito
- ❌ No custodia fondos

El flujo de dinero es siempre: **Usuario ↔ Plataforma Partner (on-chain en Stellar)**
