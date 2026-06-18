import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/database";
import {
  evaluateEligibility,
  getUserProfile,
} from "../services/profile.service";
import { LenderProfile, ScoringRequest } from "../types";

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Operaciones de usuarios
 */

/**
 * @swagger
 * /api/user/request:
 *   post:
 *     tags: [Users]
 *     summary: Solicita evaluación de scoring
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - walletAddress
 *               - lenderId
 *               - requestedAmount
 *             properties:
 *               walletAddress:
 *                 type: string
 *                 description: Dirección de wallet del usuario
 *                 example: "0x1234567890abcdef1234567890abcdef12345678"
 *               lenderId:
 *                 type: string
 *                 format: uuid
 *                 description: ID del prestamista
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               requestedAmount:
 *                 type: number
 *                 minimum: 0.01
 *                 description: Monto solicitado
 *                 example: 1000
 *     responses:
 *       200:
 *         description: Evaluación completada
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
 *                     eligible:
 *                       type: boolean
 *                       example: true
 *                     profileAssigned:
 *                       type: string
 *                       example: "B"
 *                     maxAmount:
 *                       type: number
 *                       example: 5000
 *                     requestId:
 *                       type: string
 *                       example: "req_123456789"
 */
export const requestScoring = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { walletAddress, lenderId, requestedAmount } =
      req.body as ScoringRequest;

    const user = await prisma.user.findUnique({ where: { walletAddress } });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const lender = await prisma.lender.findUnique({ where: { id: lenderId } });
    if (!lender) {
      return res
        .status(404)
        .json({ success: false, error: "Lender not found" });
    }

    const profiles = lender.profiles as unknown as LenderProfile[];
    const { eligible, maxAmount, profileAssigned } = evaluateEligibility(
      user.score,
      profiles,
      requestedAmount
    );

    const requestRecord = await prisma.request.create({
      data: {
        userId: user.id,
        lenderId: lender.id,
        profileAssigned,
        maxAmount,
        requestedAmount,
        status: eligible ? "approved" : "rejected",
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        eligible,
        profileAssigned,
        maxAmount,
        requestId: requestRecord.id,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @swagger
 * /api/user/{wallet}/score:
 *   get:
 *     tags: [Users]
 *     summary: Get a user's credit score with breakdown (for lenders)
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         required: true
 *         schema:
 *           type: string
 *         description: Lender API key issued by ZCore
 *       - in: path
 *         name: wallet
 *         required: true
 *         schema:
 *           type: string
 *           example: "GAYR3DYYONOZMFQT5KA7VO4LHMDWEDMVOFXONGEPPLQAL5ZWQQXYAJUP"
 *     responses:
 *       200:
 *         description: Score and breakdown retrieved
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
 *                     walletAddress:
 *                       type: string
 *                     score:
 *                       type: number
 *                       example: 387
 *                     tier:
 *                       type: string
 *                       example: "B"
 *                     breakdown:
 *                       type: object
 *                       properties:
 *                         stellarBase:
 *                           type: number
 *                         eventsScore:
 *                           type: number
 *                         totalEvents:
 *                           type: number
 *                         platforms:
 *                           type: array
 *                           items:
 *                             type: string
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Missing or invalid lender API key
 *       404:
 *         description: User not found
 */
export const getScore = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { wallet } = req.params;

    const user = await prisma.user.findUnique({
      where: { walletAddress: wallet },
      include: {
        creditEvents: {
          select: { platformId: true, scoreImpact: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const eventsScore = user.creditEvents.reduce(
      (sum, e) => sum + e.scoreImpact,
      0
    );
    const stellarBase = Math.max(0, user.score - eventsScore);
    const platforms = [...new Set(user.creditEvents.map((e) => e.platformId))];

    return res.status(200).json({
      success: true,
      data: {
        walletAddress: wallet,
        score: user.score,
        tier: user.profileTier,
        breakdown: {
          stellarBase,
          eventsScore,
          totalEvents: user.creditEvents.length,
          platforms,
        },
        lastUpdated: user.updatedAt,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @swagger
 * /api/user/{wallet}/history:
 *   get:
 *     tags: [Users]
 *     summary: Get a user's credit event history
 *     parameters:
 *       - in: path
 *         name: wallet
 *         required: true
 *         schema:
 *           type: string
 *           example: "GAYR3DYYONOZMFQT5KA7VO4LHMDWEDMVOFXONGEPPLQAL5ZWQQXYAJUP"
 *     responses:
 *       200:
 *         description: Credit event history retrieved
 *       404:
 *         description: User not found
 */
export const getCreditHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { wallet } = req.params;

    const user = await prisma.user.findUnique({
      where: { walletAddress: wallet },
      include: {
        creditEvents: {
          include: { platform: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const events = user.creditEvents.map((e) => ({
      eventId: e.id,
      platform: e.platform.name,
      eventType: e.eventType,
      amount: e.amount,
      currency: e.currency,
      scoreImpact: e.scoreImpact,
      txHash: e.txHash,
      date: e.createdAt.toISOString().split("T")[0],
    }));

    const totalPositive = events
      .filter((e) => e.scoreImpact > 0)
      .reduce((sum, e) => sum + e.scoreImpact, 0);
    const totalNegative = events
      .filter((e) => e.scoreImpact < 0)
      .reduce((sum, e) => sum + e.scoreImpact, 0);

    return res.status(200).json({
      success: true,
      data: { events, totalPositive, totalNegative },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @swagger
 * /api/user/{wallet}/profile:
 *     tags: [Users]
 *     summary: Obtiene perfil asignado
 *     parameters:
 *       - in: path
 *         name: wallet
 *         required: true
 *         description: Dirección de wallet del usuario
 *         schema:
 *           type: string
 *           example: "0x1234567890abcdef1234567890abcdef12345678"
 *     responses:
 *       200:
 *         description: Perfil encontrado
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
 *                     walletAddress:
 *                       type: string
 *                       example: "0x1234567890abcdef1234567890abcdef12345678"
 *                     score:
 *                       type: number
 *                       example: 650
 *                     profileTier:
 *                       type: string
 *                       example: "B"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Usuario no encontrado
 */
export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { wallet } = req.params;
    const profile = await getUserProfile(wallet);

    if (!profile) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.status(200).json({ success: true, data: profile });
  } catch (error) {
    return next(error);
  }
};
