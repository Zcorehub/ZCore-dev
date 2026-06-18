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

export interface UserProfile {
  walletAddress: string
  score: number
  profileTier: string
  createdAt: string
  updatedAt: string
}

export interface CreditEventItem {
  eventId: string
  platform: string
  eventType: string
  amount: number
  currency: string
  scoreImpact: number
  txHash: string
  date: string
}

export interface CreditHistory {
  events: CreditEventItem[]
  totalPositive: number
  totalNegative: number
}

export type ProfileTier = "A" | "B" | "C" | "REJECTED"

export const TIER_LABELS: Record<ProfileTier, string> = {
  A: "Tier A — Excellent",
  B: "Tier B — Good",
  C: "Tier C — Fair",
  REJECTED: "Not eligible",
}

export const TIER_COLORS: Record<ProfileTier, string> = {
  A: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  B: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  C: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  REJECTED: "bg-red-500/15 text-red-600 border-red-500/30",
}

export const EVENT_TYPE_LABELS: Record<string, string> = {
  escrow_completed: "Escrow completed",
  loan_repaid: "Loan repaid",
  tanda_round_paid: "Tanda round paid",
  tanda_cycle_completed: "Tanda cycle completed",
}
