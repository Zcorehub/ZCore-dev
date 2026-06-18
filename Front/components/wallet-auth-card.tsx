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
import { signAuthMessage } from "@/lib/wallet-kit"
import { useWallet } from "@/providers/wallet-provider"
import { ArrowLeft, Loader2, Shield, XCircle } from "lucide-react"

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

    const challengeResult = await apiClient.requestChallenge(address)
    if (challengeResult.error || !challengeResult.data) {
      setLoading(false)
      setError(challengeResult.error?.message ?? "Failed to get auth challenge")
      return
    }

    let signature: string
    try {
      signature = await signAuthMessage(challengeResult.data.message)
    } catch {
      setLoading(false)
      setError("Wallet signature rejected. Please approve the sign request.")
      return
    }

    const payload = {
      walletAddress: address,
      message: challengeResult.data.message,
      signature,
    }

    const result = isLogin
      ? await apiClient.loginSigned(payload)
      : await apiClient.registerSigned(payload)

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
    <Card className="card-glass border-white/[0.08] bg-transparent">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-white">
            {isLogin ? "Connect your wallet" : "Register your wallet"}
          </CardTitle>
          <NetworkBadge />
        </div>
        <CardDescription className="text-white/50">
          {isLogin
            ? "Connect Freighter, xBull, or Albedo and sign to prove wallet ownership"
            : "Connect your Stellar wallet — ZCore verifies it on-chain and calculates your base score"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ConnectWalletButton variant="default" className="w-full bg-indigo-600 hover:bg-indigo-500" />

        {address && (
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 space-y-1">
            <p className="text-xs text-white/40 uppercase tracking-wide">Connected</p>
            <p className="font-medium text-white">{walletName ?? "Stellar Wallet"}</p>
            <p className="font-mono text-sm text-white/60">{truncateWallet(address, 8)}</p>
            <button
              type="button"
              onClick={() => disconnect()}
              className="text-xs text-indigo-400 hover:underline mt-1"
            >
              Use a different wallet
            </button>
          </div>
        )}

        {address && (
          <div className="flex items-start gap-2 text-xs text-white/40">
            <Shield className="h-4 w-4 shrink-0 mt-0.5 text-indigo-400" />
            <span>
              You will sign a one-time message to prove you control this wallet. No transaction
              fees.
            </span>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="border-red-500/30 bg-red-500/10">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!address ? (
          <p className="text-xs text-center text-white/40">
            Don&apos;t have a wallet?{" "}
            <a
              href="https://freighter.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:underline"
            >
              Install Freighter
            </a>
          </p>
        ) : (
          <Button
            className="w-full bg-indigo-600 hover:bg-indigo-500"
            onClick={handleContinue}
            disabled={loading}
          >
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
          <Button
            variant="ghost"
            className="w-full text-white/50 hover:text-white hover:bg-white/[0.06]"
            onClick={() => connect()}
          >
            Re-open wallet selector
          </Button>
        )}

        <p className="text-center text-sm text-white/40">
          {isLogin ? (
            <>
              New to ZCore?{" "}
              <Link href="/register" className="text-indigo-400 hover:underline">
                Register your wallet
              </Link>
            </>
          ) : (
            <>
              Already registered?{" "}
              <Link href="/login" className="text-indigo-400 hover:underline">
                Sign in
              </Link>
            </>
          )}
        </p>
      </CardContent>
    </Card>
  )
}
