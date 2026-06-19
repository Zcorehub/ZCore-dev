import "dotenv/config";
import type { Prisma } from "@prisma/client";
import { prisma } from "../src/config/database";
import { calculateStellarBase } from "../src/services/scoring.service";
import { recalculateScoreFromInputs } from "../src/services/score-recalculation.service";

type RecalcArgs = {
  apply: boolean;
  adminKey?: string;
  wallet?: string;
};

const parseArgs = (argv: string[]): RecalcArgs => {
  const args: RecalcArgs = { apply: false };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--apply") args.apply = true;
    if (arg === "--dry-run") args.apply = false;
    if (arg === "--wallet") args.wallet = argv[++i];
    if (arg === "--admin-key") args.adminKey = argv[++i];
  }

  return args;
};

const assertAuthorized = (args: RecalcArgs) => {
  const expected = process.env.ADMIN_SECRET;
  if (!expected) {
    throw new Error("ADMIN_SECRET must be set before recalculating scores");
  }
  if (args.adminKey && args.adminKey !== expected) {
    throw new Error("--admin-key does not match ADMIN_SECRET");
  }
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  assertAuthorized(args);

  const users = await prisma.user.findMany({
    where: args.wallet ? { walletAddress: args.wallet } : undefined,
    include: {
      creditEvents: true,
      payments: true,
    },
    orderBy: { walletAddress: "asc" },
  });

  if (args.wallet && users.length === 0) {
    throw new Error(`No user found for wallet ${args.wallet}`);
  }

  console.log(
    `Recalculating ${users.length} user score(s) in ${args.apply ? "apply" : "dry-run"} mode`
  );
  console.log("wallet,oldScore,newScore,delta,oldTier,newTier");

  for (const user of users) {
    const stellarBase = await calculateStellarBase(user.walletAddress);
    const next = recalculateScoreFromInputs({
      stellarBase: stellarBase.score,
      creditEvents: user.creditEvents,
      payments: user.payments,
    });
    const delta = next.score - user.score;

    console.log(
      `${user.walletAddress},${user.score},${next.score},${delta},${user.profileTier},${next.profileTier}`
    );

    if (args.apply && delta !== 0) {
      await prisma.$transaction((tx: Prisma.TransactionClient) =>
        tx.user.update({
          where: { id: user.id },
          data: {
            score: next.score,
            profileTier: next.profileTier,
            stellarData: stellarBase.stellarData as unknown as Prisma.InputJsonValue,
          },
        })
      );
    }
  }
};

if (require.main === module) {
  main()
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}