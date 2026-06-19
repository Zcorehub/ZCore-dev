import { Counter, Histogram, Registry, collectDefaultMetrics } from "prom-client";

export const metricsRegistry = new Registry();

collectDefaultMetrics({ register: metricsRegistry });

export const httpRequestsTotal = new Counter({
  name: "zcore_http_requests_total",
  help: "Total HTTP requests by method, route template, and status",
  labelNames: ["method", "route", "status"],
  registers: [metricsRegistry],
});

export const eventsReportedTotal = new Counter({
  name: "zcore_events_reported_total",
  help: "Credit events ingested by platform and event type",
  labelNames: ["platform", "event_type"],
  registers: [metricsRegistry],
});

export const horizonErrorsTotal = new Counter({
  name: "zcore_horizon_errors_total",
  help: "Horizon API fetch or verification failures",
  registers: [metricsRegistry],
});

export const authVerifyFailuresTotal = new Counter({
  name: "zcore_auth_verify_failures_total",
  help: "Wallet signature verification failures",
  registers: [metricsRegistry],
});

export const dbQueryDurationSeconds = new Histogram({
  name: "zcore_db_query_duration_seconds",
  help: "Prisma query duration in seconds",
  labelNames: ["operation"],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2],
  registers: [metricsRegistry],
});

export function normalizeRoutePath(req: {
  method: string;
  baseUrl: string;
  route?: { path?: string };
  path: string;
}): string {
  if (req.route?.path) {
    return `${req.baseUrl}${req.route.path}` || req.path;
  }

  return req.path
    .split("/")
    .map((segment) =>
      segment.startsWith("G") && segment.length === 56 ? ":wallet" : segment
    )
    .join("/");
}

export async function getMetricsText(): Promise<string> {
  return metricsRegistry.metrics();
}
