import { describe, expect, it } from "vitest";
import { addDays, secondsSince, toIsoTimestamp } from "../../utils/date.util";

describe("date.util", () => {
  it("returns ISO timestamp string", () => {
    const iso = toIsoTimestamp(new Date("2026-06-18T12:00:00.000Z"));
    expect(iso).toBe("2026-06-18T12:00:00.000Z");
  });

  it("calculates seconds since epoch ms", () => {
    const past = Date.now() - 5000;
    expect(secondsSince(past)).toBeGreaterThanOrEqual(4);
  });

  it("adds days to a date", () => {
    const base = new Date("2026-06-18T00:00:00.000Z");
    const result = addDays(base, 7);
    expect(result.getUTCDate()).toBe(25);
  });
});
