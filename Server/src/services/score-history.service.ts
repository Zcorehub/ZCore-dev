import { PAYMENT_SCORE_DELTA } from "../constants/scoring.constants";

export interface ScoreHistoryQuery {
  limit: number;
  offset: number;
  from?: Date;
  to?: Date;
}

export interface ScoreHistoryEntry {
  timestamp: string;
  scoreBefore: number;
  scoreAfter: number;
  delta: number;
  source: string;
  txHash: string | null;
}

export interface TimelineSourceRow {
  timestamp: Date;
  delta: number;
  source: string;
  txHash: string | null;
}

export function mergeTimelineRows(
  creditEvents: {
    createdAt: Date;
    scoreImpact: number;
    eventType: string;
    txHash: string;
  }[],
  payments: {
    createdAt: Date;
    status: string;
    id: string;
  }[]
): TimelineSourceRow[] {
  const eventRows: TimelineSourceRow[] = creditEvents.map((event) => ({
    timestamp: event.createdAt,
    delta: event.scoreImpact,
    source: event.eventType,
    txHash: event.txHash,
  }));

  const paymentRows: TimelineSourceRow[] = payments.map((payment) => ({
    timestamp: payment.createdAt,
    delta:
      PAYMENT_SCORE_DELTA[payment.status as keyof typeof PAYMENT_SCORE_DELTA] ??
      0,
    source: payment.status,
    txHash: null,
  }));

  return [...eventRows, ...paymentRows].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );
}

export function buildScoreHistoryTimeline(
  currentScore: number,
  rows: TimelineSourceRow[],
  query: ScoreHistoryQuery
): { history: ScoreHistoryEntry[]; total: number } {
  const filtered = rows.filter((row) => {
    if (query.from && row.timestamp < query.from) return false;
    if (query.to && row.timestamp > query.to) return false;
    return true;
  });

  let runningScore = currentScore;
  const scored = filtered.map((row) => {
    const scoreAfter = runningScore;
    const scoreBefore = runningScore - row.delta;
    runningScore = scoreBefore;

    return {
      timestamp: row.timestamp.toISOString(),
      scoreBefore,
      scoreAfter,
      delta: row.delta,
      source: row.source,
      txHash: row.txHash,
    };
  });

  return {
    history: scored.slice(query.offset, query.offset + query.limit),
    total: scored.length,
  };
}
