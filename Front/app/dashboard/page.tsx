"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardNav } from "@/components/dashboard-nav"
import { ScoreBreakdown } from "@/components/score-breakdown"
import { TierBadge } from "@/components/tier-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiClient } from "@/lib/api-client"
import { AuthService } from "@/lib/auth"
import { getStellarTxUrl } from "@/lib/stellar"
import { EVENT_TYPE_LABELS, type CreditEventItem, type UserProfile } from "@/lib/types"
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

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">Credit Overview</h1>
                <p className="text-muted-foreground">
                  Your portable Stellar credit score built from on-chain activity and verified partner events
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {loading && !profile ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : profile ? (
              <>
                <Card>
                  <CardHeader>
                    <CardDescription>Current Score</CardDescription>
                    <div className="flex flex-wrap items-center gap-4">
                      <CardTitle className="text-6xl font-bold tabular-nums">
                        {profile.score}
                        <span className="text-2xl text-muted-foreground font-normal"> / 850</span>
                      </CardTitle>
                      <TierBadge tier={profile.profileTier} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScoreBreakdown
                      stellarBase={stellarBase}
                      eventsScore={eventsScore}
                      totalScore={profile.score}
                    />
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
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardHeader>
                  <CardContent>
                    {recentEvents.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        No credit events yet. Complete escrows, repay loans, or join tandas on partner
                        platforms to build your score.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {recentEvents.map((event) => (
                          <div
                            key={event.eventId}
                            className="flex items-center justify-between gap-4 rounded-lg border p-4"
                          >
                            <div className="min-w-0">
                              <p className="font-medium truncate">
                                {EVENT_TYPE_LABELS[event.eventType] ?? event.eventType}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {event.platform} · {event.date}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span
                                className={`font-semibold tabular-nums ${
                                  event.scoreImpact >= 0 ? "text-emerald-600" : "text-red-600"
                                }`}
                              >
                                {event.scoreImpact >= 0 ? "+" : ""}
                                {event.scoreImpact}
                              </span>
                              <a
                                href={getStellarTxUrl(event.txHash)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-foreground"
                              >
                                <ExternalLink className="h-4 w-4" />
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
      </div>
    </AuthGuard>
  )
}
