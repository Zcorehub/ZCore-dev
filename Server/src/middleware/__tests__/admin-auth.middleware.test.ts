import { describe, expect, it, vi } from "vitest";
import { requireAdminKey } from "../../middleware/admin-auth.middleware";

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

describe("requireAdminKey", () => {
  it("returns 403 without valid admin key", () => {
    process.env.ADMIN_SECRET = "secret";
    const req = { headers: {} } as never;
    const res = mockResponse();
    const next = vi.fn();

    requireAdminKey(req, res as never, next);

    expect(res.statusCode).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("allows valid admin key", () => {
    process.env.ADMIN_SECRET = "secret";
    const req = { headers: { "x-admin-key": "secret" } } as never;
    const res = mockResponse();
    const next = vi.fn();

    requireAdminKey(req, res as never, next);

    expect(next).toHaveBeenCalled();
  });
});
