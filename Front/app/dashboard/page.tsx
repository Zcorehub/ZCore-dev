"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardNav } from "@/components/dashboard-nav"
import { DappShell } from "@/components/dapp-shell"
import { ScoreBreakdown } from "@/components/score-breakdown"
import { TierBadge } from "@/components/tier-badge"
import { TierProgress } from "@/components/tier-progress"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiClient } from "@/lib/api-client"
import { AuthService } from "@/lib/auth"
import { getStellarTxUrl } from "@/lib/stellar"
import { EVENT_TYPE_LABELS, type CreditEventItem, type UserProfile } from "@/lib/types"
import { getTierProgress } from "@/lib/tier-utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowRight, ExternalLink, Loader2, RefreshCw, XCircle } from "lucide-react"

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [recentEvents, setRecentEvents] = useState<CreditEventItem[]>([])
  const [eventsScore, setEventsScore] = useState(0)

  const loadData = async () => {
    const wallet = AuthService.getWallet()
    if (!wallet) return

    setLoading(true)
    setError(null)

    const [profileResult, historyResult] = await Promise.all([
      apiClient.getProfile(wallet),
      apiClient.getHistory(wallet),
    ])

    setLoading(false)

    if (profileResult.error) {
      setError(profileResult.error.message)
      return
    }

    if (profileResult.data) {
      setProfile(profileResult.data)
      AuthService.updateScore(profileResult.data.score)
    }

    if (historyResult.data) {
      const events = historyResult.data.events
      setRecentEvents(events.slice(0, 5))
      const totalEventsScore = events.reduce((sum, e) => sum + e.scoreImpact, 0)
      setEventsScore(totalEventsScore)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const stellarBase = profile ? Math.max(0, profile.score - eventsScore) : 0
  const tierProgress = profile ? getTierProgress(profile.score) : null

  return (
    <AuthGuard>
      <DappShell>
        <DashboardNav />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="section-label mb-2">Dashboard</p>
                <h1 className="page-title mb-2">Credit Overview</h1>
                <p className="page-subtitle">
                  Your portable Stellar credit score built from on-chain activity and verified partner
                  events
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
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

            {loading && !profile ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-white/50" />
              </div>
            ) : profile ? (
              <>
                <Card>
                  <CardHeader>
                    <CardDescription>Current Score</CardDescription>
                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      <div className="text-6xl sm:text-7xl font-black tabular-nums tracking-tighter text-white font-display normal-case">
                        {profile.score}
                        <span className="text-2xl text-white/30 font-normal"> / 850</span>
                      </div>
                      <TierBadge tier={profile.profileTier} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ScoreBreakdown
                      stellarBase={stellarBase}
                      eventsScore={eventsScore}
                      totalScore={profile.score}
                    />
                    {tierProgress && (
                      <TierProgress
                        score={profile.score}
                        currentTier={tierProgress.currentTier}
                        nextTier={tierProgress.nextTier}
                        progress={tierProgress.progress}
                        pointsToNext={tierProgress.pointsToNext}
                      />
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>
                        Verified events from Trustless Work, Blend Protocol, and Vaquita
                      </CardDescription>
                    </div>
                    <Link href="/dashboard/history">
                      <Button variant="ghost" size="sm">
                        View all
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </CardHeader>
                  <CardContent>
                    {recentEvents.length === 0 ? (
                      <p className="text-xs text-white/40 py-4 text-center tracking-wide">
                        No credit events yet. Complete escrows, repay loans, or join tandas on
                        partner platforms to build your score.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {recentEvents.map((event) => (
                          <div
                            key={event.eventId}
                            className="flex items-center justify-between gap-4 zk-slash border border-white/[0.06] bg-white/[0.02] p-4 hover:border-white/10 transition-colors"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-bold uppercase tracking-zk text-white/80 truncate">
                                {EVENT_TYPE_LABELS[event.eventType] ?? event.eventType}
                              </p>
                              <p className="text-[10px] text-white/35 mt-1">
                                {event.platform} · {event.date}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span
                                className={`text-sm font-bold tabular-nums ${
                                  event.scoreImpact >= 0 ? "text-white/80" : "text-white/40"
                                }`}
                              >
                                {event.scoreImpact >= 0 ? "+" : ""}
                                {event.scoreImpact}
                              </span>
                              <a
                                href={getStellarTxUrl(event.txHash)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white/30 hover:text-white transition-colors"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
