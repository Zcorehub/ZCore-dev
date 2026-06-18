"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardNav } from "@/components/dashboard-nav"
import { NetworkBadge } from "@/components/network-badge"
import { TierBadge } from "@/components/tier-badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api-client"
import { AuthService } from "@/lib/auth"
import { getStellarAccountUrl } from "@/lib/stellar"
import { fetchHorizonAccountStats, fetchWalletAgeDays } from "@/lib/horizon-client"
import { useWallet } from "@/providers/wallet-provider"
import type { UserProfile } from "@/lib/types"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Check, Copy, ExternalLink, Loader2, XCircle } from "lucide-react"

export default function ProfilePage() {
  const [horizonStats, setHorizonStats] = useState<{
    xlmBalance: number
    trustlineCount: number
    walletAgeDays: number | null
  } | null>(null)
  const { address: connectedAddress, walletName } = useWallet()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const sessionWallet = AuthService.getWallet()

  useEffect(() => {
    const load = async () => {
      const wallet = AuthService.getWallet()
      if (!wallet) return

      setLoading(true)
      const [profileRes, accountStats, walletAge] = await Promise.all([
        apiClient.getProfile(wallet),
        fetchHorizonAccountStats(wallet),
        fetchWalletAgeDays(wallet),
      ])
      setLoading(false)

      if (profileRes.error) {
        setError(profileRes.error.message)
        return
      }
      setProfile(profileRes.data ?? null)

      if (accountStats) {
        setHorizonStats({
          xlmBalance: accountStats.xlmBalance,
          trustlineCount: accountStats.trustlineCount,
          walletAgeDays: walletAge,
        })
      }
    }
    load()
  }, [])

  const copyWallet = async () => {
    if (!sessionWallet) return
    await navigator.clipboard.writeText(sessionWallet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const walletMismatch =
    connectedAddress && sessionWallet && connectedAddress !== sessionWallet

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#080B14]">
        <DashboardNav />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Wallet Profile</h1>
              <p className="text-muted-foreground">Your connected Stellar wallet and ZCore account</p>
            </div>

            {walletMismatch && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  Connected wallet does not match your ZCore session. Sign out and reconnect with{" "}
                  {sessionWallet?.slice(0, 8)}...
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : profile ? (
              <>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Stellar Wallet</CardTitle>
                      <NetworkBadge />
                    </div>
                    <CardDescription>
                      {walletName ? `Connected via ${walletName}` : "Wallet connection"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg border bg-muted/30 p-4 font-mono text-sm break-all">
                      {profile.walletAddress}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={copyWallet}>
                        {copied ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy address
                          </>
                        )}
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={getStellarAccountUrl(profile.walletAddress)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View on Explorer
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {horizonStats && (
                  <Card className="card-glass border-white/[0.08] bg-transparent">
                    <CardHeader>
                      <CardTitle className="text-white">Stellar Horizon Data</CardTitle>
                      <CardDescription className="text-white/50">
                        Live on-chain metrics that feed your Stellar Base score
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-white/50">Wallet age</p>
                        <p className="text-lg font-semibold text-white">
                          {horizonStats.walletAgeDays ?? 0} days
                        </p>
                      </div>
                      <div>
                        <p className="text-white/50">XLM balance</p>
                        <p className="text-lg font-semibold text-white">
                          {horizonStats.xlmBalance.toFixed(2)} XLM
                        </p>
                      </div>
                      <div>
                        <p className="text-white/50">Trustlines</p>
                        <p className="text-lg font-semibold text-white">
                          {horizonStats.trustlineCount}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="card-glass border-white/[0.08] bg-transparent">
                  <CardHeader>
                    <CardTitle>ZCore Account</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Credit Score</span>
                      <span className="text-2xl font-bold tabular-nums">{profile.score}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Tier</span>
                      <TierBadge tier={profile.profileTier} />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Member since</span>
                      <span>{new Date(profile.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last updated</span>
                      <span>{new Date(profile.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
