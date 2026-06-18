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
  A: "border-white/30 bg-white/10 text-white",
  B: "border-white/20 bg-white/[0.06] text-white/80",
  C: "border-white/15 bg-white/[0.04] text-white/60",
  REJECTED: "border-white/10 bg-white/[0.02] text-white/40",
}

export const EVENT_TYPE_LABELS: Record<string, string> = {
  escrow_completed: "Escrow completed",
  loan_repaid: "Loan repaid",
  tanda_round_paid: "Tanda round paid",
  tanda_cycle_completed: "Tanda cycle completed",
}
