import { getStellarNetworkLabel, initWalletKit } from "./wallet-kit"

export class NetworkMismatchError extends Error {
  walletNetwork: string
  expectedNetwork: string

  constructor(walletNetwork: string, expectedNetwork: string) {
    super(
      `Tu wallet está en ${walletNetwork} pero la dapp espera ${expectedNetwork}. Cambia la red en Freighter e intenta de nuevo.`
    )
    this.name = "NetworkMismatchError"
    this.walletNetwork = walletNetwork
    this.expectedNetwork = expectedNetwork
  }
}

export async function assertWalletNetworkMatch(): Promise<void> {
  if (typeof window === "undefined") return

  initWalletKit()

  try {
    const freighter = await import("@stellar/freighter-api")
    const connected = await freighter.isConnected()
    if (!connected) return

    const network = await freighter.getNetwork()
    const walletNetwork = network === "PUBLIC" ? "mainnet" : "testnet"
    const expectedNetwork = getStellarNetworkLabel()

    if (walletNetwork !== expectedNetwork) {
      throw new NetworkMismatchError(walletNetwork, expectedNetwork)
    }
  } catch (error) {
    if (error instanceof NetworkMismatchError) throw error
  }
}
