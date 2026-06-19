import { NextFunction, Request, Response } from "express";

export function requireAdminKey(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const adminSecret = process.env.ADMIN_SECRET;
  const provided = req.headers["x-admin-key"];

  if (!adminSecret || typeof provided !== "string" || provided !== adminSecret) {
    res.status(403).json({ success: false, error: "Invalid admin key" });
    return;
  }

  next();
}
