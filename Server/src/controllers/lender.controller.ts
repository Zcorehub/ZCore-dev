import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/database";
import { ProfileDefinition } from "../types";

/**
 * @swagger
 * tags:
 *   name: Lenders
 *   description: Configuración de prestamistas
 */

/**
 * @swagger
 * /api/lender/profiles:
 *   post:
 *     tags: [Lenders]
 *     summary: Define perfiles de riesgo para un prestamista
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - apiKey
 *               - profiles
 *             properties:
 *               apiKey:
 *                 type: string
 *                 description: API Key del prestamista
 *                 example: "lender_api_key_123456789"
 *               name:
 *                 type: string
 *                 description: Nombre del prestamista
 *                 example: "MiPrestamista DeFi"
 *               profiles:
 *                 type: array
 *                 description: Perfiles de riesgo
 *                 items:
 *                   type: object
 *                   required:
 *                     - tier
 *                     - minScore
 *                     - maxAmount
 *                     - interestRate
 *                   properties:
 *                     tier:
 *                       type: string
 *                       enum: ["A", "B", "C"]
 *                       example: "A"
 *                     minScore:
 *                       type: number
 *                       minimum: 300
 *                       maximum: 850
 *                       example: 700
 *                     maxAmount:
 *                       type: number
 *                       minimum: 0.01
 *                       example: 10000
 *                     interestRate:
 *                       type: number
 *                       minimum: 0
 *                       maximum: 100
 *                       example: 8.5
 *                 example:
 *                   - tier: "A"
 *                     minScore: 700
 *                     maxAmount: 10000
 *                     interestRate: 8.5
 *                   - tier: "B"
 *                     minScore: 600
 *                     maxAmount: 5000
 *                     interestRate: 12.0
 *     responses:
 *       200:
 *         description: Perfiles actualizados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Profiles updated"
 *                 data:
 *                   type: object
 *                   properties:
 *                     lenderId:
 *                       type: string
 *                       example: "123e4567-e89b-12d3-a456-426614174000"
 */
export const defineProfiles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { apiKey, profiles } = req.body as ProfileDefinition;
    const name = req.body.name ?? "Prestamista";

    const lender = await prisma.lender.upsert({
      where: { apiKey },
      update: { profiles: profiles as any },
      create: { apiKey, profiles: profiles as any, name },
    });

    return res.status(200).json({
      success: true,
      message: "Profiles updated",
      data: { lenderId: lender.id },
    });
  } catch (error) {
    return next(error);
  }
};
