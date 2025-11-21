"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiClient } from "@/lib/api-client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, Loader2, ArrowLeft } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    walletAddress: "",
    fullName: "",
    monthlyIncome: "",
    occupation: "",
    cryptoExperience: "",
    riskTolerance: "",
    country: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const { data, error: apiError } = await apiClient.post("/api/auth/register", {
      email: formData.email,
      password: formData.password,
      walletAddress: formData.walletAddress,
      fullName: formData.fullName,
      questionnaire: {
        monthlyIncome: Number.parseInt(formData.monthlyIncome) || 0,
        occupation: formData.occupation,
        cryptoExperience: formData.cryptoExperience,
        riskTolerance: formData.riskTolerance,
        country: formData.country,
      },
    })

    setLoading(false)

    if (apiError) {
      setError(apiError.message)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
            <CardTitle className="text-center">Registration Successful!</CardTitle>
            <CardDescription className="text-center">
              Your account has been created. You can now log in to access the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button className="w-full">Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Create Your ZCore Account</CardTitle>
            <CardDescription>Answer a few questions to get started with your credit profile</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-semibold">Account Details</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="walletAddress">Wallet Address *</Label>
                  <Input
                    id="walletAddress"
                    required
                    placeholder="0x..."
                    value={formData.walletAddress}
                    onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                  />
                </div>
              </div>

              {/* Questionnaire */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold">Financial Profile</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="monthlyIncome">Monthly Income (USD) *</Label>
                    <Input
                      id="monthlyIncome"
                      type="number"
                      required
                      min="0"
                      value={formData.monthlyIncome}
                      onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation *</Label>
                    <Input
                      id="occupation"
                      required
                      value={formData.occupation}
                      onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="cryptoExperience">Crypto Experience *</Label>
                    <Select
                      value={formData.cryptoExperience}
                      onValueChange={(value) => setFormData({ ...formData, cryptoExperience: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="riskTolerance">Risk Tolerance *</Label>
                    <Select
                      value={formData.riskTolerance}
                      onValueChange={(value) => setFormData({ ...formData, riskTolerance: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select tolerance" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    required
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                </div>
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
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Log in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
