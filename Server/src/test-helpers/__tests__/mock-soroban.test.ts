import { afterEach, describe, expect, it } from "vitest";
import {
  clearMockContractId,
  getEffectiveContractId,
  isUsingMockContract,
  withMockContractId,
} from "../../test-helpers/mock-soroban";
import { getContractConfig } from "../../services/soroban.service";

describe("mock-soroban helper", () => {
  afterEach(() => {
    clearMockContractId();
    delete process.env.SCORE_REGISTRY_CONTRACT_ID;
  });

  it("overrides contract id for tests", () => {
    process.env.SCORE_REGISTRY_CONTRACT_ID = "C_PROD";
    withMockContractId("C_MOCK");

    expect(getEffectiveContractId()).toBe("C_MOCK");
    expect(isUsingMockContract()).toBe(true);
    expect(getContractConfig()?.contractId).toBe("C_MOCK");
  });

  it("clears override", () => {
    withMockContractId("C_MOCK");
    clearMockContractId();

    expect(getEffectiveContractId()).toBeUndefined();
    expect(isUsingMockContract()).toBe(false);
  });
});
