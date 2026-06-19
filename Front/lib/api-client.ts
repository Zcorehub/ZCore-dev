import type {
  ApiError,
  ApiResponse,
  CreditHistory,
  ScoreHistory,
  UserProfile,
} from "./types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"

function formatErrorMessage(value: unknown, fallback = "An error occurred"): string {
  if (typeof value === "string") return value
  if (value instanceof Error) return value.message
  if (Array.isArray(value)) return value.map((item) => formatErrorMessage(item)).join(", ")
  if (value && typeof value === "object" && "message" in value) {
    return formatErrorMessage((value as { message: unknown }).message, fallback)
  }
  return fallback
}

export interface SignedAuthPayload {
  walletAddress: string
  message: string
  signature: string
}

export interface ContractConfig {
  enabled: boolean
  contractId?: string
  network?: string
  rpcUrl?: string
}

export interface OnChainScore {
  walletAddress: string
  score: number
  tier: string
  tierCode: number
  updatedAt: number
  validUntil?: number | null
  source: string
}

export interface ScoreBreakdown {
  walletAddress: string
  score: number
  tier: string
  breakdown: {
    stellarBase: number
    eventsScore: number
    totalEvents: number
    platforms: string[]
  }
  lastUpdated: string
}

class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = API_BASE_URL
  }

  private getAuthHeaders(): Record<string, string> {
    if (typeof window === "undefined") return {}
    const token = sessionStorage.getItem("zcore_token")
    return token ? { Authorization: `Bearer ${token}` } : {}
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
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      })

      const body = (await response.json()) as ApiResponse<T>

      if (!response.ok) {
        return {
          error: {
            message: formatErrorMessage(body.error ?? body.message),
            statusCode: response.status,
            error: typeof body.error === "string" ? body.error : undefined,
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

  requestChallenge(walletAddress: string) {
    return this.request<{ message: string; expiresAt: number }>("/api/auth/challenge", {
      method: "POST",
      body: JSON.stringify({ walletAddress }),
    })
  }

  registerSigned(payload: SignedAuthPayload) {
    return this.request<{ score: number; token: string }>("/api/auth/register/signed", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  }

  loginSigned(payload: SignedAuthPayload) {
    return this.request<{ score: number; token: string }>("/api/auth/login/signed", {
      method: "POST",
      body: JSON.stringify(payload),
    })
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

  getScoreBreakdown(wallet: string) {
    return this.request<ScoreBreakdown>(`/api/user/${wallet}/breakdown`)
  }

  getHistory(wallet: string, params: { limit?: number; offset?: number } = {}) {
    const query = new URLSearchParams()
    if (params.limit !== undefined) query.set("limit", String(params.limit))
    if (params.offset !== undefined) query.set("offset", String(params.offset))
    const suffix = query.size > 0 ? `?${query.toString()}` : ""
    return this.request<CreditHistory>(`/api/user/${wallet}/history${suffix}`)
  }

  getScoreHistory(wallet: string, params: { limit?: number; offset?: number } = {}) {
    const query = new URLSearchParams()
    if (params.limit !== undefined) query.set("limit", String(params.limit))
    if (params.offset !== undefined) query.set("offset", String(params.offset))
    const suffix = query.size > 0 ? `?${query.toString()}` : ""
    return this.request<ScoreHistory>(
      `/api/user/${wallet}/score-history${suffix}`
    )
  }

  getContractConfig() {
    return this.request<ContractConfig>("/api/contracts/config")
  }

  getOnChainScore(wallet: string) {
    return this.request<OnChainScore>(`/api/user/${wallet}/on-chain`)
  }

  attestOnChain(wallet: string, payload: SignedAuthPayload) {
    return this.request<{ txHash: string; score: number; tier: string }>(
      `/api/user/${wallet}/attest`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    )
  }
}

export const apiClient = new ApiClient()
