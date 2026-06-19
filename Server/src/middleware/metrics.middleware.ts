import { NextFunction, Request, Response } from "express";
import {
  httpRequestsTotal,
  normalizeRoutePath,
} from "../services/metrics.service";

export function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.on("finish", () => {
    if (!req.path.startsWith("/api")) return;

    httpRequestsTotal.inc({
      method: req.method,
      route: normalizeRoutePath(req),
      status: String(res.statusCode),
    });
  });

  next();
}
