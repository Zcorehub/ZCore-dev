import { afterEach, describe, expect, it, vi } from "vitest";
import { readOnChainScore } from "../../services/soroban.service";
import { withMockContractId } from "../mock-soroban";

const ORIGINAL_CONTRACT_ID = process.env.SCORE_REGISTRY_CONTRACT_ID;

vi.mock("@stellar/stellar-sdk", () => {
  class MockAccount {
    constructor(
      public accountId: string,
      public sequence: string
    ) {}
  }

  class MockContract {
    constructor(public contractId: string) {}

    call() {
      return { operation: "get_score" };
    }
  }

  class MockServer {
    async simulateTransaction() {
      return { result: { retval: "mock-score" } };
    }
  }

  class MockTransactionBuilder {
    addOperation() {
      return this;
    }

    setTimeout() {
      return this;
    }

    build() {
      return {};
    }
  }

  return {
    Account: MockAccount,
    Address: { fromString: (wallet: string) => wallet },
    Contract: MockContract,
    Networks: {
      PUBLIC: "Public Global Stellar Network ; September 2015",
      TESTNET: "Test SDF Network ; September 2015",
    },
    TransactionBuilder: MockTransactionBuilder,
    nativeToScVal: (value: unknown) => value,
    rpc: {
      Api: { isSimulationError: () => false },
      Server: MockServer,
    },
    scValToNative: () => ({
      score: 620,
      tier: 3,
      updated_at: 1_718_000_000,
      valid_until: 0,
    }),
  };
});

describe("withMockContractId", () => {
  afterEach(() => {
    if (ORIGINAL_CONTRACT_ID === undefined) {
      delete process.env.SCORE_REGISTRY_CONTRACT_ID;
    } else {
      process.env.SCORE_REGISTRY_CONTRACT_ID = ORIGINAL_CONTRACT_ID;
    }
  });

  it("configures Server score reads to use a mock Soroban contract id", async () => {
    withMockContractId("CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");

    const score = await readOnChainScore(
      "GD4ELZEONXZANIWRJAED5JPBN7KJG6ZQ5AV46HRLZRTEFNKWJP3UFREL"
    );

    expect(score).toEqual({
      score: 620,
      tier: 3,
      updatedAt: 1_718_000_000,
      validUntil: 0,
    });
  });

  it("rejects blank mock contract ids", () => {
    expect(() => withMockContractId("   ")).toThrow(
      "Mock Soroban contract id is required"
    );
  });
});
