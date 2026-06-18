"use client"

import { Button } from "@/components/ui/button"
import { useWallet } from "@/providers/wallet-provider"
import { truncateWallet } from "@/lib/stellar"
import { Loader2, Wallet } from "lucide-react"

interface ConnectWalletButtonProps {
  variant?: "default" | "outline" | "ghost"
  className?: string
}

export function ConnectWalletButton({
  variant = "default",
  className,
}: ConnectWalletButtonProps) {
  const { address, walletName, isConnecting, isReady, connect } = useWallet()

  if (!isReady) {
    return (
      <Button variant={variant} className={className} disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading wallets...
      </Button>
    )
  }

  if (address) {
    return (
      <Button variant="outline" className={className} disabled>
        <Wallet className="mr-2 h-4 w-4" />
        {walletName ? `${walletName}: ` : ""}
        {truncateWallet(address)}
      </Button>
    )
  }

  return (
    <Button
      variant={variant}
      className={className}
      onClick={() => connect()}
      disabled={isConnecting}
    >
      {isConnecting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Wallet className="mr-2 h-4 w-4" />
          Connect Stellar Wallet
        </>
      )}
    </Button>
  )
}
