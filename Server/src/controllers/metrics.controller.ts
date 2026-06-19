import { NextFunction, Request, Response } from "express";
import { getMetricsText } from "../services/metrics.service";

export const getMetrics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const metricsSecret = process.env.METRICS_SECRET;
    if (metricsSecret) {
      const auth = req.headers.authorization;
      const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
      if (token !== metricsSecret) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }
    }

    res.setHeader("Content-Type", "text/plain; version=0.0.4; charset=utf-8");
    return res.status(200).send(await getMetricsText());
  } catch (error) {
    return next(error);
  }
};
