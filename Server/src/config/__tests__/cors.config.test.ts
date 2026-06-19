import { describe, expect, it } from "vitest";
import { getCorsOptions, parseAllowedOrigins } from "../../config/cors.config";

describe("cors.config", () => {
  it("parses comma-separated origins", () => {
    process.env.CORS_ORIGINS = "https://a.com, https://b.com";
    expect(parseAllowedOrigins()).toEqual(["https://a.com", "https://b.com"]);
  });

  it("trims configured origins and ignores empty entries", () => {
    process.env.CORS_ORIGINS = " https://dapp-zcore.vercel.app, ,https://zcore-xi.vercel.app ";
    expect(parseAllowedOrigins()).toEqual([
      "https://dapp-zcore.vercel.app",
      "https://zcore-xi.vercel.app",
    ]);
  });

  it("defaults to local dapp origin", () => {
    delete process.env.CORS_ORIGINS;
    expect(parseAllowedOrigins()).toContain("http://localhost:3001");
  });

  it("allows configured browser origins", () =>
    new Promise<void>((resolve, reject) => {
      process.env.CORS_ORIGINS = "https://dapp-zcore.vercel.app";
      const options = getCorsOptions();

      if (typeof options.origin !== "function") {
        reject(new Error("Expected function origin option"));
        return;
      }

      options.origin("https://dapp-zcore.vercel.app", (error, allowed) => {
        try {
          expect(error).toBeNull();
          expect(allowed).toBe(true);
          resolve();
        } catch (assertionError) {
          reject(assertionError);
        }
      });
    }));

  it("rejects browser origins outside the allowlist", () =>
    new Promise<void>((resolve, reject) => {
      process.env.CORS_ORIGINS = "https://dapp-zcore.vercel.app";
      const options = getCorsOptions();

      if (typeof options.origin !== "function") {
        reject(new Error("Expected function origin option"));
        return;
      }

      options.origin("https://evil.example", (error) => {
        try {
          expect(error).toBeInstanceOf(Error);
          expect(error?.message).toBe("Origin https://evil.example not allowed by CORS");
          resolve();
        } catch (assertionError) {
          reject(assertionError);
        }
      });
    }));

  it("allows server-to-server calls without an Origin header", () =>
    new Promise<void>((resolve, reject) => {
      process.env.CORS_ORIGINS = "https://dapp-zcore.vercel.app";
      const options = getCorsOptions();

      if (typeof options.origin !== "function") {
        reject(new Error("Expected function origin option"));
        return;
      }

      options.origin(undefined, (error, allowed) => {
        try {
          expect(error).toBeNull();
          expect(allowed).toBe(true);
          resolve();
        } catch (assertionError) {
          reject(assertionError);
        }
      });
    }));
});
