import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/database";

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Operator endpoints (X-Admin-Key required)
 */

/**
 * @swagger
 * /api/admin/platforms:
 *   get:
 *     tags: [Admin]
 *     summary: List registered partner platforms
 *     parameters:
 *       - in: header
 *         name: X-Admin-Key
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Platform list
 */
export const listPlatforms = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const platforms = await prisma.platform.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        apiKey: true,
        webhookUrl: true,
        active: true,
        createdAt: true,
      },
    });

    return res.status(200).json({ success: true, data: { platforms } });
  } catch (error) {
    return next(error);
  }
};

/**
 * @swagger
 * /api/admin/lenders:
 *   get:
 *     tags: [Admin]
 *     summary: List lenders and profile definitions
 */
export const listLenders = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const lenders = await prisma.lender.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        apiKey: true,
        profiles: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({ success: true, data: { lenders } });
  } catch (error) {
    return next(error);
  }
};

/**
 * @swagger
 * /api/admin/events/recent:
 *   get:
 *     tags: [Admin]
 *     summary: Recent credit events with pagination
 */
export const listRecentEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = Math.min(Number(req.query.limit ?? 50), 100);
    const offset = Math.max(Number(req.query.offset ?? 0), 0);

    const [total, events] = await Promise.all([
      prisma.creditEvent.count(),
      prisma.creditEvent.findMany({
        include: {
          platform: { select: { id: true, name: true } },
          user: { select: { walletAddress: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        events: events.map((event) => ({
          id: event.id,
          platformId: event.platform.id,
          platformName: event.platform.name,
          walletAddress: event.user.walletAddress,
          eventType: event.eventType,
          amount: event.amount,
          currency: event.currency,
          scoreImpact: event.scoreImpact,
          txHash: event.txHash,
          createdAt: event.createdAt.toISOString(),
        })),
        pagination: { limit, offset, total },
      },
    });
  } catch (error) {
    return next(error);
  }
};
