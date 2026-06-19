import { EventEmitter } from "events"
import { beforeEach, describe, expect, it } from "vitest"
import { metricsMiddleware } from "../metrics.middleware"
import { renderMetrics, resetMetricsForTests } from "../../services/metrics.service"

describe("metricsMiddleware", () => {
  beforeEach(() => {
    resetMetricsForTests()
  })

  it("increments one HTTP request counter when a response finishes", () => {
    const req = {
      method: "POST",
      baseUrl: "/api/events",
      route: { path: "/report" },
    } as any
    const res = new EventEmitter() as any
    res.statusCode = 201
    const next = () => undefined

    metricsMiddleware(req, res, next)
    res.emit("finish")

    expect(renderMetrics()).toContain(
      'zcore_http_requests_total{method="POST",route="/api/events/report",status="201"} 1'
    )
  })
})
