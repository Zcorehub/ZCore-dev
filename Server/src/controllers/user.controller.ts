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
 * /api/user/{wallet}/profile:
 *   get:
 *     tags: [Users]
 *     summary: Obtiene perfil asignado
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
