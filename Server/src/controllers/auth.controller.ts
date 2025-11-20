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
 *     responses:
 *       201:
 *         description: Usuario registrado
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

    return res
      .status(201)
      .json({
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
        profileTier: user.profileTier,
      },
    });
  } catch (error) {
    return next(error);
  }
};
