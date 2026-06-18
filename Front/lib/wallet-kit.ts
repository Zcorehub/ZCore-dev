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

/** Normalize wallet signature to base64 for the API. */
function toBase64Signature(value: unknown): string {
  if (typeof value === "string") {
    return value
  }
  if (value instanceof Uint8Array || Array.isArray(value)) {
    return Buffer.from(value).toString("base64")
  }
  if (value && typeof value === "object" && "data" in value) {
    return toBase64Signature((value as { data: unknown }).data)
  }
  throw new Error("Unsupported signature format from wallet")
}

export async function signAuthMessage(message: string): Promise<string> {
  initWalletKit()

  const { signedMessage } = await StellarWalletsKit.signMessage(message, {
    networkPassphrase: getStellarNetworkPassphrase(),
  })

  return toBase64Signature(signedMessage)
}

export { StellarWalletsKit, KitEventType, FREIGHTER_ID, Networks }
