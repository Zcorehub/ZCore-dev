"use client"

import type React from "react"

import { useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardNav } from "@/components/dashboard-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ApiResponseCard } from "@/components/api-response-card"
import { apiClient } from "@/lib/api-client"
import { AuthService } from "@/lib/auth"

export default function SearchProfilePage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<boolean | null>(null)
  const [data, setData] = useState<unknown>(null)
  const [error, setError] = useState<{ message: string; statusCode?: number } | undefined>()
  const [walletAddress, setWalletAddress] = useState("")

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!walletAddress.trim()) {
      setError({ message: "Please enter a wallet address" })
      return
    }

    setLoading(true)
    setSuccess(null)
    setError(undefined)
    setData(null)

    const token = AuthService.getToken()

    const { data: responseData, error: apiError } = await apiClient.get(
      `/api/user/${walletAddress}/profile`,
      token || undefined,
    )

    setLoading(false)

    if (apiError) {
      setSuccess(false)
      setError(apiError)
    } else {
      setSuccess(true)
      setData(responseData)
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Search User Profile</h1>
              <p className="text-muted-foreground">Look up credit profiles and scoring information by wallet address</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Profile Lookup</CardTitle>
                <CardDescription>Enter a wallet address to retrieve the associated credit profile</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="wallet">Wallet Address</Label>
                    <Input
                      id="wallet"
                      placeholder="0x..."
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={loading}>
                    Search Profile
                  </Button>
                </form>
              </CardContent>
            </Card>

            <ApiResponseCard
              title="Profile Results"
              description="Credit profile information for the searched wallet"
              loading={loading}
              success={success}
              data={data}
              error={error}
              successMessage="Profile retrieved successfully"
            />
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
