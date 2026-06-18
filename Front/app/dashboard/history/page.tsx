"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardNav } from "@/components/dashboard-nav"
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
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Credit History</h1>
              <p className="text-muted-foreground">
                Full audit trail of verified on-chain events that contribute to your score
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4 max-w-md">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total gained</CardDescription>
                  <CardTitle className="text-2xl text-emerald-600">+{totalPositive}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total lost</CardDescription>
                  <CardTitle className="text-2xl text-red-600">{totalNegative}</CardTitle>
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
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : events.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    No events recorded yet.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Platform</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Impact</TableHead>
                        <TableHead className="text-right">Tx</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {events.map((event) => (
                        <TableRow key={event.eventId}>
                          <TableCell className="text-muted-foreground">{event.date}</TableCell>
                          <TableCell>{event.platform}</TableCell>
                          <TableCell>
                            {EVENT_TYPE_LABELS[event.eventType] ?? event.eventType}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {event.amount} {event.currency}
                          </TableCell>
                          <TableCell
                            className={`text-right font-medium tabular-nums ${
                              event.scoreImpact >= 0 ? "text-emerald-600" : "text-red-600"
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
                              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
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
      </div>
    </AuthGuard>
  )
}
