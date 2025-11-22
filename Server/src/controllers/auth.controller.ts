import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/database";
import {
  assignProfileTier,
  calculateStellarOnlyScore,
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
 *     summary: Registra usuario usando solo wallet de Stellar
 *     description: |
 *       Registra un nuevo usuario calculando el score únicamente desde datos verificados de Stellar Horizon API.
 *       Score máximo: 350 puntos basados en actividad on-chain.
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
 *                 description: Dirección válida de wallet Stellar
 *                 example: "GAYR3DYYONOZMFQT5KA7VO4LHMDWEDMVOFXONGEPPLQAL5ZWQQXYAJUP"
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
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
 *                   example: "User registered successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     score:
 *                       type: number
 *                       example: 280
 *                       description: "Score calculado desde datos de Stellar (máx 350)"
 *       200:
 *         description: Usuario ya existe
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
 *                   example: "User already registered"
 *                 data:
 *                   type: object
 *                   properties:
 *                     score:
 *                       type: number
 *                       example: 280
 *       400:
 *         description: Wallet inválida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Invalid Stellar wallet address"
 *                 message:
 *                   type: string
 *                   example: "The provided wallet address does not exist on Stellar network"
 *                 details:
 *                   type: object
 *                   properties:
 *                     walletAddress:
 *                       type: string
 *                       example: "INVALID123WALLET456"
 *                     stellarNetwork:
 *                       type: string
 *                       example: "mainnet"
 *                     suggestion:
 *                       type: string
 *                       example: "Please verify your Stellar wallet address and try again"
 */
export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { walletAddress } = req.body as RegisterRequest;

    // Verificar si el usuario ya existe
    const existing = await prisma.user.findUnique({ where: { walletAddress } });
    if (existing) {
      return res.status(200).json({
        success: true,
        message: "User already registered",
        data: {
          score: existing.score,
        },
      });
    }

    // Obtener score únicamente desde Stellar
    const scoringResult = await calculateStellarOnlyScore(walletAddress);
    const { score, stellarData } = scoringResult;

    // Validar que la wallet existe en Stellar
    if (!stellarData.isValid) {
      return res.status(400).json({
        success: false,
        error: "Invalid Stellar wallet address",
        message:
          "The provided wallet address does not exist on Stellar network",
        details: {
          walletAddress,
          stellarNetwork: "mainnet",
          suggestion: "Please verify your Stellar wallet address and try again",
        },
      });
    }

    const profileTier = assignProfileTier(score);

    // Crear usuario con datos mínimos
    await prisma.user.create({
      data: {
        walletAddress,
        score,
        profileTier,
        questionnaire: stellarData as any, // Almacenar solo datos de Stellar
      },
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        score,
      },
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
 *     summary: Autenticación basada en wallet
 *     description: Autentica usuario y retorna su score actual
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
 *                 example: "GAYR3DYYONOZMFQT5KA7VO4LHMDWEDMVOFXONGEPPLQAL5ZWQQXYAJUP"
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
 *                     score:
 *                       type: number
 *                       example: 280
 *                       description: "Score actual del usuario"
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "User not found"
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
        score: user.score,
      },
    });
  } catch (error) {
    return next(error);
  }
};
