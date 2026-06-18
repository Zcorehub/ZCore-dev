"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardNav } from "@/components/dashboard-nav"
import { DappShell } from "@/components/dapp-shell"
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
      <DappShell>
        <DashboardNav />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <p className="section-label mb-2">Account</p>
              <h1 className="page-title mb-2">Wallet Profile</h1>
              <p className="page-subtitle">Your connected Stellar wallet and ZCore account</p>
            </div>

            {walletMismatch && (
              <Alert variant="destructive" className="border-red-500/30 bg-red-500/10">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  Connected wallet does not match your ZCore session. Sign out and reconnect with{" "}
                  {sessionWallet?.slice(0, 8)}...
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive" className="border-red-500/30 bg-red-500/10">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-white/50" />
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
                    <div className="zk-slash border border-white/[0.08] bg-white/[0.02] p-4 font-mono text-xs text-white/70 break-all">
                      {profile.walletAddress}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={copyWallet}>
                        {copied ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
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
                          <ExternalLink className="h-3.5 w-3.5" />
                          View on Explorer
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {horizonStats && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Stellar Horizon Data</CardTitle>
                      <CardDescription>
                        Live on-chain metrics that feed your Stellar Base score
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="section-label mb-1">Wallet age</p>
                        <p className="text-lg font-black tabular-nums text-white">
                          {horizonStats.walletAgeDays ?? 0} days
                        </p>
                      </div>
                      <div>
                        <p className="section-label mb-1">XLM balance</p>
                        <p className="text-lg font-black tabular-nums text-white">
                          {horizonStats.xlmBalance.toFixed(2)} XLM
                        </p>
                      </div>
                      <div>
                        <p className="section-label mb-1">Trustlines</p>
                        <p className="text-lg font-black tabular-nums text-white">
                          {horizonStats.trustlineCount}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>ZCore Account</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-white/40 text-xs uppercase tracking-zk">Credit Score</span>
                      <span className="text-2xl font-black tabular-nums text-white">{profile.score}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/40 text-xs uppercase tracking-zk">Tier</span>
                      <TierBadge tier={profile.profileTier} />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/40 uppercase tracking-zk">Member since</span>
                      <span className="text-white/70">{new Date(profile.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/40 uppercase tracking-zk">Last updated</span>
                      <span className="text-white/70">{new Date(profile.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </div>
        </div>
      </DappShell>
    </AuthGuard>
  )
}
