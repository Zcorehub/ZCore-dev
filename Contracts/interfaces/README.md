# IZCoreScore Interface

Standard interface for reading ZCore credit scores from Soroban contracts.

## Interface version

Current version: **1** (`interface_version()` returns `1`)

## Tier encoding

| Code | Label |
|------|-------|
| 0 | REJECTED |
| 1 | C |
| 2 | B |
| 3 | A |

## Core read functions

| Function | Description |
|----------|-------------|
| `get_score(wallet)` | Full score record |
| `get_tier(wallet)` | Tier code only |
| `is_attested(wallet)` | True if wallet has been attested |
| `is_score_fresh(wallet, max_age_secs)` | Freshness check |
| `get_score_if_fresh(wallet, max_age_secs)` | Score or default REJECTED |

## TypeScript types

See `Server/src/types/soroban/score-types.ts` for shared types used by the API and partner integrations.

```typescript
import {
  tierCodeToLabel,
  isScoreFresh,
  ZCORE_INTERFACE_VERSION,
} from "../types/soroban/score-types";
```

## Score freshness TTL (recommended)

| Tier | TTL |
|------|-----|
| A | 30 days |
| B | 21 days |
| C | 14 days |
| REJECTED | 7 days |

Oracle passes `ttl_secs` to `set_score` on attestation.

## Events

Topic: `("score_updated",)` — emitted on every `set_score` with previous and new values.

## Related

- Implementation: `Contracts/score-registry/src/lib.rs`
- Local test mock: `Contracts/mock-score-registry/src/lib.rs`
- Server bindings: `Server/src/services/soroban.service.ts`
- Issue #32 tracking
