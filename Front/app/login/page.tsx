"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiClient } from "@/lib/api-client"
import { AuthService } from "@/lib/auth"
import { isValidStellarWallet } from "@/lib/stellar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { XCircle, Loader2, ArrowLeft } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [walletAddress, setWalletAddress] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const trimmed = walletAddress.trim()
    if (!isValidStellarWallet(trimmed)) {
      setLoading(false)
      setError("Enter a valid Stellar wallet address (56 characters, starts with G)")
      return
    }

    const { data, error: apiError } = await apiClient.login(trimmed)

    setLoading(false)

    if (apiError) {
      if (apiError.statusCode === 404) {
        setError("Wallet not registered. Create an account first.")
      } else {
        setError(apiError.message)
      }
      return
    }

    if (data) {
      AuthService.setSession({ walletAddress: trimmed, score: data.score })
      router.push("/dashboard")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Connect your wallet</CardTitle>
            <CardDescription>
              Sign in with your Stellar wallet to view your credit score and history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="walletAddress">Stellar Wallet Address</Label>
                <Input
                  id="walletAddress"
                  required
                  placeholder="GAYR3..."
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  56-character public key starting with G
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                New to ZCore?{" "}
                <Link href="/register" className="text-primary hover:underline">
                  Register your wallet
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
