import { NextFunction, Request, Response } from "express";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createRateLimitMiddleware,
  resetRateLimitWarningsForTests,
} from "../rate-limit.middleware";

const ORIGINAL_REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const ORIGINAL_REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

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
  return createRateLimitMiddleware({
    name: "test-route",
    limit,
    windowSeconds: 60,
    identity: (req) => req.ip || "unknown",
  });
}

describe("rate limit middleware", () => {
  beforeEach(() => {
    resetRateLimitWarningsForTests();
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    if (ORIGINAL_REDIS_URL === undefined) {
      delete process.env.UPSTASH_REDIS_REST_URL;
    } else {
      process.env.UPSTASH_REDIS_REST_URL = ORIGINAL_REDIS_URL;
    }

    if (ORIGINAL_REDIS_TOKEN === undefined) {
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
    } else {
      process.env.UPSTASH_REDIS_REST_TOKEN = ORIGINAL_REDIS_TOKEN;
    }

    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("allows requests when Redis is not configured", async () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = vi.fn() as NextFunction;

    await middleware()(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("Rate limiting disabled")
    );
  });

  it("returns 429 with Retry-After when the Redis counter exceeds the limit", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://redis.example.com";
    process.env.UPSTASH_REDIS_REST_TOKEN = "token";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ result: 3 }, { result: 1 }],
      })
    );

    const req = mockRequest();
    const res = mockResponse();
    const next = vi.fn() as NextFunction;

    await middleware(2)(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.setHeader).toHaveBeenCalledWith("Retry-After", expect.any(String));
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Rate limit exceeded",
      retryAfter: expect.any(Number),
    });
  });

  it("fails open when Redis returns an error", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://redis.example.com/";
    process.env.UPSTASH_REDIS_REST_TOKEN = "token";
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    const req = mockRequest();
    const res = mockResponse();
    const next = vi.fn() as NextFunction;

    await middleware(2)(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("Rate limiting unavailable")
    );
  });
});
