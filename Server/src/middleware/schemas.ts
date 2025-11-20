import { z } from "zod";

export const RegisterSchema = z.object({
  walletAddress: z.string().min(10, "Invalid wallet address"),
  questionnaire: z.object({
    walletAge: z.number().optional(),
    averageBalance: z.number().optional(),
    transactionCount: z.number().optional(),
    defiInteractions: z.number().optional(),
    monthlyIncome: z.number().optional(),
    loanPurpose: z.string().optional(),
  }),
});

export const LoginSchema = z.object({
  walletAddress: z.string().min(10, "Invalid wallet address"),
});

export const ScoringRequestSchema = z.object({
  walletAddress: z.string().min(10, "Invalid wallet address"),
  lenderId: z.string().uuid("Invalid lender ID"),
  requestedAmount: z.number().positive("Amount must be positive"),
});

export const PaymentReportSchema = z.object({
  apiKey: z.string().min(10, "Invalid API key"),
  walletAddress: z.string().min(10, "Invalid wallet address"),
  amount: z.number().positive("Amount must be positive"),
  status: z.enum(["paid", "defaulted"]),
  paymentDate: z.string().datetime(),
  requestId: z.string().uuid().optional(),
});

export const ProfileDefinitionSchema = z.object({
  apiKey: z.string().min(10, "Invalid API key"),
  profiles: z.array(
    z.object({
      tier: z.enum(["A", "B", "C"]),
      minScore: z.number().min(300).max(850),
      maxAmount: z.number().positive(),
      interestRate: z.number().min(0).max(100),
    })
  ),
});

export const WalletParamSchema = z.object({
  wallet: z.string().min(10, "Invalid wallet address"),
});
