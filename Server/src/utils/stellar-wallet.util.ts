const STELLAR_WALLET_PATTERN = /^G[A-Z2-7]{55}$/;

export function isValidStellarWallet(address: string): boolean {
  return STELLAR_WALLET_PATTERN.test(address.trim());
}

export function normalizeStellarWallet(address: string): string {
  return address.trim();
}

export function truncateStellarWallet(address: string, chars = 6): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
