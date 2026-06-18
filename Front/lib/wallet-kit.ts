import {
  StellarWalletsKit,
  Networks,
  KitEventType,
} from "@creit.tech/stellar-wallets-kit"
import {
  FreighterModule,
  FREIGHTER_ID,
} from "@creit.tech/stellar-wallets-kit/modules/freighter"
import { AlbedoModule } from "@creit.tech/stellar-wallets-kit/modules/albedo"
import { xBullModule } from "@creit.tech/stellar-wallets-kit/modules/xbull"

let initialized = false

export function getStellarNetworkPassphrase(): string {
  return process.env.NEXT_PUBLIC_STELLAR_NETWORK === "mainnet"
    ? Networks.PUBLIC
    : Networks.TESTNET
}

export function getStellarNetworkLabel(): "mainnet" | "testnet" {
  return process.env.NEXT_PUBLIC_STELLAR_NETWORK === "mainnet" ? "mainnet" : "testnet"
}

export function initWalletKit(): void {
  if (initialized || typeof window === "undefined") return

  StellarWalletsKit.init({
    network: getStellarNetworkPassphrase(),
    selectedWalletId: FREIGHTER_ID,
    modules: [new FreighterModule(), new AlbedoModule(), new xBullModule()],
  })

  initialized = true
}

export async function connectWallet(): Promise<{ address: string }> {
  initWalletKit()
  return StellarWalletsKit.authModal()
}

export async function disconnectWallet(): Promise<void> {
  initWalletKit()
  await StellarWalletsKit.disconnect()
}

export async function getConnectedAddress(): Promise<string | null> {
  initWalletKit()
  try {
    const { address } = await StellarWalletsKit.getAddress()
    return address
  } catch {
    return null
  }
}

export function getSelectedWalletName(): string | null {
  try {
    return StellarWalletsKit.selectedModule.productName
  } catch {
    return null
  }
}

export async function signAuthMessage(message: string): Promise<string> {
  initWalletKit()
  const result = await StellarWalletsKit.signMessage(Buffer.from(message, "utf8"))
  return Buffer.from(result.signature).toString("base64")
}

export { StellarWalletsKit, KitEventType, FREIGHTER_ID, Networks }
