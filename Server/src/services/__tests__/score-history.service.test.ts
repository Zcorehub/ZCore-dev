import { describe, expect, it } from "vitest";
import {
  buildScoreHistoryTimeline,
  mergeTimelineRows,
} from "../../services/score-history.service";

describe("score-history.service", () => {
  it("builds paginated score timeline with before/after values", () => {
    const rows = mergeTimelineRows(
      [
        {
          createdAt: new Date("2026-06-02T12:00:00.000Z"),
          scoreImpact: 15,
          eventType: "escrow_completed",
          txHash: "tx_newest",
        },
        {
          createdAt: new Date("2026-06-01T12:00:00.000Z"),
          scoreImpact: 10,
          eventType: "paid",
          txHash: "tx_older",
        },
      ],
      [
        {
          createdAt: new Date("2026-06-01T10:00:00.000Z"),
          status: "paid",
          id: "payment-1",
        },
      ]
    );

    const { history, total } = buildScoreHistoryTimeline(125, rows, {
      limit: 2,
      offset: 0,
    });

    expect(total).toBe(3);
    expect(history).toHaveLength(2);
    expect(history[0]).toMatchObject({
      scoreAfter: 125,
      scoreBefore: 110,
      delta: 15,
      source: "escrow_completed",
    });
    expect(history[1]).toMatchObject({
      scoreAfter: 110,
      scoreBefore: 100,
      delta: 10,
    });
  });
});
