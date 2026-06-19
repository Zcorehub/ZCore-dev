# ZCore Soroban Contracts

Smart contracts for on-chain credit score attestation on Stellar.

## score-registry

Stores portable credit scores attested by the ZCore oracle. Lenders and DeFi protocols can read scores directly from chain without calling the ZCore API.

### Functions

| Function | Auth | Description |
|---|---|---|
| `init(admin)` | — | One-time setup with oracle admin address |
| `interface_version()` | Public | Returns IZCoreScore interface version (currently 1) |
| `set_score(wallet, score, tier, ttl_secs)` | Oracle admin | Publish score with optional TTL |
| `set_scores_batch(wallets, scores, tiers, ttl_secs)` | Oracle admin | Batch attestation (max 25 wallets) |
| `get_score(wallet)` | Public | Read attested score for any wallet |
| `get_tier(wallet)` | Public | Read tier code only |
| `is_attested(wallet)` | Public | True if wallet has attestation |
| `is_score_fresh(wallet, max_age_secs)` | Public | Freshness check |
| `get_score_if_fresh(wallet, max_age_secs)` | Public | Fresh score or REJECTED default |
| `pause()` / `unpause()` | Oracle admin | Emergency pause (#27) |
| `admin()` | Public | Returns oracle admin address |

### Events

| Topic | Payload |
|---|---|
| `score_updated` | wallet, score, tier, previous_score, previous_tier, updated_at |

### Tier encoding

| Value | Tier |
|---|---|
| 0 | REJECTED |
| 1 | C |
| 2 | B |
| 3 | A |

### Score freshness TTL (recommended)

| Tier | TTL |
|---|---|
| A | 30 days |
| B | 21 days |
| C | 14 days |
| REJECTED | 7 days |

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

See `Contracts/interfaces/README.md` for the standard IZCoreScore integration guide.
