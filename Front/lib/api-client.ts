"use server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ApiError {
  message: string
  statusCode: number
  error?: string
}

class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = API_BASE_URL
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<{ data?: T; error?: ApiError }> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          error: {
            message: data.error || data.message || "An error occurred",
            statusCode: response.status,
            error: data.error,
          },
        }
      }

      return { data }
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : "Network error",
          statusCode: 0,
        },
      }
    }
  }

  async get<T>(endpoint: string, token?: string) {
    return this.request<T>(endpoint, {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
  }

  async post<T>(endpoint: string, body: unknown, token?: string) {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
  }
}

export const apiClient = new ApiClient()
