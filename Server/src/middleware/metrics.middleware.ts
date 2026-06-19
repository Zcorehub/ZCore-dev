import { NextFunction, Request, Response } from "express"
import { recordHttpRequest } from "../services/metrics.service"

export function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.on("finish", () => {
    recordHttpRequest(req.method, getRouteLabel(req), res.statusCode)
  })

  next()
}

function getRouteLabel(req: Request): string {
  if (req.route?.path) {
    return `${req.baseUrl}${req.route.path}`
  }

  return req.baseUrl || "/api/unmatched"
}
