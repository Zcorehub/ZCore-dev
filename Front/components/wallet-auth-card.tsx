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
import { formatUserFacingError, mapApiError } from "@/lib/api-errors"
import { AuthService } from "@/lib/auth"
import { truncateWallet } from "@/lib/stellar"
import { assertWalletNetworkMatch, NetworkMismatchError } from "@/lib/wallet-network"
import { signAuthMessage } from "@/lib/wallet-kit"
import { useWallet } from "@/providers/wallet-provider"
import { Loader2, Shield, XCircle } from "lucide-react"

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

    try {
      await assertWalletNetworkMatch()
    } catch (err) {
      setLoading(false)
      setError(err instanceof NetworkMismatchError ? err.message : "Network check failed")
      return
    }

    const challengeResult = await apiClient.requestChallenge(address)
    if (challengeResult.error || !challengeResult.data) {
      setLoading(false)
      setError(formatUserFacingError(mapApiError(
        challengeResult.error?.statusCode ?? 500,
        challengeResult.error?.message
      )))
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
        setError(formatUserFacingError(mapApiError(404)))
      } else {
        setError(formatUserFacingError(mapApiError(
          result.error.statusCode,
          result.error.message
        )))
      }
      return
    }

    if (result.data) {
      AuthService.setSession(
        { walletAddress: address, score: result.data.score },
        result.data.token
      )
      router.push("/dashboard")
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base normal-case tracking-normal font-bold">
            {isLogin ? "Connect your wallet" : "Register your wallet"}
          </CardTitle>
          <NetworkBadge />
        </div>
        <CardDescription>
          {isLogin
            ? "Connect Freighter, xBull, or Albedo and sign to prove wallet ownership"
            : "Connect your Stellar wallet — ZCore verifies it on-chain and calculates your base score"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ConnectWalletButton variant="default" className="w-full glow-white" />

        {address && (
          <div className="zk-slash border border-white/[0.08] bg-white/[0.02] p-4 space-y-1">
            <p className="section-label">Connected</p>
            <p className="font-medium text-white/80">{walletName ?? "Stellar Wallet"}</p>
            <p className="font-mono text-xs text-white/50">{truncateWallet(address, 8)}</p>
            <button
              type="button"
              onClick={() => disconnect()}
              className="text-[10px] uppercase tracking-zk text-white/40 hover:text-white mt-1 transition-colors"
            >
              Use a different wallet
            </button>
          </div>
        )}

        {address && (
          <div className="flex items-start gap-2 text-[10px] text-white/35 uppercase tracking-zk-wide">
            <Shield className="h-3.5 w-3.5 shrink-0 mt-0.5 text-white/50" />
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
          <p className="text-[10px] text-center text-white/35 uppercase tracking-zk-wide">
            Don&apos;t have a wallet?{" "}
            <a
              href="https://freighter.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors"
            >
              Install Freighter
            </a>
          </p>
        ) : (
          <Button className="w-full glow-white" onClick={handleContinue} disabled={loading}>
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
          <Button variant="ghost" className="w-full" onClick={() => connect()}>
            Re-open wallet selector
          </Button>
        )}

        <p className="text-center text-[10px] text-white/35 uppercase tracking-zk-wide">
          {isLogin ? (
            <>
              New to ZCore?{" "}
              <Link href="/register" className="text-white/60 hover:text-white transition-colors">
                Register your wallet
              </Link>
            </>
          ) : (
            <>
              Already registered?{" "}
              <Link href="/login" className="text-white/60 hover:text-white transition-colors">
                Sign in
              </Link>
            </>
          )}
        </p>
      </CardContent>
    </Card>
  )
}
