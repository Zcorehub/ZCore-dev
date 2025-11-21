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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ApiResponseCard } from "@/components/api-response-card"
import { apiClient } from "@/lib/api-client"
import { AuthService } from "@/lib/auth"

export default function PaymentsPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<boolean | null>(null)
  const [data, setData] = useState<unknown>(null)
  const [error, setError] = useState<{ message: string; statusCode?: number } | undefined>()

  const [formData, setFormData] = useState({
    userWallet: "",
    amount: "",
    status: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(null)
    setError(undefined)
    setData(null)

    const token = AuthService.getToken()

    const payload = {
      userWallet: formData.userWallet,
      amount: Number.parseFloat(formData.amount),
      status: formData.status,
      date: formData.date,
      notes: formData.notes,
    }

    const { data: responseData, error: apiError } = await apiClient.post(
      "/api/payment/report",
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

      // Reset form on success
      setFormData({
        userWallet: "",
        amount: "",
        status: "",
        date: new Date().toISOString().split("T")[0],
        notes: "",
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
              <h1 className="text-3xl font-bold mb-2">Payment & Default Reporting</h1>
              <p className="text-muted-foreground">
                Report payment confirmations or defaults to update user credit scores
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Report Payment Status</CardTitle>
                <CardDescription>
                  Submit payment confirmations or defaults to automatically adjust credit scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="userWallet">User Wallet Address</Label>
                    <Input
                      id="userWallet"
                      placeholder="0x..."
                      value={formData.userWallet}
                      onChange={(e) => setFormData({ ...formData, userWallet: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (USD)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Payment Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="default">Default</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Payment Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Additional information about this payment..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <Button type="submit" disabled={loading}>
                    Report Payment
                  </Button>
                </form>
              </CardContent>
            </Card>

            <ApiResponseCard
              title="Payment Report Result"
              description="Response from the payment reporting API"
              loading={loading}
              success={success}
              data={data}
              error={error}
              successMessage="Payment reported successfully - credit score updated"
            />

            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-base">Score Update Rules</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  • <strong>Successful Payment:</strong> +10 points to credit score
                </p>
                <p>
                  • <strong>Default:</strong> -30 points to credit score
                </p>
                <p>• Score updates are applied immediately and reflected in future evaluations</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
