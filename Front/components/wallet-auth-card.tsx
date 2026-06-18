"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ConnectWalletButton } from "@/components/connect-wallet-button"
import { NetworkBadge } from "@/components/network-badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiClient } from "@/lib/api-client"
import { AuthService } from "@/lib/auth"
import { truncateWallet } from "@/lib/stellar"
import { useWallet } from "@/providers/wallet-provider"
import { ArrowLeft, Loader2, XCircle } from "lucide-react"

interface WalletAuthCardProps {
  mode: "login" | "register"
}

export function WalletAuthCard({ mode }: WalletAuthCardProps) {
  const router = useRouter()
  const { address, walletName, connect, disconnect } = useWallet()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isLogin = mode === "login"

  const handleContinue = async () => {
    if (!address) return

    setLoading(true)
    setError(null)

    const result = isLogin
      ? await apiClient.login(address)
      : await apiClient.register(address)

    setLoading(false)

    if (result.error) {
      if (isLogin && result.error.statusCode === 404) {
        setError("Wallet not registered. Create an account first.")
      } else {
        setError(result.error.message)
      }
      return
    }

    if (result.data) {
      AuthService.setSession({ walletAddress: address, score: result.data.score })
      router.push("/dashboard")
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>{isLogin ? "Connect your wallet" : "Register your wallet"}</CardTitle>
          <NetworkBadge />
        </div>
        <CardDescription>
          {isLogin
            ? "Connect Freighter, xBull, or Albedo to access your ZCore credit profile"
            : "Connect your Stellar wallet — ZCore verifies it on-chain and calculates your base score"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ConnectWalletButton variant="default" className="w-full" />

        {address && (
          <div className="rounded-lg border bg-muted/40 p-4 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Connected</p>
            <p className="font-medium">{walletName ?? "Stellar Wallet"}</p>
            <p className="font-mono text-sm text-muted-foreground">{truncateWallet(address, 8)}</p>
            <button
              type="button"
              onClick={() => disconnect()}
              className="text-xs text-primary hover:underline mt-1"
            >
              Use a different wallet
            </button>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!address ? (
          <p className="text-xs text-center text-muted-foreground">
            Don&apos;t have a wallet?{" "}
            <a
              href="https://freighter.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Install Freighter
            </a>{" "}
            or create one on{" "}
            <a
              href="https://laboratory.stellar.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Stellar Laboratory
            </a>
          </p>
        ) : (
          <Button className="w-full" onClick={handleContinue} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isLogin ? "Signing in..." : "Registering..."}
              </>
            ) : isLogin ? (
              "Sign In with ZCore"
            ) : (
              "Register with ZCore"
            )}
          </Button>
        )}

        {!address && (
          <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => connect()}>
            Re-open wallet selector
          </Button>
        )}

        <p className="text-center text-sm text-muted-foreground">
          {isLogin ? (
            <>
              New to ZCore?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Register your wallet
              </Link>
            </>
          ) : (
            <>
              Already registered?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </>
          )}
        </p>
      </CardContent>
    </Card>
  )
}
