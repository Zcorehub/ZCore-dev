import { NextFunction, Request, Response } from "express";
import { verifySessionToken } from "../services/session.service";

declare global {
  namespace Express {
    interface Request {
      sessionWallet?: string;
    }
  }
}

export function requireWalletSession(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      error: "Authentication required",
    });
    return;
  }

  const token = header.slice("Bearer ".length);
  const claims = verifySessionToken(token);

  if (!claims) {
    res.status(401).json({
      success: false,
      error: "Invalid or expired session",
    });
    return;
  }

  const routeWallet = req.params.wallet;
  if (routeWallet && routeWallet !== claims.walletAddress) {
    res.status(403).json({
      success: false,
      error: "Wallet address mismatch",
    });
    return;
  }

  req.sessionWallet = claims.walletAddress;
  next();
}
