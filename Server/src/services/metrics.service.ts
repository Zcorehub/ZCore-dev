type LabelValue = string | number
type Labels = Record<string, LabelValue>

interface CounterSeries {
  help: string
  type: "counter"
  values: Map<string, number>
}

interface HistogramSeries {
  help: string
  type: "histogram"
  buckets: number[]
  values: Map<
    string,
    {
      count: number
      sum: number
      buckets: number[]
    }
  >
}

const counters = {
  httpRequests: createCounter(
    "zcore_http_requests_total",
    "HTTP requests by method, route, and status."
  ),
  eventsReported: createCounter(
    "zcore_events_reported_total",
    "Credit events accepted by platform and event type."
  ),
  horizonErrors: createCounter(
    "zcore_horizon_errors_total",
    "Stellar Horizon request failures by operation."
  ),
  authVerifyFailures: createCounter(
    "zcore_auth_verify_failures_total",
    "SEP-53 wallet signature verification failures by route."
  ),
}

const dbQueryDuration = createHistogram(
  "zcore_db_query_duration_seconds",
  "Observed Prisma query duration in seconds.",
  [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5]
)

export function recordHttpRequest(
  method: string,
  route: string,
  statusCode: number
) {
  increment(counters.httpRequests, {
    method: method.toUpperCase(),
    route,
    status: statusCode,
  })
}

export function recordCreditEvent(platform: string, eventType: string) {
  increment(counters.eventsReported, {
    platform: sanitizeLabelValue(platform),
    eventType: sanitizeLabelValue(eventType),
  })
}

export function recordHorizonError(operation: string) {
  increment(counters.horizonErrors, {
    operation: sanitizeLabelValue(operation),
  })
}

export function recordAuthVerifyFailure(route: string) {
  increment(counters.authVerifyFailures, {
    route: sanitizeLabelValue(route),
  })
}

export function observeDbQueryDuration(seconds: number) {
  observe(dbQueryDuration, {}, seconds)
}

export function renderMetrics(): string {
  return [
    renderCounter("zcore_http_requests_total", counters.httpRequests),
    renderCounter("zcore_events_reported_total", counters.eventsReported),
    renderCounter("zcore_horizon_errors_total", counters.horizonErrors),
    renderCounter(
      "zcore_auth_verify_failures_total",
      counters.authVerifyFailures
    ),
    renderHistogram("zcore_db_query_duration_seconds", dbQueryDuration),
  ]
    .filter(Boolean)
    .join("\n")
}

export function resetMetricsForTests() {
  Object.values(counters).forEach((counter) => counter.values.clear())
  dbQueryDuration.values.clear()
}

function createCounter(name: string, help: string): CounterSeries {
  void name
  return {
    help,
    type: "counter",
    values: new Map(),
  }
}

function createHistogram(
  name: string,
  help: string,
  buckets: number[]
): HistogramSeries {
  void name
  return {
    help,
    type: "histogram",
    buckets,
    values: new Map(),
  }
}

function increment(counter: CounterSeries, labels: Labels) {
  const key = serializeLabels(labels)
  counter.values.set(key, (counter.values.get(key) ?? 0) + 1)
}

function observe(histogram: HistogramSeries, labels: Labels, value: number) {
  const key = serializeLabels(labels)
  const existing =
    histogram.values.get(key) ??
    {
      count: 0,
      sum: 0,
      buckets: histogram.buckets.map(() => 0),
    }

  existing.count += 1
  existing.sum += value
  histogram.buckets.forEach((bucket, index) => {
    if (value <= bucket) existing.buckets[index] += 1
  })

  histogram.values.set(key, existing)
}

function renderCounter(name: string, counter: CounterSeries): string {
  return [
    `# HELP ${name} ${counter.help}`,
    `# TYPE ${name} ${counter.type}`,
    ...[...counter.values.entries()].map(
      ([key, value]) => `${name}${key} ${value}`
    ),
  ].join("\n")
}

function renderHistogram(name: string, histogram: HistogramSeries): string {
  const lines = [`# HELP ${name} ${histogram.help}`, `# TYPE ${name} histogram`]

  for (const [key, value] of histogram.values.entries()) {
    histogram.buckets.forEach((bucket, index) => {
      lines.push(
        `${name}_bucket${appendLabel(key, "le", bucket)} ${value.buckets[index]}`
      )
    })
    lines.push(`${name}_bucket${appendLabel(key, "le", "+Inf")} ${value.count}`)
    lines.push(`${name}_sum${key} ${value.sum}`)
    lines.push(`${name}_count${key} ${value.count}`)
  }

  return lines.join("\n")
}

function serializeLabels(labels: Labels): string {
  const entries = Object.entries(labels).sort(([a], [b]) => a.localeCompare(b))
  if (entries.length === 0) return ""

  return `{${entries
    .map(([name, value]) => `${name}="${escapeLabelValue(String(value))}"`)
    .join(",")}}`
}

function appendLabel(serializedLabels: string, name: string, value: LabelValue) {
  const suffix = `${name}="${escapeLabelValue(String(value))}"`
  if (!serializedLabels) return `{${suffix}}`

  return `${serializedLabels.slice(0, -1)},${suffix}}`
}

function escapeLabelValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/"/g, '\\"')
}

function sanitizeLabelValue(value: string): string {
  return value.trim().replace(/[^a-zA-Z0-9_:-]/g, "_") || "unknown"
}
