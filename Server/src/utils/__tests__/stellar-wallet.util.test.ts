import { describe, expect, it } from "vitest";
import {
  isValidStellarWallet,
  normalizeStellarWallet,
  truncateStellarWallet,
} from "../../utils/stellar-wallet.util";

const VALID_WALLET =
  "GD4ELZEONXZANIWRJAED5JPBN7KJG6ZQ5AV46HRLZRTEFNKWJP3UFREL";

describe("stellar-wallet.util", () => {
  it("validates correct Stellar wallet", () => {
    expect(isValidStellarWallet(VALID_WALLET)).toBe(true);
  });

  it("rejects invalid wallet formats", () => {
    expect(isValidStellarWallet("GSHORT")).toBe(false);
    expect(isValidStellarWallet("")).toBe(false);
  });

  it("trims whitespace on normalize", () => {
    expect(normalizeStellarWallet(`  ${VALID_WALLET}  `)).toBe(VALID_WALLET);
  });

  it("truncates long wallet for display", () => {
    const truncated = truncateStellarWallet(VALID_WALLET, 4);
    expect(truncated).toBe("GD4E...FREL");
    expect(truncated.length).toBeLessThan(VALID_WALLET.length);
  });
});
