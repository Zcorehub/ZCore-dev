import { randomUUID } from "crypto";
import { NextFunction, Request, Response } from "express";
import { logStructured } from "../utils/logger.util";

declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

export function requestLogMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const requestId = (req.headers["x-request-id"] as string) ?? randomUUID();
  req.id = requestId;
  res.setHeader("X-Request-Id", requestId);

  const startedAt = Date.now();

  res.on("finish", () => {
    logStructured("info", "http_request", {
      requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - startedAt,
    });
  });

  next();
}
