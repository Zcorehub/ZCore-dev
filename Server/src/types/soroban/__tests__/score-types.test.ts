import { describe, expect, it } from "vitest";
import {
  isAttested,
  isScoreFresh,
  tierCodeToLabel,
  tierLabelToCode,
  ZCoreTierCode,
  ZCORE_INTERFACE_VERSION,
} from "../score-types";

describe("ZCore soroban score types", () => {
  it("maps tier labels to codes", () => {
    expect(tierLabelToCode("A")).toBe(ZCoreTierCode.A);
    expect(tierLabelToCode("B")).toBe(ZCoreTierCode.B);
    expect(tierLabelToCode("C")).toBe(ZCoreTierCode.C);
    expect(tierLabelToCode("UNKNOWN")).toBe(ZCoreTierCode.REJECTED);
  });

  it("maps tier codes to labels", () => {
    expect(tierCodeToLabel(3)).toBe("A");
    expect(tierCodeToLabel(0)).toBe("REJECTED");
  });

  it("detects attested records", () => {
    expect(isAttested({ score: 400, tier: 2, updatedAt: 1000 })).toBe(true);
    expect(isAttested({ score: 0, tier: 0, updatedAt: 0 })).toBe(false);
  });

  it("checks freshness with valid_until", () => {
    const record = {
      score: 500,
      tier: 2,
      updatedAt: 1000,
      validUntil: 2000,
    };
    expect(isScoreFresh(record, 1500, 999_999)).toBe(true);
    expect(isScoreFresh(record, 2500, 999_999)).toBe(false);
  });

  it("checks freshness with max age fallback", () => {
    const record = { score: 500, tier: 2, updatedAt: 1000 };
    expect(isScoreFresh(record, 1100, 200)).toBe(true);
    expect(isScoreFresh(record, 1500, 200)).toBe(false);
  });

  it("exports interface version 1", () => {
    expect(ZCORE_INTERFACE_VERSION).toBe(1);
  });
});
