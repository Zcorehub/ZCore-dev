export const STELLAR_WALLET_REGEX = /^G[A-Z2-7]{55}$/

export function isValidStellarWallet(address: string): boolean {
  return STELLAR_WALLET_REGEX.test(address.trim())
}

export function truncateWallet(address: string, chars = 6): string {
  if (address.length <= chars * 2 + 3) return address
  return `${address.slice(0, chars)}...${address.slice(-chars)}`
}

export function getStellarTxUrl(txHash: string): string {
  const network = process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? "testnet"
  const base =
    network === "mainnet"
      ? "https://stellar.expert/explorer/public/tx"
      : "https://stellar.expert/explorer/testnet/tx"
  return `${base}/${txHash}`
}
