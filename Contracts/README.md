# ZCore Soroban Contracts

Smart contracts for on-chain credit score attestation on Stellar.

## score-registry

Stores portable credit scores attested by the ZCore oracle. Lenders and DeFi protocols can read scores directly from chain without calling the ZCore API.

### Functions

| Function | Auth | Description |
|---|---|---|
| `init(admin)` | — | One-time setup with oracle admin address |
| `set_score(wallet, score, tier)` | Oracle admin | Publish score (0–850) and tier (0–3) |
| `get_score(wallet)` | Public | Read attested score for any wallet |
| `admin()` | Public | Returns oracle admin address |

### Tier encoding

| Value | Tier |
|---|---|
| 0 | REJECTED |
| 1 | C |
| 2 | B |
| 3 | A |

### Build & deploy

```bash
# Install Stellar CLI: https://developers.stellar.org/docs/tools/cli
cargo install --locked stellar-cli

# Build WASM
cd Contracts/score-registry
stellar contract build

# Deploy to testnet (requires funded account)
stellar contract deploy \
  --wasm target/wasm32v1-none/release/score_registry.wasm \
  --source YOUR_SECRET_KEY \
  --network testnet

# Initialize with oracle admin public key
stellar contract invoke \
  --id CONTRACT_ID \
  --source ORACLE_SECRET \
  --network testnet \
  -- init --admin GORACLE...
```

Set `SCORE_REGISTRY_CONTRACT_ID` and `ORACLE_SECRET_KEY` in Server `.env` to enable automatic attestation after score updates.
