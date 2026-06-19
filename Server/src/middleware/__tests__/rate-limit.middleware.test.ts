import { NextFunction, Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkRateLimit } from "../../services/rate-limit.service";
import {
  bodyApiKey,
  clientIpKey,
  createRateLimiter,
  headerApiKey,
} from "../rate-limit.middleware";

vi.mock("../../services/rate-limit.service", () => ({
  checkRateLimit: vi.fn(),
}));

const mockedCheckRateLimit = vi.mocked(checkRateLimit);

function mockRequest(overrides: Partial<Request> = {}) {
  return {
    ip: "203.0.113.10",
    socket: { remoteAddress: "203.0.113.11" },
    headers: {},
    body: {},
    ...overrides,
  } as Request;
}

function mockResponse() {
  const res = {
    setHeader: vi.fn(),
    status: vi.fn(),
    json: vi.fn(),
  };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res as unknown as Response;
}

function middleware(limit = 2) {
  return createRateLimiter({
    name: "test-route",
    limit,
    windowSec: 60,
    keyGenerator: (req) => req.ip || "unknown",
  });
}

describe("rate limit middleware", () => {
  beforeEach(() => {
    mockedCheckRateLimit.mockReset();
  });

  it("allows requests when the backing limiter allows the generated route key", async () => {
    mockedCheckRateLimit.mockResolvedValue({ allowed: true });
    const req = mockRequest();
    const res = mockResponse();
    const next = vi.fn() as NextFunction;

    await middleware()(req, res, next);

    expect(mockedCheckRateLimit).toHaveBeenCalledWith(
      "test-route:203.0.113.10",
      2,
      60
    );
    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("returns 429 with Retry-After when the backing limiter rejects", async () => {
    mockedCheckRateLimit.mockResolvedValue({
      allowed: false,
      retryAfterSec: 17,
    });
    const req = mockRequest();
    const res = mockResponse();
    const next = vi.fn() as NextFunction;

    await middleware(2)(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.setHeader).toHaveBeenCalledWith("Retry-After", "17");
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Too many requests. Please try again later.",
      retryAfterSec: 17,
    });
  });

  it("forwards limiter errors to Express error handling", async () => {
    const error = new Error("rate limit backend down");
    mockedCheckRateLimit.mockRejectedValue(error);
    const req = mockRequest();
    const res = mockResponse();
    const next = vi.fn() as NextFunction;

    await middleware(2)(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("builds stable client and api-key identities", () => {
    expect(
      clientIpKey(
        mockRequest({ headers: { "x-forwarded-for": "198.51.100.4, proxy" } })
      )
    ).toBe("198.51.100.4");
    expect(bodyApiKey(mockRequest({ body: { apiKey: "body-key" } }))).toBe(
      "body-key"
    );
    expect(headerApiKey(mockRequest({ headers: { "x-api-key": "header-key" } }))).toBe(
      "header-key"
    );
  });
});
