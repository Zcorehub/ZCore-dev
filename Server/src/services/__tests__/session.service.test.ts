import { describe, expect, it } from "vitest";
import {
  createSessionToken,
  verifySessionToken,
} from "../../services/session.service";

const WALLET =
  "GD4ELZEONXZANIWRJAED5JPBN7KJG6ZQ5AV46HRLZRTEFNKWJP3UFREL";

describe("session.service", () => {
  it("creates and verifies a session token", () => {
    process.env.JWT_SECRET = "test-secret";
    const token = createSessionToken(WALLET);
    const claims = verifySessionToken(token);
    expect(claims?.walletAddress).toBe(WALLET);
  });

  it("rejects invalid tokens", () => {
    process.env.JWT_SECRET = "test-secret";
    expect(verifySessionToken("invalid.token.here")).toBeNull();
  });
});
