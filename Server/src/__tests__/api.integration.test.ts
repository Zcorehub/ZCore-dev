import { beforeAll, describe, expect, it, vi } from "vitest";
import request from "supertest";
import app from "../app";
import { prisma } from "../config/database";

const WALLET =
  "GD4ELZEONXZANIWRJAED5JPBN7KJG6ZQ5AV46HRLZRTEFNKWJP3UFREL";

vi.mock("../services/auth-challenge.service", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../services/auth-challenge.service")>();
  return {
    ...actual,
    verifyWalletSignature: vi.fn().mockResolvedValue(true),
  };
});

vi.mock("../services/stellar.service", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../services/stellar.service")>();
  return {
    ...actual,
    verifyTransaction: vi.fn().mockResolvedValue({
      valid: true,
      successful: true,
      sourceAccount:
        "GD4ELZEONXZANIWRJAED5JPBN7KJG6ZQ5AV46HRLZRTEFNKWJP3UFREL",
      createdAt: new Date().toISOString(),
    }),
    fetchStellarWalletData: vi.fn().mockResolvedValue({
      walletAge: 365,
      totalTransactions: 10,
      successfulTransactions: 10,
      averageBalance: 50,
      accountAge: 365,
      operationsCount: 5,
      trustlineCount: 1,
      isValid: true,
      firstTransactionDate: "2024-01-01T00:00:00.000Z",
    }),
  };
});

const runIntegration = process.env.DATABASE_URL ? describe : describe.skip;

runIntegration("API integration", () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test_jwt_secret";
    process.env.ADMIN_SECRET = process.env.ADMIN_SECRET ?? "test_admin";

    await prisma.creditEvent.deleteMany({
      where: { txHash: "integration_test_tx_hash_unique" },
    });

    await prisma.user.upsert({
      where: { walletAddress: WALLET },
      update: { score: 120, profileTier: "C" },
      create: {
        walletAddress: WALLET,
        score: 120,
        profileTier: "C",
        stellarData: { isValid: true },
      },
    });

    await prisma.platform.upsert({
      where: { id: "test-platform" },
      update: { active: true },
      create: {
        id: "test-platform",
        name: "Test Platform",
        apiKey: "test_platform_key_integration",
        webhookSecret: "test_webhook_secret",
        active: true,
      },
    });
  });

  it("login with signed auth returns JWT", async () => {
    const response = await request(app)
      .post("/api/auth/login/signed")
      .send({
        walletAddress: WALLET,
        message: "ZCore Authentication\nWallet: test",
        signature: "dGVzdFNpZ24=",
      });

    expect(response.status).toBe(200);
    expect(response.body.data.token).toBeDefined();
    expect(response.body.data.score).toBe(120);
  });

  it("protects profile route without session token", async () => {
    const response = await request(app).get(`/api/user/${WALLET}/profile`);
    expect(response.status).toBe(401);
  });

  it("allows profile access with valid JWT", async () => {
    const auth = await request(app)
      .post("/api/auth/login/signed")
      .send({
        walletAddress: WALLET,
        message: "ZCore Authentication\nWallet: test",
        signature: "dGVzdFNpZ24=",
      });

    const token = auth.body.data.token as string;

    const profile = await request(app)
      .get(`/api/user/${WALLET}/profile`)
      .set("Authorization", `Bearer ${token}`);

    expect(profile.status).toBe(200);
    expect(profile.body.data.walletAddress).toBe(WALLET);
  });

  it("returns 401 for lender score without API key", async () => {
    const response = await request(app).get(`/api/user/${WALLET}/score`);
    expect(response.status).toBe(401);
  });

  it("rejects duplicate event txHash with 409", async () => {
    const payload = {
      apiKey: "test_platform_key_integration",
      eventType: "escrow_completed",
      walletAddress: WALLET,
      amount: 100,
      txHash: "integration_test_tx_hash_unique",
      timestamp: new Date().toISOString(),
    };

    const first = await request(app).post("/api/events/report").send(payload);
    expect(first.status).toBe(200);

    const duplicate = await request(app)
      .post("/api/events/report")
      .send(payload);
    expect(duplicate.status).toBe(409);
  });
});
