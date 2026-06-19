import { describe, expect, it, vi } from "vitest";
import { requireWalletSession } from "../../middleware/session.middleware";
import { createSessionToken } from "../../services/session.service";

const WALLET =
  "GD4ELZEONXZANIWRJAED5JPBN7KJG6ZQ5AV46HRLZRTEFNKWJP3UFREL";

function mockResponse() {
  const res: {
    statusCode: number;
    body: unknown;
    status: (code: number) => typeof res;
    json: (payload: unknown) => typeof res;
  } = {
    statusCode: 200,
    body: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
  return res;
}

describe("requireWalletSession", () => {
  it("returns 401 without Authorization header", () => {
    process.env.JWT_SECRET = "test-secret";
    const req = { headers: {}, params: { wallet: WALLET } } as never;
    const res = mockResponse();
    const next = vi.fn();

    requireWalletSession(req, res as never, next);

    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("allows valid token matching wallet param", () => {
    process.env.JWT_SECRET = "test-secret";
    const token = createSessionToken(WALLET);
    const req = {
      headers: { authorization: `Bearer ${token}` },
      params: { wallet: WALLET },
    } as never;
    const res = mockResponse();
    const next = vi.fn();

    requireWalletSession(req, res as never, next);

    expect(next).toHaveBeenCalled();
  });

  it("returns 403 when token wallet mismatches route", () => {
    process.env.JWT_SECRET = "test-secret";
    const token = createSessionToken(WALLET);
    const req = {
      headers: { authorization: `Bearer ${token}` },
      params: { wallet: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF" },
    } as never;
    const res = mockResponse();
    const next = vi.fn();

    requireWalletSession(req, res as never, next);

    expect(res.statusCode).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });
});
