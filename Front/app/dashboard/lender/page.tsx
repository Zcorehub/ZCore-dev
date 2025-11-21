"use client"

import type React from "react"

import { useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardNav } from "@/components/dashboard-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ApiResponseCard } from "@/components/api-response-card"
import { apiClient } from "@/lib/api-client"
import { AuthService } from "@/lib/auth"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface LenderProfile {
  id: string
  name: string
  amountMin: number
  amountMax: number
  rate: number
  description: string
  createdAt?: string
}

export default function LenderProfilesPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<boolean | null>(null)
  const [data, setData] = useState<unknown>(null)
  const [error, setError] = useState<{ message: string; statusCode?: number } | undefined>()
  const [profiles, setProfiles] = useState<LenderProfile[]>([])

  const [formData, setFormData] = useState({
    name: "",
    amountMin: "",
    amountMax: "",
    rate: "",
    description: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(null)
    setError(undefined)
    setData(null)

    const token = AuthService.getToken()

    const payload = {
      name: formData.name,
      amountMin: Number.parseFloat(formData.amountMin),
      amountMax: Number.parseFloat(formData.amountMax),
      rate: Number.parseFloat(formData.rate),
      description: formData.description,
    }

    const { data: responseData, error: apiError } = await apiClient.post(
      "/api/lender/profiles",
      payload,
      token || undefined,
    )

    setLoading(false)

    if (apiError) {
      setSuccess(false)
      setError(apiError)
    } else {
      setSuccess(true)
      setData(responseData)

      // Add to profiles list
      if (responseData && typeof responseData === "object" && "data" in responseData) {
        const newProfile = (responseData as { data: LenderProfile }).data
        setProfiles([...profiles, newProfile])
      }

      // Reset form
      setFormData({
        name: "",
        amountMin: "",
        amountMax: "",
        rate: "",
        description: "",
      })
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Lender Risk Profiles</h1>
              <p className="text-muted-foreground">Configure your lending criteria and risk parameters</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Create Risk Profile</CardTitle>
                <CardDescription>Define your risk appetite, amount ranges, and interest rates</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Profile Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Conservative, Aggressive"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="amountMin">Min Amount (USD)</Label>
                      <Input
                        id="amountMin"
                        type="number"
                        step="0.01"
                        value={formData.amountMin}
                        onChange={(e) => setFormData({ ...formData, amountMin: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amountMax">Max Amount (USD)</Label>
                      <Input
                        id="amountMax"
                        type="number"
                        step="0.01"
                        value={formData.amountMax}
                        onChange={(e) => setFormData({ ...formData, amountMax: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rate">Interest Rate (%)</Label>
                    <Input
                      id="rate"
                      type="number"
                      step="0.01"
                      value={formData.rate}
                      onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description / Notes</Label>
                    <Textarea
                      id="description"
                      placeholder="Add any additional details about this profile..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <Button type="submit" disabled={loading}>
                    Create Profile
                  </Button>
                </form>
              </CardContent>
            </Card>

            <ApiResponseCard
              title="Profile Creation Result"
              description="Response from the lender profiles API"
              loading={loading}
              success={success}
              data={data}
              error={error}
              successMessage="Lender profile created successfully"
            />

            {profiles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Risk Profiles</CardTitle>
                  <CardDescription>Profiles created in this session</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Amount Range</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profiles.map((profile) => (
                        <TableRow key={profile.id}>
                          <TableCell className="font-medium">{profile.name}</TableCell>
                          <TableCell>
                            ${profile.amountMin.toLocaleString()} - ${profile.amountMax.toLocaleString()}
                          </TableCell>
                          <TableCell>{profile.rate}%</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{profile.description || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
