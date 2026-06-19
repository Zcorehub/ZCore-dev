import { describe, expect, it } from "vitest";
import {
  ChallengeRequestSchema,
  CreditEventSchema,
  RegisterSchema,
  WalletParamSchema,
} from "../../middleware/schemas";

const VALID_WALLET =
  "GD4ELZEONXZANIWRJAED5JPBN7KJG6ZQ5AV46HRLZRTEFNKWJP3UFREL";

describe("RegisterSchema", () => {
  it("accepts valid Stellar wallet", () => {
    const result = RegisterSchema.safeParse({ walletAddress: VALID_WALLET });
    expect(result.success).toBe(true);
  });

  it("rejects short wallet address", () => {
    const result = RegisterSchema.safeParse({ walletAddress: "GSHORT" });
    expect(result.success).toBe(false);
  });

  it("rejects wallet with invalid prefix", () => {
    const invalid = "X" + VALID_WALLET.slice(1);
    const result = RegisterSchema.safeParse({ walletAddress: invalid });
    expect(result.success).toBe(false);
  });
});

describe("ChallengeRequestSchema", () => {
  it("accepts valid wallet in challenge request", () => {
    const result = ChallengeRequestSchema.safeParse({
      walletAddress: VALID_WALLET,
    });
    expect(result.success).toBe(true);
  });
});

describe("WalletParamSchema", () => {
  it("validates URL param wallet", () => {
    const result = WalletParamSchema.safeParse({ wallet: VALID_WALLET });
    expect(result.success).toBe(true);
  });
});

describe("CreditEventSchema", () => {
  it("accepts valid credit event payload", () => {
    const result = CreditEventSchema.safeParse({
      apiKey: "dev_platform_key_local",
      eventType: "escrow_completed",
      walletAddress: VALID_WALLET,
      amount: 100,
      txHash: "abc123txhash456789",
      timestamp: new Date().toISOString(),
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid event type", () => {
    const result = CreditEventSchema.safeParse({
      apiKey: "dev_platform_key_local",
      eventType: "invalid_type",
      walletAddress: VALID_WALLET,
      amount: 100,
      txHash: "abc123txhash456789",
      timestamp: new Date().toISOString(),
    });
    expect(result.success).toBe(false);
  });
});
