import { logStructured } from "../utils/logger.util";

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSec?: number;
}

interface BucketState {
  count: number;
  resetAt: number;
}

const memoryBuckets = new Map<string, BucketState>();
let warnedFallback = false;

type UpstashLimiter = {
  limit: (key: string) => Promise<{
    success: boolean;
    reset: number;
  }>;
};

let upstashLimiters: Map<string, UpstashLimiter> | undefined;

async function getUpstashLimiter(
  limit: number,
  windowSec: number
): Promise<UpstashLimiter | null> {
  const cacheKey = `${limit}:${windowSec}`;

  if (upstashLimiters?.has(cacheKey)) {
    return upstashLimiters.get(cacheKey) ?? null;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  const { Ratelimit } = await import("@upstash/ratelimit");
  const { Redis } = await import("@upstash/redis");

  const limiter = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
    analytics: false,
    prefix: `zcore_rl_${limit}_${windowSec}`,
  });

  if (!upstashLimiters) {
    upstashLimiters = new Map();
  }
  upstashLimiters.set(cacheKey, limiter);
  return limiter;
}

function checkMemoryRateLimit(
  key: string,
  limit: number,
  windowSec: number
): RateLimitResult {
  const now = Date.now();
  const existing = memoryBuckets.get(key);

  if (!existing || existing.resetAt <= now) {
    memoryBuckets.set(key, {
      count: 1,
      resetAt: now + windowSec * 1000,
    });
    return { allowed: true };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return { allowed: true };
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowSec: number
): Promise<RateLimitResult> {
  const limiter = await getUpstashLimiter(limit, windowSec);

  if (!limiter) {
    if (!warnedFallback) {
      warnedFallback = true;
      logStructured("warn", "rate_limit_fallback", {
        message: "UPSTASH env not set; using in-memory rate limiting",
      });
    }
    return checkMemoryRateLimit(key, limit, windowSec);
  }

  const result = await limiter.limit(key);
  if (result.success) {
    return { allowed: true };
  }

  return {
    allowed: false,
    retryAfterSec: Math.max(
      1,
      Math.ceil((result.reset - Date.now()) / 1000)
    ),
  };
}

export function resetRateLimitStateForTests(): void {
  memoryBuckets.clear();
  upstashLimiters = undefined;
  warnedFallback = false;
}
