import type { StellarWalletData } from "./stellar.service";

interface CacheEntry {
  data: StellarWalletData;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

function cacheKey(walletAddress: string): string {
  const network = process.env.STELLAR_NETWORK === "mainnet" ? "mainnet" : "testnet";
  return `${network}:${walletAddress}`;
}

function getDefaultTtlMs(): number {
  const parsed = Number.parseInt(process.env.HORIZON_CACHE_TTL_MS ?? "900000", 10);
  return Number.isNaN(parsed) ? 900_000 : parsed;
}

export function isHorizonCacheEnabled(): boolean {
  return process.env.HORIZON_CACHE_ENABLED !== "false";
}

export function getCachedWalletData(
  walletAddress: string
): StellarWalletData | null {
  if (!isHorizonCacheEnabled()) return null;

  const entry = cache.get(cacheKey(walletAddress));
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(cacheKey(walletAddress));
    return null;
  }
  return entry.data;
}

export function setCachedWalletData(
  walletAddress: string,
  data: StellarWalletData
): void {
  if (!isHorizonCacheEnabled() || !data.isValid) return;

  cache.set(cacheKey(walletAddress), {
    data,
    expiresAt: Date.now() + getDefaultTtlMs(),
  });
}

export function clearHorizonCache(): void {
  cache.clear();
}
