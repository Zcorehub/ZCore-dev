import { Request, Response } from "express"
import { renderMetrics } from "../services/metrics.service"

export function metricsHandler(req: Request, res: Response) {
  const secret = process.env.METRICS_SECRET
  if (secret && req.get("authorization") !== `Bearer ${secret}`) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized metrics request",
    })
  }

  res.setHeader("Content-Type", "text/plain; version=0.0.4; charset=utf-8")
  return res.status(200).send(`${renderMetrics()}\n`)
}
