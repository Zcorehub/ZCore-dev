import { Request, Response } from "express";

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Health check
 *     description: Returns basic server status for monitoring and partner integrations
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: ok
 *                     version:
 *                       type: string
 *                       example: "1.0.0"
 *                     uptimeSeconds:
 *                       type: number
 *                       example: 42
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 */
export const healthCheck = (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      status: "ok",
      version: process.env.npm_package_version ?? "1.0.0",
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    },
  });
};
