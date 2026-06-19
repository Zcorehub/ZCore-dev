import { describe, expect, it } from "vitest";
import { applyCounterpartyDecay } from "../../services/scoring.service";

describe("applyCounterpartyDecay", () => {
  it("returns full weight for first interaction", () => {
    expect(applyCounterpartyDecay(1)).toBe(1.0);
  });

  it("applies decay table for repeated interactions", () => {
    expect(applyCounterpartyDecay(2)).toBe(0.7);
    expect(applyCounterpartyDecay(3)).toBe(0.4);
    expect(applyCounterpartyDecay(4)).toBe(0.1);
  });

  it("caps decay at minimum factor for high counts", () => {
    expect(applyCounterpartyDecay(10)).toBe(0.1);
  });
});
