import { describe, expect, it } from "vitest";
import {
  checkRateLimit,
  resetRateLimitStateForTests,
} from "../../services/rate-limit.service";

describe("rate-limit.service", () => {
  it("allows requests under the limit", async () => {
    resetRateLimitStateForTests();

    const first = await checkRateLimit("test:key", 3, 60);
    const second = await checkRateLimit("test:key", 3, 60);

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
  });

  it("blocks requests over the limit with retry-after", async () => {
    resetRateLimitStateForTests();

    await checkRateLimit("test:block", 2, 60);
    await checkRateLimit("test:block", 2, 60);
    const blocked = await checkRateLimit("test:block", 2, 60);

    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });
});
