import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/database";
import {
  assignProfileTier,
  calculateInitialScore,
} from "../services/scoring.service";
import { LoginRequest, RegisterRequest } from "../types";

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticación de usuarios via wallet
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Registra usuario y genera score inicial (simulado)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - walletAddress
 *               - questionnaire
 *             properties:
 *               walletAddress:
 *                 type: string
 *                 description: Dirección de wallet del usuario
 *                 example: "0x1234567890abcdef1234567890abcdef12345678"
 *               questionnaire:
 *                 type: object
 *                 properties:
 *                   walletAge:
 *                     type: number
 *                     description: Edad de la wallet en meses
 *                     example: 12
 *                   averageBalance:
 *                     type: number
 *                     description: Balance promedio
 *                     example: 1000.50
 *                   transactionCount:
 *                     type: number
 *                     description: Número de transacciones
 *                     example: 25
 *                   defiInteractions:
 *                     type: number
 *                     description: Interacciones DeFi
 *                     example: 5
 *                   monthlyIncome:
 *                     type: number
 *                     description: Ingreso mensual estimado
 *                     example: 5000
 *                   loanPurpose:
 *                     type: string
 *                     description: Propósito del préstamo
 *                     example: "business"
 *     responses:
 *       201:
 *         description: Usuario registrado
 *       200:
 *         description: Usuario ya existe
 */
export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { walletAddress, questionnaire } = req.body as RegisterRequest;

    const existing = await prisma.user.findUnique({ where: { walletAddress } });
    if (existing) {
      return res.status(200).json({
        success: true,
        message: "User already registered",
        data: { profileTier: existing.profileTier },
      });
    }

    const score = calculateInitialScore(questionnaire);
    const profileTier = assignProfileTier(score);

    await prisma.user.create({
      data: {
        walletAddress,
        score,
        profileTier,
        questionnaire,
      },
    });

    return res.status(201).json({
      success: true,
      message: "User registered",
      data: { profileTier },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Autenticación simulada basada en wallet
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - walletAddress
 *             properties:
 *               walletAddress:
 *                 type: string
 *                 description: Dirección de wallet del usuario
 *                 example: "0x1234567890abcdef1234567890abcdef12345678"
 *     responses:
 *       200:
 *         description: Login exitoso
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
 *       404:
 *         description: Usuario no encontrado
 */
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { walletAddress } = req.body as LoginRequest;

    const user = await prisma.user.findUnique({ where: { walletAddress } });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.status(200).json({
      success: true,
      data: {
        walletAddress: user.walletAddress,
        score: user.score,
        profileTier: user.profileTier,
      },
    });
  } catch (error) {
    return next(error);
  }
};
