export interface StellarWalletData {
  walletAge: number;
  totalTransactions: number;
  successfulTransactions: number;
  averageBalance: number;
  accountAge: number;
  operationsCount: number;
  trustlineCount: number;
  isValid: boolean;
  firstTransactionDate: string | null;
  [key: string]: number | boolean | string | null;
}

export interface LenderProfile {
  tier: "A" | "B" | "C";
  minScore: number;
  maxAmount: number;
  interestRate: number;
}

export interface RegisterRequest {
  walletAddress: string;
}

export interface LoginRequest {
  walletAddress: string;
}

export interface ScoringRequest {
  walletAddress: string;
  lenderId: string;
  requestedAmount: number;
}

export interface PaymentReport {
  apiKey: string;
  walletAddress: string;
  amount: number;
  status: "paid" | "defaulted";
  paymentDate: string;
  requestId?: string;
}

export interface ProfileDefinition {
  apiKey: string;
  profiles: LenderProfile[];
}

export type CreditEventType =
  | "escrow_completed"
  | "loan_repaid"
  | "tanda_round_paid"
  | "tanda_cycle_completed";

export interface CreditEventPayload {
  apiKey: string;
  eventType: CreditEventType;
  walletAddress: string;
  amount: number;
  currency?: string;
  txHash: string;
  counterpartyWallet?: string;
  timestamp: string;
}

export interface PlatformRegisterPayload {
  adminKey: string;
  platformId: string;
  name: string;
  webhookUrl?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
