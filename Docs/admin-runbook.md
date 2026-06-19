# Admin Runbook

## Recalculate user credit scores

Use the score recalculation CLI after scoring-weight changes, dispute reversals, or data recovery work. The tool rebuilds each user's score from their Stellar base, stored credit events, and stored payment-status deltas.

```bash
cd Server

# Dry run is the default and only prints wallet, old score, new score, and delta.
ADMIN_SECRET=... npm run recalc:scores -- --dry-run

# Apply updates to User.score and User.profileTier.
ADMIN_SECRET=... npm run recalc:scores -- --apply

# Recalculate one wallet.
ADMIN_SECRET=... npm run recalc:scores -- --wallet G... --apply
```

The command requires `ADMIN_SECRET` to be present. You may also pass `--admin-key` to verify an operator-provided key against `ADMIN_SECRET` before the run starts.