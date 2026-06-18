"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardNav } from "@/components/dashboard-nav"
import { TierBadge } from "@/components/tier-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiClient, type ContractConfig, type OnChainScore } from "@/lib/api-client"
import { AuthService } from "@/lib/auth"
import { getStellarTxUrl } from "@/lib/stellar"
import { signAuthMessage } from "@/lib/wallet-kit"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExternalLink, Link2, Loader2, RefreshCw, Shield, XCircle } from "lucide-react"

export default function AttestationPage() {
  const [config, setConfig] = useState<ContractConfig | null>(null)
  const [onChain, setOnChain] = useState<OnChainScore | null>(null)
  const [loading, setLoading] = useState(true)
  const [attesting, setAttesting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const wallet = AuthService.getWallet()

  const load = async () => {
    if (!wallet) return
    setLoading(true)
    setError(null)

    const [configRes, chainRes] = await Promise.all([
      apiClient.getContractConfig(),
      apiClient.getOnChainScore(wallet),
    ])

    setLoading(false)
    if (configRes.data) setConfig(configRes.data)
    if (chainRes.data) setOnChain(chainRes.data)
  }

  useEffect(() => {
    load()
  }, [])

  const handleAttest = async () => {
    if (!wallet) return
    setAttesting(true)
    setError(null)
    setSuccess(null)

    const challenge = await apiClient.requestChallenge(wallet)
    if (challenge.error || !challenge.data) {
      setAttesting(false)
      setError(challenge.error?.message ?? "Challenge failed")
      return
    }

    let signature: string
    try {
      signature = await signAuthMessage(challenge.data.message)
    } catch {
      setAttesting(false)
      setError("Signature rejected")
      return
    }

    const result = await apiClient.attestOnChain(wallet, {
      walletAddress: wallet,
      message: challenge.data.message,
      signature,
    })

    setAttesting(false)

    if (result.error) {
      setError(result.error.message)
      return
    }

    if (result.data) {
      setSuccess(`Score attested on-chain. Tx: ${result.data.txHash.slice(0, 12)}...`)
      load()
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#080B14]">
        <DashboardNav />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                  <Link2 className="h-7 w-7 text-indigo-400" />
                  On-Chain Attestation
                </h1>
                <p className="text-white/50">
                  Publish your ZCore score to the Soroban registry so lenders can verify it
                  on-chain without calling our API.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={load}
                disabled={loading}
                className="border-white/10 bg-transparent hover:bg-white/[0.06]"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            {error && (
              <Alert variant="destructive" className="border-red-500/30 bg-red-500/10">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                <Shield className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
              </div>
            ) : (
              <>
                <Card className="card-glass border-white/[0.08] bg-transparent">
                  <CardHeader>
                    <CardTitle className="text-white">Soroban Score Registry</CardTitle>
                    <CardDescription className="text-white/50">
                      Smart contract that stores portable credit scores on Stellar
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {config?.enabled ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-white/50">Contract</span>
                          <span className="font-mono text-xs text-white/70 truncate max-w-[200px]">
                            {config.contractId}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/50">Network</span>
                          <span className="capitalize">{config.network}</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-white/50">
                        Contract not deployed yet. See{" "}
                        <code className="text-indigo-400">Contracts/README.md</code> to deploy
                        the score-registry contract and configure the oracle.
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card className="card-glass border-white/[0.08] bg-transparent">
                  <CardHeader>
                    <CardTitle className="text-white">Your On-Chain Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {onChain && onChain.score > 0 ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <span className="text-5xl font-bold tabular-nums">{onChain.score}</span>
                          <TierBadge tier={onChain.tier} />
                        </div>
                        <p className="text-sm text-white/50">
                          Last attested:{" "}
                          {onChain.updatedAt
                            ? new Date(onChain.updatedAt * 1000).toLocaleString()
                            : "—"}
                        </p>
                      </div>
                    ) : (
                      <p className="text-white/50 text-sm">
                        No on-chain attestation yet. Publish your current score to make it
                        verifiable by any Stellar protocol.
                      </p>
                    )}

                    <Button
                      className="mt-6 bg-indigo-600 hover:bg-indigo-500"
                      onClick={handleAttest}
                      disabled={attesting || !config?.enabled}
                    >
                      {attesting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Attesting...
                        </>
                      ) : (
                        "Publish Score On-Chain"
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="card-glass border-white/[0.08] bg-transparent">
                  <CardHeader>
                    <CardTitle className="text-white text-base">How it works</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-white/50 space-y-2">
                    <p>1. You sign a message proving wallet ownership (no XLM fee).</p>
                    <p>2. The ZCore oracle writes your score to the Soroban contract.</p>
                    <p>3. Lenders call <code className="text-indigo-400">get_score(wallet)</code> directly on-chain.</p>
                    <a
                      href="https://developers.stellar.org/docs/build/smart-contracts"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-indigo-400 hover:underline mt-2"
                    >
                      Stellar Soroban docs <ExternalLink className="h-3 w-3" />
                    </a>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
