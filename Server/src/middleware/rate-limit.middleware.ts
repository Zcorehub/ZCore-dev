import { NextFunction, Request, Response } from "express";
import { checkRateLimit } from "../services/rate-limit.service";

export interface RateLimitOptions {
  name: string;
  limit: number;
  windowSec: number;
  keyGenerator: (req: Request) => string;
}

export function createRateLimiter(options: RateLimitOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const identity = options.keyGenerator(req);
      const key = `${options.name}:${identity}`;
      const result = await checkRateLimit(key, options.limit, options.windowSec);

      if (!result.allowed) {
        if (result.retryAfterSec) {
          res.setHeader("Retry-After", String(result.retryAfterSec));
        }
        return res.status(429).json({
          success: false,
          error: "Too many requests. Please try again later.",
          retryAfterSec: result.retryAfterSec,
        });
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
}

export function clientIpKey(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return req.ip ?? "unknown";
}

export function bodyApiKey(req: Request): string {
  const body = req.body as { apiKey?: string };
  return body.apiKey ?? "missing-api-key";
}

export function headerApiKey(req: Request): string {
  const key = req.headers["x-api-key"];
  return typeof key === "string" ? key : "missing-api-key";
}
