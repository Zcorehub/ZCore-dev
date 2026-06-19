import { describe, expect, it, beforeEach } from "vitest";
import {
  clearHorizonCache,
  getCachedWalletData,
  isHorizonCacheEnabled,
  setCachedWalletData,
} from "../../services/horizon-cache.service";
import type { StellarWalletData } from "../../services/stellar.service";

const sampleData: StellarWalletData = {
  walletAge: 100,
  totalTransactions: 10,
  successfulTransactions: 9,
  averageBalance: 50,
  accountAge: 100,
  operationsCount: 5,
  trustlineCount: 2,
  isValid: true,
  firstTransactionDate: "2024-01-01T00:00:00Z",
};

describe("horizon-cache.service", () => {
  beforeEach(() => {
    clearHorizonCache();
    process.env.HORIZON_CACHE_ENABLED = "true";
  });

  it("stores and retrieves valid wallet data", () => {
    setCachedWalletData("GTEST", sampleData);
    expect(getCachedWalletData("GTEST")).toEqual(sampleData);
  });

  it("does not cache invalid wallet data", () => {
    setCachedWalletData("GTEST", { ...sampleData, isValid: false });
    expect(getCachedWalletData("GTEST")).toBeNull();
  });

  it("respects HORIZON_CACHE_ENABLED=false", () => {
    process.env.HORIZON_CACHE_ENABLED = "false";
    setCachedWalletData("GTEST", sampleData);
    expect(isHorizonCacheEnabled()).toBe(false);
    expect(getCachedWalletData("GTEST")).toBeNull();
  });
});
