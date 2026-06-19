import { Request, Response } from "express";
import { checkDatabaseConnection } from "../services/health.service";

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Health check
 *     description: Returns server status with optional database connectivity
 *     responses:
 *       200:
 *         description: Server is healthy
 *       503:
 *         description: Server running but database unreachable
 */
export const healthCheck = async (_req: Request, res: Response) => {
  const db = await checkDatabaseConnection();
  const status = db.connected ? "ok" : "degraded";

  res.status(db.connected ? 200 : 503).json({
    success: db.connected,
    data: {
      status,
      version: process.env.npm_package_version ?? "1.0.0",
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      checks: {
        database: {
          connected: db.connected,
          latencyMs: db.latencyMs,
          error: db.error,
        },
      },
    },
  });
};

/**
 * @swagger
 * /health/live:
 *   get:
 *     tags: [Health]
 *     summary: Liveness probe
 *     description: Lightweight check that the process is running
 */
export const livenessCheck = (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: { status: "alive", timestamp: new Date().toISOString() },
  });
};

/**
 * @swagger
 * /health/ready:
 *   get:
 *     tags: [Health]
 *     summary: Readiness probe
 *     description: Checks database connectivity before accepting traffic
 */
export const readinessCheck = async (_req: Request, res: Response) => {
  const db = await checkDatabaseConnection();
  res.status(db.connected ? 200 : 503).json({
    success: db.connected,
    data: {
      status: db.connected ? "ready" : "not_ready",
      database: db,
      timestamp: new Date().toISOString(),
    },
  });
};
