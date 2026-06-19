"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardNav } from "@/components/dashboard-nav"
import { DappShell } from "@/components/dapp-shell"
import { TierBadge } from "@/components/tier-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiClient, type ContractConfig, type OnChainScore } from "@/lib/api-client"
import { formatUserFacingError, mapApiError } from "@/lib/api-errors"
import {
  attestationStatusLabel,
  getAttestationStatus,
} from "@/lib/attestation-utils"
import { formatUnixTimestamp } from "@/lib/format-score"
import { AuthService } from "@/lib/auth"
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
      setError(formatUserFacingError(mapApiError(
        result.error.statusCode,
        result.error.message
      )))
      return
    }

    if (result.data) {
      setSuccess(`Score attested on-chain. Tx: ${result.data.txHash.slice(0, 12)}...`)
      load()
    }
  }

  const attestationStatus = onChain
    ? getAttestationStatus(onChain.updatedAt, onChain.validUntil)
    : "none"

  return (
    <AuthGuard>
      <DappShell>
        <DashboardNav />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="section-label mb-2">Soroban</p>
                <h1 className="page-title mb-2 flex items-center gap-2">
                  <Link2 className="h-6 w-6 text-white/50" />
                  On-Chain Attestation
                </h1>
                <p className="page-subtitle">
                  Publish your ZCore score to the Soroban registry so lenders can verify it on-chain
                  without calling our API.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={load} disabled={loading}>
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
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
              <Alert className="border-white/20 bg-white/[0.04] text-white/80">
                <Shield className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-white/50" />
              </div>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Soroban Score Registry</CardTitle>
                    <CardDescription>
                      Smart contract that stores portable credit scores on Stellar
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    {config?.enabled ? (
                      <>
                        <div className="flex justify-between gap-4">
                          <span className="text-white/40 uppercase tracking-zk">Contract</span>
                          <span className="font-mono text-[10px] text-white/60 truncate max-w-[200px]">
                            {config.contractId}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/40 uppercase tracking-zk">Network</span>
                          <span className="text-white/70 capitalize">{config.network}</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-white/40 tracking-wide">
                        Contract not deployed yet. See{" "}
                        <code className="text-white/60 font-mono text-[10px]">Contracts/README.md</code>{" "}
                        to deploy the score-registry contract and configure the oracle.
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Your On-Chain Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {onChain && onChain.score > 0 ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <span className="text-5xl font-black tabular-nums tracking-tighter text-white font-display">
                            {onChain.score}
                          </span>
                          <TierBadge tier={onChain.tier} />
                        </div>
                        <p className="text-[10px] text-white/35 uppercase tracking-zk-wide">
                          Last attested:{" "}
                          {onChain.updatedAt
                            ? new Date(onChain.updatedAt * 1000).toLocaleString()
                            : "—"}
                        </p>
                        {onChain.validUntil ? (
                          <p className="text-[10px] text-white/35 uppercase tracking-zk-wide">
                            Valid until: {formatUnixTimestamp(onChain.validUntil)}
                          </p>
                        ) : null}
                        {attestationStatus !== "none" && (
                          <Alert
                            className={
                              attestationStatus === "expired"
                                ? "border-red-500/30 bg-red-500/10"
                                : attestationStatus === "expiring"
                                  ? "border-amber-500/30 bg-amber-500/10"
                                  : "border-white/20 bg-white/[0.04]"
                            }
                          >
                            <AlertDescription className="text-xs">
                              {attestationStatusLabel(attestationStatus)}
                              {attestationStatus === "expired" &&
                                " — Los lenders pueden rechazar tu tier on-chain."}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-white/40 tracking-wide">
                        No on-chain attestation yet. Publish your current score to make it verifiable
                        by any Stellar protocol.
                      </p>
                    )}

                    <Button
                      className="mt-6 glow-white"
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

                <Card>
                  <CardHeader>
                    <CardTitle>How it works</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-white/40 space-y-2 tracking-wide">
                    <p>1. You sign a message proving wallet ownership (no XLM fee).</p>
                    <p>2. The ZCore oracle writes your score to the Soroban contract.</p>
                    <p>
                      3. Lenders call{" "}
                      <code className="text-white/60 font-mono text-[10px]">get_score(wallet)</code>{" "}
                      directly on-chain.
                    </p>
                    <a
                      href="https://developers.stellar.org/docs/build/smart-contracts"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-white/50 hover:text-white transition-colors mt-2 uppercase tracking-zk text-[10px]"
                    >
                      Stellar Soroban docs <ExternalLink className="h-3 w-3" />
                    </a>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </DappShell>
    </AuthGuard>
  )
}
