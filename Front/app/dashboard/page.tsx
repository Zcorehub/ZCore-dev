"use client"

import { useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardNav } from "@/components/dashboard-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ApiResponseCard } from "@/components/api-response-card"
import { apiClient } from "@/lib/api-client"
import { AuthService } from "@/lib/auth"

export default function DashboardPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<boolean | null>(null)
  const [data, setData] = useState<unknown>(null)
  const [error, setError] = useState<{ message: string; statusCode?: number } | undefined>()
  const [additionalData, setAdditionalData] = useState("")

  const handleRequestScoring = async () => {
    setLoading(true)
    setSuccess(null)
    setError(undefined)
    setData(null)

    const token = AuthService.getToken()
    const payload = additionalData ? { additionalData } : {}

    const { data: responseData, error: apiError } = await apiClient.post(
      "/api/user/request",
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
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Request Credit Scoring</h1>
              <p className="text-muted-foreground">
                Evaluate your creditworthiness and get personalized risk assessment
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Score Evaluation Request</CardTitle>
                <CardDescription>
                  Trigger a scoring evaluation for your profile. This will analyze your wallet activity and
                  questionnaire data.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="additionalData">Additional Data (Optional)</Label>
                  <Textarea
                    id="additionalData"
                    placeholder="Any additional information you'd like to include..."
                    value={additionalData}
                    onChange={(e) => setAdditionalData(e.target.value)}
                    rows={4}
                  />
                </div>
                <Button onClick={handleRequestScoring} disabled={loading}>
                  Request Scoring Evaluation
                </Button>
              </CardContent>
            </Card>

            <ApiResponseCard
              title="Evaluation Results"
              description="Your credit score and risk assessment details"
              loading={loading}
              success={success}
              data={data}
              error={error}
              successMessage="Scoring evaluation completed successfully"
            />
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
