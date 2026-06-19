import { describe, expect, it } from "vitest";
import {
  buildChallengeMessage,
  createChallenge,
  validateChallengeMessage,
} from "../../services/auth-challenge.service";

const VALID_WALLET =
  "GD4ELZEONXZANIWRJAED5JPBN7KJG6ZQ5AV46HRLZRTEFNKWJP3UFREL";

describe("createChallenge", () => {
  it("returns message with 5-minute expiry window", () => {
    const before = Date.now();
    const { message, expiresAt } = createChallenge(VALID_WALLET);
    const after = Date.now();

    expect(message).toContain("ZCore Authentication");
    expect(message).toContain(VALID_WALLET);
    expect(expiresAt).toBeGreaterThanOrEqual(before + 5 * 60 * 1000 - 100);
    expect(expiresAt).toBeLessThanOrEqual(after + 5 * 60 * 1000 + 100);
  });
});

describe("validateChallengeMessage", () => {
  it("accepts valid unexpired challenge", () => {
    const { message } = createChallenge(VALID_WALLET);
    expect(validateChallengeMessage(message, VALID_WALLET)).toBe(true);
  });

  it("rejects tampered wallet line", () => {
    const payload = {
      walletAddress: VALID_WALLET,
      nonce: "test-nonce",
      issuedAt: Date.now(),
      expiresAt: Date.now() + 60_000,
    };
    const message = buildChallengeMessage(payload);
    const tampered = message.replace(VALID_WALLET, VALID_WALLET.slice(0, -1) + "X");
    expect(validateChallengeMessage(tampered, VALID_WALLET)).toBe(false);
  });

  it("rejects expired challenge", () => {
    const payload = {
      walletAddress: VALID_WALLET,
      nonce: "expired",
      issuedAt: Date.now() - 120_000,
      expiresAt: Date.now() - 60_000,
    };
    const message = buildChallengeMessage(payload);
    expect(validateChallengeMessage(message, VALID_WALLET)).toBe(false);
  });

  it("rejects wrong header", () => {
    const message = "Wrong Header\nWallet: " + VALID_WALLET;
    expect(validateChallengeMessage(message, VALID_WALLET)).toBe(false);
  });
});
