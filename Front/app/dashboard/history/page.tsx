"use client"

import { useEffect, useState } from "react"
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
import { apiClient } from "@/lib/api-client"
import { AuthService } from "@/lib/auth"
import { getStellarTxUrl, truncateWallet } from "@/lib/stellar"
import { EVENT_TYPE_LABELS, type CreditEventItem } from "@/lib/types"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExternalLink, Loader2, XCircle } from "lucide-react"

export default function HistoryPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [events, setEvents] = useState<CreditEventItem[]>([])
  const [totalPositive, setTotalPositive] = useState(0)
  const [totalNegative, setTotalNegative] = useState(0)

  useEffect(() => {
    const loadHistory = async () => {
      const wallet = AuthService.getWallet()
      if (!wallet) return

      setLoading(true)
      const { data, error: apiError } = await apiClient.getHistory(wallet)
      setLoading(false)

      if (apiError) {
        setError(apiError.message)
        return
      }

      if (data) {
        setEvents(data.events)
        setTotalPositive(data.totalPositive)
        setTotalNegative(data.totalNegative)
      }
    }

    loadHistory()
  }, [])

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

            <div className="grid grid-cols-2 gap-4 max-w-md">
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
                <CardTitle>Events</CardTitle>
                <CardDescription>Last 50 verified credit events</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-white/50" />
                  </div>
                ) : events.length === 0 ? (
                  <p className="text-xs text-white/40 py-8 text-center tracking-wide">
                    No events recorded yet.
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
