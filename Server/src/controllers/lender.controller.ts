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
