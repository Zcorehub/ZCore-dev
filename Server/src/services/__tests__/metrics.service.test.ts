import { describe, expect, it, beforeEach } from "vitest"
import {
  observeDbQueryDuration,
  recordAuthVerifyFailure,
  recordCreditEvent,
  recordHorizonError,
  recordHttpRequest,
  renderMetrics,
  resetMetricsForTests,
} from "../metrics.service"

describe("metrics service", () => {
  beforeEach(() => {
    resetMetricsForTests()
  })

  it("renders Prometheus counters for bounded labels", () => {
    recordHttpRequest("get", "/api/user/:wallet/profile", 200)
    recordCreditEvent("trustless_work", "loan_repaid")
    recordHorizonError("verify_transaction")
    recordAuthVerifyFailure("/api/auth/login/signed")

    const metrics = renderMetrics()

    expect(metrics).toContain("# TYPE zcore_http_requests_total counter")
    expect(metrics).toContain(
      'zcore_http_requests_total{method="GET",route="/api/user/:wallet/profile",status="200"} 1'
    )
    expect(metrics).toContain(
      'zcore_events_reported_total{eventType="loan_repaid",platform="trustless_work"} 1'
    )
    expect(metrics).toContain(
      'zcore_horizon_errors_total{operation="verify_transaction"} 1'
    )
    expect(metrics).toContain(
      'zcore_auth_verify_failures_total{route="_api_auth_login_signed"} 1'
    )
  })

  it("renders Prisma query duration histogram buckets", () => {
    observeDbQueryDuration(0.03)

    const metrics = renderMetrics()

    expect(metrics).toContain("# TYPE zcore_db_query_duration_seconds histogram")
    expect(metrics).toContain('zcore_db_query_duration_seconds_bucket{le="0.05"} 1')
    expect(metrics).toContain('zcore_db_query_duration_seconds_bucket{le="+Inf"} 1')
    expect(metrics).toContain("zcore_db_query_duration_seconds_count 1")
  })
})
