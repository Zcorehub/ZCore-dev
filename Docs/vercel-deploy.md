# Vercel deployment guide

ZCore uses two Vercel projects in this monorepo.

## Projects

| Project | Root | URL |
|---------|------|-----|
| dapp-zcore | `Front/` | https://dapp-zcore.vercel.app |
| zcore-api | `Server/` | https://zcore-api.vercel.app |

## Git integration (#20)

1. Connect `Zcorehub/ZCore-dev` to both Vercel projects
2. Set root directory per project (`Front` / `Server`)
3. Production branch: `main`
4. Enable preview deployments for PRs

## Required environment variables

### dapp-zcore

- `NEXT_PUBLIC_API_BASE_URL=https://zcore-api.vercel.app`
- `NEXT_PUBLIC_STELLAR_NETWORK=testnet`

### zcore-api

- `DATABASE_URL` — managed MySQL (#15)
- `ADMIN_SECRET` — strong random secret
- `STELLAR_NETWORK=testnet`
- `SCORE_REGISTRY_CONTRACT_ID` — optional (#16)
- `ORACLE_SECRET_KEY` — optional

## Oracle admin rotation

Use this runbook when `ORACLE_SECRET_KEY` is compromised or when ownership moves
to a new operator key. Never commit either secret key.

1. Generate and store the replacement key outside git.
2. Pause the score registry with the current oracle admin key.
3. Propose the new admin from `Server/`:

```bash
ORACLE_SECRET_KEY=<current secret> \
SCORE_REGISTRY_CONTRACT_ID=<contract id> \
STELLAR_NETWORK=testnet \
npx ts-node scripts/rotate-oracle-admin.ts propose <new admin public key> --send
```

4. Accept with the new oracle secret:

```bash
NEW_ORACLE_SECRET_KEY=<new secret> \
SCORE_REGISTRY_CONTRACT_ID=<contract id> \
STELLAR_NETWORK=testnet \
npx ts-node scripts/rotate-oracle-admin.ts accept --send
```

5. Update Vercel `ORACLE_SECRET_KEY` to the new secret, redeploy `zcore-api`,
   then unpause the score registry with the new admin key.

Omit `--send` to prepare and inspect the transaction XDR without broadcasting.

## Manual deploy (fallback)

```bash
cd Front && vercel --prod
cd Server && vercel --prod
```

## Health checks after deploy

```bash
curl https://zcore-api.vercel.app/health
curl https://zcore-api.vercel.app/health/ready
curl https://dapp-zcore.vercel.app
```
