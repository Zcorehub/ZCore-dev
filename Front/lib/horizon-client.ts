export interface HorizonAccountStats {
  xlmBalance: number
  trustlineCount: number
  sequence: string
  isValid: boolean
}

export async function fetchHorizonAccountStats(
  walletAddress: string
): Promise<HorizonAccountStats | null> {
  const network = process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? "testnet"
  const base =
    network === "mainnet"
      ? "https://horizon.stellar.org"
      : "https://horizon-testnet.stellar.org"

  try {
    const res = await fetch(`${base}/accounts/${walletAddress}`)
    if (!res.ok) return null

    const data = (await res.json()) as {
      sequence: string
      balances: Array<{ asset_type: string; balance: string }>
    }

    const xlm = data.balances.find((b) => b.asset_type === "native")
    const trustlineCount = data.balances.filter((b) => b.asset_type !== "native").length

    return {
      xlmBalance: xlm ? parseFloat(xlm.balance) : 0,
      trustlineCount,
      sequence: data.sequence,
      isValid: true,
    }
  } catch {
    return null
  }
}

export async function fetchWalletAgeDays(walletAddress: string): Promise<number | null> {
  const network = process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? "testnet"
  const base =
    network === "mainnet"
      ? "https://horizon.stellar.org"
      : "https://horizon-testnet.stellar.org"

  try {
    const res = await fetch(
      `${base}/accounts/${walletAddress}/transactions?order=asc&limit=1`
    )
    if (!res.ok) return null

    const data = (await res.json()) as {
      _embedded: { records: Array<{ created_at: string }> }
    }

    const first = data._embedded.records[0]
    if (!first) return 0

    const firstDate = new Date(first.created_at)
    return Math.floor((Date.now() - firstDate.getTime()) / (1000 * 60 * 60 * 24))
  } catch {
    return null
  }
}
