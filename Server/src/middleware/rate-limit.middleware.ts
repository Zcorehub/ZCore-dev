import { NextFunction, Request, RequestHandler, Response } from "express";

type RateLimitIdentity = (req: Request) => string;

type RateLimitOptions = {
  name: string;
  limit: number;
  windowSeconds: number;
  identity: RateLimitIdentity;
};

type RateLimitResult = {
  allowed: boolean;
  retryAfter: number;
};

let warnedMissingRedis = false;
let warnedRedisFailure = false;

const redisUrl = () => process.env.UPSTASH_REDIS_REST_URL?.replace(/\/$/, "");
const redisToken = () => process.env.UPSTASH_REDIS_REST_TOKEN;

function warnOnce(kind: "missing" | "failure", message: string) {
  if (kind === "missing") {
    if (!warnedMissingRedis) {
      warnedMissingRedis = true;
      console.warn(message);
    }
    return;
  }

  if (!warnedRedisFailure) {
    warnedRedisFailure = true;
    console.warn(message);
  }
}

function encodeIdentity(identity: string) {
  return Buffer.from(identity).toString("base64url");
}

function currentWindow(windowSeconds: number) {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const id = Math.floor(now / windowMs);
  const resetAt = (id + 1) * windowMs;
  return {
    id,
    retryAfter: Math.max(1, Math.ceil((resetAt - now) / 1000)),
  };
}

async function checkRateLimit(
  keyPrefix: string,
  identity: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const url = redisUrl();
  const token = redisToken();

  if (!url || !token) {
    warnOnce(
      "missing",
      "Rate limiting disabled: UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN is not configured."
    );
    return { allowed: true, retryAfter: 0 };
  }

  const window = currentWindow(windowSeconds);
  const redisKey = `rate-limit:${keyPrefix}:${encodeIdentity(identity)}:${window.id}`;

  try {
    const response = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", redisKey],
        ["EXPIRE", redisKey, windowSeconds + 1],
      ]),
    });

    if (!response.ok) {
      throw new Error(`Redis rate limit request failed with ${response.status}`);
    }

    const payload = (await response.json()) as Array<{ result?: unknown }>;
    const count = Number(payload[0]?.result);

    if (!Number.isFinite(count)) {
      throw new Error("Redis rate limit response did not include a numeric count");
    }

    return {
      allowed: count <= limit,
      retryAfter: window.retryAfter,
    };
  } catch (error) {
    warnOnce(
      "failure",
      `Rate limiting unavailable; allowing request. ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    return { allowed: true, retryAfter: 0 };
  }
}

export function createRateLimitMiddleware(options: RateLimitOptions): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    const identity = options.identity(req);
    const result = await checkRateLimit(
      options.name,
      identity,
      options.limit,
      options.windowSeconds
    );

    if (!result.allowed) {
      res.setHeader("Retry-After", result.retryAfter.toString());
      return res.status(429).json({
        success: false,
        error: "Rate limit exceeded",
        retryAfter: result.retryAfter,
      });
    }

    return next();
  };
}

function requestIp(req: Request) {
  return req.ip || req.socket.remoteAddress || "unknown-ip";
}

function headerValue(req: Request, header: string) {
  const value = req.headers[header.toLowerCase()];
  if (Array.isArray(value)) {
    return value[0] || requestIp(req);
  }
  return value || requestIp(req);
}

function bodyApiKey(req: Request) {
  const body = req.body as { apiKey?: unknown } | undefined;
  return typeof body?.apiKey === "string" && body.apiKey.trim()
    ? body.apiKey
    : requestIp(req);
}

export const authChallengeRateLimit: RequestHandler = createRateLimitMiddleware({
  name: "auth-challenge",
  limit: 10,
  windowSeconds: 60,
  identity: requestIp,
});

export const signedAuthRateLimit: RequestHandler = createRateLimitMiddleware({
  name: "signed-auth",
  limit: 5,
  windowSeconds: 60,
  identity: requestIp,
});

export const eventReportRateLimit: RequestHandler = createRateLimitMiddleware({
  name: "events-report",
  limit: 100,
  windowSeconds: 60,
  identity: bodyApiKey,
});

export const lenderScoreRateLimit: RequestHandler = createRateLimitMiddleware({
  name: "lender-score",
  limit: 60,
  windowSeconds: 60,
  identity: (req) => headerValue(req, "x-api-key"),
});

export function resetRateLimitWarningsForTests() {
  warnedMissingRedis = false;
  warnedRedisFailure = false;
}
