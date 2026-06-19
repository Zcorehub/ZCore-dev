# @zcore/lender-sdk

TypeScript client for ZCore partner lenders and platforms.

## Install

```bash
npm install @zcore/lender-sdk
# or link locally from this monorepo:
cd packages/lender-sdk && npm install && npm run build && npm link
```

## Quick start

```typescript
import { ZCoreClient, verifyWebhookSignature } from "@zcore/lender-sdk";

const client = new ZCoreClient({
  baseUrl: "https://zcore-api.vercel.app",
  apiKey: process.env.ZCORE_LENDER_KEY!,
});

const score = await client.getScore("G...");
console.log(score.tier, score.breakdown);

const history = await client.getScoreHistory("G...", { limit: 10, offset: 0 });

const valid = verifyWebhookSignature(rawBody, signature, webhookSecret);
```

## Methods

| Method | Description |
|--------|-------------|
| `getScore(wallet)` | Lender score + breakdown |
| `getHistory(wallet, pagination?)` | Credit events (requires wallet JWT on user routes — use lender score path for partners) |
| `getScoreHistory(wallet, pagination?)` | Score delta timeline |
| `defineProfiles(profiles)` | Update lender risk profiles |
| `checkEligibility(wallet, { lenderId, requestedAmount, minTier? })` | Scoring request helper |

## Example script

```bash
ZCORE_LENDER_KEY=your_key npx ts-node examples/query-score.ts G...
```

## Related

- Webhook verification: `verifyWebhookSignature(body, signature, secret)`
- API docs: `https://zcore-api.vercel.app/api-docs`
