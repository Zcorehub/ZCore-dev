import type { ApiError, ApiResponse, CreditHistory, UserProfile } from "./types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"

class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = API_BASE_URL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data?: T; error?: ApiError }> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      })

      const body = (await response.json()) as ApiResponse<T>

      if (!response.ok) {
        return {
          error: {
            message: body.error || body.message || "An error occurred",
            statusCode: response.status,
            error: body.error,
          },
        }
      }

      return { data: body.data }
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : "Network error",
          statusCode: 0,
        },
      }
    }
  }

  register(walletAddress: string) {
    return this.request<{ score: number }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ walletAddress }),
    })
  }

  login(walletAddress: string) {
    return this.request<{ score: number }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ walletAddress }),
    })
  }

  getProfile(wallet: string) {
    return this.request<UserProfile>(`/api/user/${wallet}/profile`)
  }

  getHistory(wallet: string) {
    return this.request<CreditHistory>(`/api/user/${wallet}/history`)
  }
}

export const apiClient = new ApiClient()
