"use client"

import { useCallback, useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardNav } from "@/components/dashboard-nav"
import { DappShell } from "@/components/dapp-shell"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api-client"
import { formatUserFacingError, mapApiError } from "@/lib/api-errors"
import { AuthService } from "@/lib/auth"
import { getStellarTxUrl, truncateWallet } from "@/lib/stellar"
import {
  EVENT_TYPE_LABELS,
  type CreditEventItem,
  type ScoreHistoryEntry,
} from "@/lib/types"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChevronLeft, ChevronRight, ExternalLink, Loader2, XCircle } from "lucide-react"

const PAGE_SIZE = 20

export default function HistoryPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [events, setEvents] = useState<CreditEventItem[]>([])
  const [timeline, setTimeline] = useState<ScoreHistoryEntry[]>([])
  const [totalPositive, setTotalPositive] = useState(0)
  const [totalNegative, setTotalNegative] = useState(0)
  const [offset, setOffset] = useState(0)
  const [totalEvents, setTotalEvents] = useState(0)
  const [currentScore, setCurrentScore] = useState(0)

  const loadHistory = useCallback(async (pageOffset: number) => {
    const wallet = AuthService.getWallet()
    if (!wallet) return

    setLoading(true)
    setError(null)

    const [eventsResult, timelineResult] = await Promise.all([
      apiClient.getHistory(wallet, { limit: PAGE_SIZE, offset: pageOffset }),
      apiClient.getScoreHistory(wallet, { limit: PAGE_SIZE, offset: pageOffset }),
    ])

    setLoading(false)

    if (eventsResult.error) {
      setError(
        formatUserFacingError(
          mapApiError(eventsResult.error.statusCode, eventsResult.error.message)
        )
      )
      return
    }

    if (eventsResult.data) {
      setEvents(eventsResult.data.events)
      setTotalPositive(eventsResult.data.totalPositive)
      setTotalNegative(eventsResult.data.totalNegative)
      setTotalEvents(eventsResult.data.pagination?.total ?? eventsResult.data.events.length)
    }

    if (timelineResult.data) {
      setTimeline(timelineResult.data.history)
      setCurrentScore(timelineResult.data.currentScore)
      if (timelineResult.data.pagination?.total) {
        setTotalEvents(timelineResult.data.pagination.total)
      }
    }
  }, [])

  useEffect(() => {
    loadHistory(offset)
  }, [loadHistory, offset])

  const canGoPrev = offset > 0
  const canGoNext = offset + PAGE_SIZE < totalEvents

  return (
    <AuthGuard>
      <DappShell>
        <DashboardNav />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="max-w-5xl mx-auto space-y-8">
            <div>
              <p className="section-label mb-2">Audit Trail</p>
              <h1 className="page-title mb-2">Credit History</h1>
              <p className="page-subtitle">
                Full audit trail of verified on-chain events that contribute to your score
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="border-red-500/30 bg-red-500/10">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Current score</CardDescription>
                  <p className="text-2xl font-black tabular-nums text-white pt-1">{currentScore}</p>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total gained</CardDescription>
                  <p className="text-2xl font-black tabular-nums text-white pt-1">+{totalPositive}</p>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total lost</CardDescription>
                  <p className="text-2xl font-black tabular-nums text-white/50 pt-1">{totalNegative}</p>
                </CardHeader>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Score timeline</CardTitle>
                <CardDescription>How your score changed over time</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-white/50" />
                  </div>
                ) : timeline.length === 0 ? (
                  <p className="text-xs text-white/40 py-6 text-center tracking-wide">
                    Aún no hay cambios de score registrados.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/[0.06] hover:bg-transparent">
                        <TableHead className="text-[10px] uppercase tracking-zk-wide text-white/30">Date</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-zk-wide text-white/30">Source</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-zk-wide text-white/30 text-right">Before</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-zk-wide text-white/30 text-right">After</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-zk-wide text-white/30 text-right">Delta</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timeline.map((entry) => (
                        <TableRow
                          key={`${entry.timestamp}-${entry.source}-${entry.delta}`}
                          className="border-white/[0.06] hover:bg-white/[0.02]"
                        >
                          <TableCell className="text-white/40 text-xs">
                            {entry.timestamp.split("T")[0]}
                          </TableCell>
                          <TableCell className="text-white/70 text-xs">
                            {EVENT_TYPE_LABELS[entry.source] ?? entry.source}
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-xs text-white/60">
                            {entry.scoreBefore}
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-xs text-white/80">
                            {entry.scoreAfter}
                          </TableCell>
                          <TableCell
                            className={`text-right font-bold tabular-nums text-xs ${
                              entry.delta >= 0 ? "text-white/80" : "text-white/40"
                            }`}
                          >
                            {entry.delta >= 0 ? "+" : ""}
                            {entry.delta}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle>Events</CardTitle>
                  <CardDescription>
                    Verified credit events ({totalEvents} total)
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!canGoPrev || loading}
                    onClick={() => setOffset((value) => Math.max(0, value - PAGE_SIZE))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs text-white/40 tabular-nums">
                    {totalEvents === 0 ? 0 : offset + 1}–{Math.min(offset + PAGE_SIZE, totalEvents)} / {totalEvents}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!canGoNext || loading}
                    onClick={() => setOffset((value) => value + PAGE_SIZE)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-white/50" />
                  </div>
                ) : events.length === 0 ? (
                  <p className="text-xs text-white/40 py-8 text-center tracking-wide">
                    No hay eventos registrados aún. Completa pagos verificados en plataformas
                    partner (Trustless Work, Blend, Vaquita) para construir tu historial.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/[0.06] hover:bg-transparent">
                        <TableHead className="text-[10px] uppercase tracking-zk-wide text-white/30">Date</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-zk-wide text-white/30">Platform</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-zk-wide text-white/30">Event</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-zk-wide text-white/30 text-right">Amount</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-zk-wide text-white/30 text-right">Impact</TableHead>
                        <TableHead className="text-[10px] uppercase tracking-zk-wide text-white/30 text-right">Tx</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {events.map((event) => (
                        <TableRow key={event.eventId} className="border-white/[0.06] hover:bg-white/[0.02]">
                          <TableCell className="text-white/40 text-xs">{event.date}</TableCell>
                          <TableCell className="text-white/70 text-xs">{event.platform}</TableCell>
                          <TableCell className="text-white/80 text-xs">
                            {EVENT_TYPE_LABELS[event.eventType] ?? event.eventType}
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-xs text-white/60">
                            {event.amount} {event.currency}
                          </TableCell>
                          <TableCell
                            className={`text-right font-bold tabular-nums text-xs ${
                              event.scoreImpact >= 0 ? "text-white/80" : "text-white/40"
                            }`}
                          >
                            {event.scoreImpact >= 0 ? "+" : ""}
                            {event.scoreImpact}
                          </TableCell>
                          <TableCell className="text-right">
                            <a
                              href={getStellarTxUrl(event.txHash)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-mono text-white/40 hover:text-white transition-colors"
                            >
                              {truncateWallet(event.txHash, 4)}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DappShell>
    </AuthGuard>
  )
}
