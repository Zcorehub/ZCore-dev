export interface QuestionnaireData {
  walletAge?: number;
  averageBalance?: number;
  transactionCount?: number;
  defiInteractions?: number;
  monthlyIncome?: number;
  loanPurpose?: string;
  [key: string]: number | string | undefined | object;
}

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

export interface ScoringBreakdown {
  questionnaireScore: number;
  stellarScore: number;
  finalScore: number;
  [key: string]: number;
}

export interface LenderProfile {
  tier: "A" | "B" | "C";
  minScore: number;
  maxAmount: number;
  interestRate: number;
}

export interface RegisterRequest {
  walletAddress: string;
  questionnaire: QuestionnaireData;
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

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
