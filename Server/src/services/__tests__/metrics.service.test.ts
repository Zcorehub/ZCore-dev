import { describe, expect, it } from "vitest";
import {
  getMetricsText,
  httpRequestsTotal,
  normalizeRoutePath,
} from "../../services/metrics.service";

describe("metrics.service", () => {
  it("normalizes wallet segments in route paths", () => {
    const route = normalizeRoutePath({
      method: "GET",
      baseUrl: "/api/user",
      path: "/api/user/GD4ELZEONXZANIWRJAED5JPBN7KJG6ZQ5AV46HRLZRTEFNKWJP3UFREL/profile",
    });

    expect(route).toContain(":wallet");
  });

  it("increments HTTP request counter", async () => {
    httpRequestsTotal.inc({
      method: "GET",
      route: "/api/health",
      status: "200",
    });

    const metrics = await getMetricsText();
    expect(metrics).toContain("zcore_http_requests_total");
    expect(metrics).toMatch(/zcore_http_requests_total\{method="GET",route="\/api\/health",status="200"\} [0-9]/);
  });
});
