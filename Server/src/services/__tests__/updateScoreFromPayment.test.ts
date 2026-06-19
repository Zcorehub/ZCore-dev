import { describe, expect, it } from "vitest";
import { updateScoreFromPayment } from "../../services/scoring.service";

describe("updateScoreFromPayment", () => {
  it("increases score by 10 on paid status", () => {
    const result = updateScoreFromPayment(400, "paid");
    expect(result.score).toBe(410);
    expect(result.profileTier).toBe("B");
  });

  it("decreases score by 30 on defaulted status", () => {
    const result = updateScoreFromPayment(400, "defaulted");
    expect(result.score).toBe(370);
  });

  it("clamps score at 850 maximum", () => {
    const result = updateScoreFromPayment(845, "paid");
    expect(result.score).toBe(850);
  });

  it("clamps score at 0 minimum", () => {
    const result = updateScoreFromPayment(20, "defaulted");
    expect(result.score).toBe(0);
    expect(result.profileTier).toBe("REJECTED");
  });
});
