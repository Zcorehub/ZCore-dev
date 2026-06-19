import { describe, expect, it } from "vitest";
import { assignProfileTier } from "../../services/scoring.service";

describe("assignProfileTier", () => {
  it("returns A for scores >= 600", () => {
    expect(assignProfileTier(600)).toBe("A");
    expect(assignProfileTier(850)).toBe("A");
  });

  it("returns B for scores 350-599", () => {
    expect(assignProfileTier(350)).toBe("B");
    expect(assignProfileTier(599)).toBe("B");
  });

  it("returns C for scores 100-349", () => {
    expect(assignProfileTier(100)).toBe("C");
    expect(assignProfileTier(349)).toBe("C");
  });

  it("returns REJECTED for scores below 100", () => {
    expect(assignProfileTier(99)).toBe("REJECTED");
    expect(assignProfileTier(0)).toBe("REJECTED");
  });
});
