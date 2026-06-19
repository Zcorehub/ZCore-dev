"use client"

import { FormEvent, useCallback, useEffect, useState } from "react"
import { DappShell } from "@/components/dapp-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  adminClient,
  type AdminEvent,
  type AdminLender,
  type AdminPlatform,
} from "@/lib/admin-client"
import { Loader2, ShieldCheck, XCircle } from "lucide-react"

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [adminKeyInput, setAdminKeyInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [platforms, setPlatforms] = useState<AdminPlatform[]>([])
  const [lenders, setLenders] = useState<AdminLender[]>([])
  const [events, setEvents] = useState<AdminEvent[]>([])
  const [healthOk, setHealthOk] = useState<boolean | null>(null)
  const [registerForm, setRegisterForm] = useState({
    platformId: "",
    name: "",
    webhookUrl: "",
  })
  const [lastRegisteredKey, setLastRegisteredKey] = useState<string | null>(null)

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError(null)

    const [platformsRes, lendersRes, eventsRes, health] = await Promise.all([
      adminClient.listPlatforms(),
      adminClient.listLenders(),
      adminClient.listRecentEvents(50, 0),
      adminClient.getHealthReady(),
    ])

    setLoading(false)
    setHealthOk(health.ok)

    if (platformsRes.error || lendersRes.error || eventsRes.error) {
      setError(platformsRes.error ?? lendersRes.error ?? eventsRes.error ?? "Failed to load")
      if (platformsRes.statusCode === 403) {
        adminClient.clearAdminKey()
        setAuthenticated(false)
      }
      return
    }

    setPlatforms(platformsRes.data?.platforms ?? [])
    setLenders(lendersRes.data?.lenders ?? [])
    setEvents(eventsRes.data?.events ?? [])
  }, [])

  useEffect(() => {
    if (adminClient.isAuthenticated()) {
      setAuthenticated(true)
      loadDashboard()
    }
  }, [loadDashboard])

  const handleLogin = (event: FormEvent) => {
    event.preventDefault()
    adminClient.setAdminKey(adminKeyInput.trim())
    setAuthenticated(true)
    loadDashboard()
  }

  const handleRegisterPlatform = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setLastRegisteredKey(null)

    const result = await adminClient.registerPlatform({
      platformId: registerForm.platformId.trim(),
      name: registerForm.name.trim(),
      webhookUrl: registerForm.webhookUrl.trim() || undefined,
    })

    if (result.error) {
      setError(result.error)
      return
    }

    setLastRegisteredKey(result.data?.apiKey ?? null)
    setRegisterForm({ platformId: "", name: "", webhookUrl: "" })
    loadDashboard()
  }

  if (!authenticated) {
    return (
      <DappShell withGrid={false}>
        <div className="min-h-screen flex items-center justify-center px-4">
          <Card className="w-full max-w-md border-white/10 bg-black/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                ZCore Admin
              </CardTitle>
              <CardDescription>
                Enter the operator admin key. This page is not linked in public navigation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  type="password"
                  placeholder="ADMIN_SECRET"
                  value={adminKeyInput}
                  onChange={(event) => setAdminKeyInput(event.target.value)}
                  className="bg-black border-white/10"
                />
                <Button type="submit" className="w-full">
                  Continue
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </DappShell>
    )
  }

  return (
    <DappShell>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div>
          <p className="section-label mb-2">Operator</p>
          <h1 className="page-title mb-2">Admin Dashboard</h1>
          <p className="page-subtitle">
            Manage platforms, lenders, and monitor recent credit events.
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="border-red-500/30 bg-red-500/10">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Health</CardTitle>
            <CardDescription>API readiness check</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-white/70">
              /health/ready:{" "}
              {healthOk === null ? "checking..." : healthOk ? "OK" : "Unavailable"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Register platform</CardTitle>
            <CardDescription>Create a partner platform and issue an API key</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegisterPlatform} className="grid gap-3 md:grid-cols-3">
              <Input
                placeholder="platform-id"
                value={registerForm.platformId}
                onChange={(event) =>
                  setRegisterForm((prev) => ({ ...prev, platformId: event.target.value }))
                }
                className="bg-black border-white/10"
              />
              <Input
                placeholder="Platform name"
                value={registerForm.name}
                onChange={(event) =>
                  setRegisterForm((prev) => ({ ...prev, name: event.target.value }))
                }
                className="bg-black border-white/10"
              />
              <Input
                placeholder="Webhook URL (optional)"
                value={registerForm.webhookUrl}
                onChange={(event) =>
                  setRegisterForm((prev) => ({ ...prev, webhookUrl: event.target.value }))
                }
                className="bg-black border-white/10"
              />
              <Button type="submit" className="md:col-span-3 w-full md:w-auto">
                Register platform
              </Button>
            </form>
            {lastRegisteredKey && (
              <p className="mt-3 text-xs font-mono text-white/60 break-all">
                New API key: {lastRegisteredKey}
              </p>
            )}
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-white/50" />
          </div>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Platforms ({platforms.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/[0.06] hover:bg-transparent">
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>API Key</TableHead>
                      <TableHead>Active</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {platforms.map((platform) => (
                      <TableRow key={platform.id} className="border-white/[0.06]">
                        <TableCell className="text-xs">{platform.id}</TableCell>
                        <TableCell className="text-xs">{platform.name}</TableCell>
                        <TableCell className="text-xs font-mono break-all">{platform.apiKey}</TableCell>
                        <TableCell className="text-xs">{platform.active ? "yes" : "no"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lenders ({lenders.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/[0.06] hover:bg-transparent">
                      <TableHead>Name</TableHead>
                      <TableHead>API Key</TableHead>
                      <TableHead>Profiles</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lenders.map((lender) => (
                      <TableRow key={lender.id} className="border-white/[0.06]">
                        <TableCell className="text-xs">{lender.name}</TableCell>
                        <TableCell className="text-xs font-mono break-all">{lender.apiKey}</TableCell>
                        <TableCell className="text-xs">
                          {Array.isArray(lender.profiles) ? lender.profiles.length : 0}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent events ({events.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/[0.06] hover:bg-transparent">
                      <TableHead>Date</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Wallet</TableHead>
                      <TableHead>Impact</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow key={event.id} className="border-white/[0.06]">
                        <TableCell className="text-xs text-white/50">
                          {event.createdAt.split("T")[0]}
                        </TableCell>
                        <TableCell className="text-xs">{event.platformName}</TableCell>
                        <TableCell className="text-xs font-mono">
                          {event.walletAddress.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="text-xs tabular-nums">
                          {event.scoreImpact >= 0 ? "+" : ""}
                          {event.scoreImpact}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DappShell>
  )
}
