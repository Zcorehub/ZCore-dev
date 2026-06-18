import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/database";

export const validateLenderKey = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const apiKey = req.headers["x-api-key"] as string | undefined;

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: "Missing x-api-key header",
    });
  }

  const lender = await prisma.lender.findUnique({ where: { apiKey } });

  if (!lender) {
    return res.status(401).json({
      success: false,
      error: "Invalid lender API key",
    });
  }

  next();
};
