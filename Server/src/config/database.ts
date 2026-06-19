import { PrismaClient } from "@prisma/client";
import { dbQueryDurationSeconds } from "../services/metrics.service";

const baseClient = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});

export const prisma = baseClient.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const startedAt = Date.now();
        const result = await query(args);
        dbQueryDurationSeconds.observe(
          { operation: `${model}.${operation}` },
          (Date.now() - startedAt) / 1000
        );
        return result;
      },
    },
  },
});

process.on("beforeExit", async () => {
  await prisma.$disconnect();
});
