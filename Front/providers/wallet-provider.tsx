"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import {
  connectWallet as kitConnect,
  disconnectWallet as kitDisconnect,
  getSelectedWalletName,
  initWalletKit,
  StellarWalletsKit,
  KitEventType,
} from "@/lib/wallet-kit"

interface StoredWallet {
  address: string
  walletName: string | null
}

interface WalletContextValue {
  address: string | null
  walletName: string | null
  isConnecting: boolean
  isReady: boolean
  connect: () => Promise<string | null>
  disconnect: () => Promise<void>
}

const WalletContext = createContext<WalletContextValue | null>(null)
const WALLET_STORAGE_KEY = "zcore_stellar_wallet"

function persistWallet(data: StoredWallet | null) {
  if (typeof window === "undefined") return
  if (data) {
    localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(data))
  } else {
    localStorage.removeItem(WALLET_STORAGE_KEY)
  }
}

function readStoredWallet(): StoredWallet | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem(WALLET_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredWallet
  } catch {
    return null
  }
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [walletName, setWalletName] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    initWalletKit()

    const stored = readStoredWallet()
    if (stored?.address) {
      setAddress(stored.address)
      setWalletName(stored.walletName)
    }

    const unsub = StellarWalletsKit.on(KitEventType.STATE_UPDATED, ({ payload }) => {
      if (payload.address) {
        setAddress(payload.address)
        const name = getSelectedWalletName()
        setWalletName(name)
        persistWallet({ address: payload.address, walletName: name })
      } else {
        setAddress(null)
        setWalletName(null)
        persistWallet(null)
      }
    })

    setIsReady(true)
    return () => unsub()
  }, [])

  const connect = useCallback(async () => {
    setIsConnecting(true)
    try {
      const { address: connected } = await kitConnect()
      const name = getSelectedWalletName()
      setAddress(connected)
      setWalletName(name)
      persistWallet({ address: connected, walletName: name })
      return connected
    } catch {
      return null
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const disconnect = useCallback(async () => {
    await kitDisconnect()
    setAddress(null)
    setWalletName(null)
    persistWallet(null)
  }, [])

  return (
    <WalletContext.Provider
      value={{ address, walletName, isConnecting, isReady, connect, disconnect }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) {
    throw new Error("useWallet must be used within WalletProvider")
  }
  return ctx
}
