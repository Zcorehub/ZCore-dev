import { describe, expect, it } from "vitest";
import { recalculateScoreFromInputs } from "../score-recalculation.service";

describe("recalculateScoreFromInputs", () => {
  it("rebuilds score and tier from stellar base, events, and payment deltas", () => {
    expect(
      recalculateScoreFromInputs({
        stellarBase: 125,
        creditEvents: [{ scoreImpact: 60 }, { scoreImpact: 25 }],
        payments: [{ status: "paid" }, { status: "defaulted" }, { status: "pending" }],
      })
    ).toEqual({ score: 190, profileTier: "C" });
  });

  it("clamps rebuilt scores to the supported 0-850 range", () => {
    expect(
      recalculateScoreFromInputs({
        stellarBase: 150,
        creditEvents: [{ scoreImpact: 900 }],
      })
    ).toEqual({ score: 850, profileTier: "A" });

    expect(
      recalculateScoreFromInputs({
        stellarBase: 0,
        creditEvents: [{ scoreImpact: -20 }],
        payments: [{ status: "defaulted" }],
      })
    ).toEqual({ score: 0, profileTier: "REJECTED" });
  });
});