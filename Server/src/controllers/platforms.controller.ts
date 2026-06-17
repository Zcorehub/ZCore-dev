import { NextFunction, Request, Response } from "express";
import { randomBytes } from "crypto";
import { prisma } from "../config/database";
import { PlatformRegisterPayload } from "../types";

/**
 * @swagger
 * tags:
 *   name: Platforms
 *   description: Partner platform management (admin only)
 */

/**
 * @swagger
 * /api/platforms/register:
 *   post:
 *     tags: [Platforms]
 *     summary: Register a new partner platform (admin)
 *     description: |
 *       Creates or updates a partner platform entry and issues an API key
 *       for that platform to call POST /api/events/report.
 *       Requires the ADMIN_SECRET env variable to be set.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - adminKey
 *               - platformId
 *               - name
 *             properties:
 *               adminKey:
 *                 type: string
 *                 description: Value of the ADMIN_SECRET environment variable
 *                 example: "your_admin_secret"
 *               platformId:
 *                 type: string
 *                 description: Stable identifier for the platform (used as DB primary key)
 *                 example: "trustless-work"
 *               name:
 *                 type: string
 *                 description: Human-readable platform name
 *                 example: "Trustless Work"
 *               webhookUrl:
 *                 type: string
 *                 format: uri
 *                 description: URL where ZCore will notify the platform after processing an event
 *                 example: "https://api.trustlesswork.com/webhooks/zcore"
 *     responses:
 *       201:
 *         description: Platform registered and API key issued
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
 *                     platformId:
 *                       type: string
 *                       example: "trustless-work"
 *                     apiKey:
 *                       type: string
 *                       description: Share this key securely with the partner
 *                       example: "trustless_work_abc123def456..."
 *       200:
 *         description: Platform updated (API key unchanged)
 *       403:
 *         description: Invalid admin key
 */
export const registerPlatform = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { adminKey, platformId, name, webhookUrl } =
      req.body as PlatformRegisterPayload;

    if (!process.env.ADMIN_SECRET || adminKey !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ success: false, error: "Invalid admin key" });
    }

    const existing = await prisma.platform.findUnique({
      where: { id: platformId },
    });

    if (existing) {
      await prisma.platform.update({
        where: { id: platformId },
        data: { name, webhookUrl: webhookUrl ?? null, active: true },
      });
      return res.status(200).json({
        success: true,
        message: "Platform updated. Existing API key unchanged.",
        data: { platformId, apiKey: existing.apiKey },
      });
    }

    const apiKey = `${platformId.replace(/-/g, "_")}_${randomBytes(16).toString("hex")}`;

    const platform = await prisma.platform.create({
      data: { id: platformId, name, apiKey, webhookUrl: webhookUrl ?? null },
    });

    return res.status(201).json({
      success: true,
      data: { platformId: platform.id, apiKey: platform.apiKey },
    });
  } catch (error) {
    return next(error);
  }
};
