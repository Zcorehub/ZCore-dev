"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

interface ApiResponseCardProps {
  title: string
  description?: string
  loading: boolean
  success: boolean | null
  data?: unknown
  error?: { message: string; statusCode?: number }
  successMessage?: string
}

export function ApiResponseCard({
  title,
  description,
  loading,
  success,
  data,
  error,
  successMessage,
}: ApiResponseCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Processing...</span>
          </div>
        )}

        {success && (
          <Alert className="border-green-500/50 bg-green-500/10">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-500">{successMessage || "Request successful"}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium">{error.message}</div>
              {error.statusCode && <div className="text-sm mt-1">Status: {error.statusCode}</div>}
            </AlertDescription>
          </Alert>
        )}

        {data && success && (
          <div className="rounded-lg bg-muted p-4">
            <div className="text-xs font-medium mb-2 text-muted-foreground">Response Data:</div>
            <pre className="text-xs overflow-auto max-h-96 font-mono">{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
