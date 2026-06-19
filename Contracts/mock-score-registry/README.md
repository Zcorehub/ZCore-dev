# Mock Score Registry (TEST ONLY)

Simplified Soroban contract for local integration tests. **Never deploy to mainnet.**

## Functions

| Function | Description |
|----------|-------------|
| `init()` | Marks contract initialized (no admin auth) |
| `interface_version()` | Returns `1` |
| `set_mock_score(wallet, score, tier)` | Anyone can set a mock score |
| `get_score(wallet)` | Returns configured `ScoreRecord` |

## Build

```bash
cd Contracts/mock-score-registry
cargo test
stellar contract build
```

## Local deploy (testnet/sandbox)

```bash
stellar contract deploy \
  --wasm target/wasm32v1-none/release/mock_score_registry.wasm \
  --source-account YOUR_TESTNET_KEY \
  --network testnet
```

Use the returned contract ID in tests:

```typescript
import { withMockContractId, clearMockContractId } from "../test-helpers/mock-soroban";

withMockContractId("C...");
// run readOnChainScore(...)
clearMockContractId();
```

## Related

- Production registry: `Contracts/score-registry/`
- Interface spec: `Contracts/interfaces/README.md`
