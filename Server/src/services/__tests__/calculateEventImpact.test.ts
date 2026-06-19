import { describe, expect, it } from "vitest";
import { calculateEventImpact } from "../../services/scoring.service";

describe("calculateEventImpact", () => {
  it("calculates escrow_completed impact with decay", () => {
    const impact = calculateEventImpact("escrow_completed", 1000, 1.0);
    expect(impact).toBe(20);
  });

  it("caps impact at maxPerEvent", () => {
    const impact = calculateEventImpact("escrow_completed", 100_000, 1.0);
    expect(impact).toBe(60);
  });

  it("applies counterparty decay factor", () => {
    const full = calculateEventImpact("loan_repaid", 500, 1.0);
    const decayed = calculateEventImpact("loan_repaid", 500, 0.4);
    expect(decayed).toBe(Math.round(full * 0.4));
  });

  it("returns higher impact for tanda_cycle_completed", () => {
    const cycle = calculateEventImpact("tanda_cycle_completed", 100, 1.0);
    const round = calculateEventImpact("tanda_round_paid", 100, 1.0);
    expect(cycle).toBeGreaterThan(round);
  });
});
