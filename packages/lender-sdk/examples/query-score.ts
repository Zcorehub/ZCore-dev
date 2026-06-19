import { ZCoreClient } from "../src";

async function main() {
  const wallet = process.argv[2];
  if (!wallet) {
    console.error("Usage: npx ts-node examples/query-score.ts <wallet>");
    process.exit(1);
  }

  const client = new ZCoreClient({
    baseUrl: process.env.ZCORE_BASE_URL ?? "https://zcore-api.vercel.app",
    apiKey: process.env.ZCORE_LENDER_KEY ?? "",
  });

  const score = await client.getScore(wallet);
  console.log(JSON.stringify(score, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
