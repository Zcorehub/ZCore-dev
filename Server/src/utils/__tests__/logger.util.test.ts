import { describe, expect, it } from "vitest";
import { maskWallet } from "../../utils/logger.util";

describe("logger.util", () => {
  it("masks wallet addresses for logs", () => {
    const wallet =
      "GD4ELZEONXZANIWRJAED5JPBN7KJG6ZQ5AV46HRLZRTEFNKWJP3UFREL";
    expect(maskWallet(wallet)).toBe("GD4ELZ...FREL");
  });
});
