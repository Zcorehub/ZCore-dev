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
- `JWT_SECRET` — wallet session tokens (#35)
- `METRICS_SECRET` — optional bearer for `/metrics` (#38)
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — distributed rate limits (#42)

## Prometheus metrics (#38)

Scrape `GET https://zcore-api.vercel.app/metrics` from an external collector (Grafana Agent, Datadog, etc.). If `METRICS_SECRET` is set, send `Authorization: Bearer <secret>`.

Example `prometheus.yml` scrape config:

```yaml
scrape_configs:
  - job_name: zcore-api
    metrics_path: /metrics
    scheme: https
    static_configs:
      - targets: ["zcore-api.vercel.app"]
    authorization:
      credentials: YOUR_METRICS_SECRET
```

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
