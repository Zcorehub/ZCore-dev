import { describe, expect, it } from "vitest";
import { parseAllowedOrigins } from "../../config/cors.config";

describe("cors.config", () => {
  it("parses comma-separated origins", () => {
    process.env.CORS_ORIGINS = "https://a.com, https://b.com";
    expect(parseAllowedOrigins()).toEqual(["https://a.com", "https://b.com"]);
  });

  it("defaults to local dapp origin", () => {
    delete process.env.CORS_ORIGINS;
    expect(parseAllowedOrigins()).toContain("http://localhost:3001");
  });
});
