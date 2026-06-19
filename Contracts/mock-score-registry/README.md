# Mock Score Registry

TEST ONLY mock implementation of the `IZCoreScore` interface for local Server integration tests.

Do not deploy this contract to mainnet. It has no admin authorization: any caller can set mock scores.

## Functions

| Function | Auth | Description |
|---|---|---|
| `init()` | none | Marks the mock as initialized |
| `set_mock_score(wallet, score, tier)` | none | Stores a mock score record for `wallet` |
| `get_score(wallet)` | public | Reads the configured mock score or a default rejected record |
| `interface_version()` | public | Returns `1` |

## Local build

```bash
cd Contracts/mock-score-registry
stellar contract build
```

## Local sandbox deploy

```bash
stellar contract deploy \
  --wasm target/wasm32v1-none/release/mock_score_registry.wasm \
  --source alice \
  --network local

stellar contract invoke \
  --id <MOCK_CONTRACT_ID> \
  --source alice \
  --network local \
  -- init
```

Set `SCORE_REGISTRY_CONTRACT_ID=<MOCK_CONTRACT_ID>` in `Server/.env` or call
`withMockContractId("<MOCK_CONTRACT_ID>")` from Server tests.
