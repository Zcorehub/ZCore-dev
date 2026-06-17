import {
  fetchStellarWalletData,
  StellarWalletData,
} from "./stellar.service";
import { CreditEventType } from "../types";

const SCORE_MAX = 850;
const STELLAR_BASE_MAX = 150;

const EVENT_WEIGHTS: Record<
  CreditEventType,
  { base: number; perUSDC: number; maxPerEvent: number }
> = {
  escrow_completed: { base: 15, perUSDC: 0.005, maxPerEvent: 60 },
  loan_repaid: { base: 20, perUSDC: 0.008, maxPerEvent: 80 },
  tanda_round_paid: { base: 10, perUSDC: 0.003, maxPerEvent: 30 },
  tanda_cycle_completed: { base: 40, perUSDC: 0.01, maxPerEvent: 100 },
};

const calculateStellarBaseScore = (stellarData: StellarWalletData): number => {
  if (!stellarData.isValid) return 0;

  // Wallet age: max 40 pts (full at 2+ years)
  const ageScore = Math.min((stellarData.walletAge / 730) * 40, 40);

  // Transaction activity: max 60 pts
  const txScore = Math.min(stellarData.totalTransactions * 0.3, 60);

  // Success rate: max 30 pts
  const successRate =
    stellarData.totalTransactions > 0
      ? stellarData.successfulTransactions / stellarData.totalTransactions
      : 0;
  const successScore = successRate * 30;

  // XLM balance: max 20 pts (log scale to avoid whale dominance)
  const balanceScore = Math.min(
    Math.log10(stellarData.averageBalance + 1) * 8,
    20
  );

  return Math.min(
    Math.round(ageScore + txScore + successScore + balanceScore),
    STELLAR_BASE_MAX
  );
};

export const calculateStellarBase = async (
  walletAddress: string
): Promise<{ score: number; stellarData: StellarWalletData }> => {
  const stellarData = await fetchStellarWalletData(walletAddress);

  if (!stellarData.isValid) {
    return { score: 0, stellarData };
  }

  return {
    score: calculateStellarBaseScore(stellarData),
    stellarData,
  };
};

// Decay factor for repeated interactions with same counterparty (anti-Sybil)
export const applyCounterpartyDecay = (interactionCount: number): number => {
  const decayTable = [1.0, 0.7, 0.4, 0.1];
  const idx = Math.min(interactionCount - 1, decayTable.length - 1);
  return decayTable[idx] ?? 0.1;
};

export const calculateEventImpact = (
  eventType: CreditEventType,
  amount: number,
  counterpartyDecayFactor: number
): number => {
  const weights = EVENT_WEIGHTS[eventType];
  if (!weights) return 0;

  const raw = weights.base + amount * weights.perUSDC;
  const capped = Math.min(raw, weights.maxPerEvent);
  return Math.max(0, Math.round(capped * counterpartyDecayFactor));
};

export const assignProfileTier = (
  score: number
): "A" | "B" | "C" | "REJECTED" => {
  if (score >= 600) return "A";
  if (score >= 350) return "B";
  if (score >= 100) return "C";
  return "REJECTED";
};

export const updateScoreFromPayment = (
  score: number,
  status: "paid" | "defaulted"
) => {
  const delta = status === "paid" ? 10 : -30;
  const updatedScore = Math.min(Math.max(score + delta, 0), SCORE_MAX);
  return {
    score: updatedScore,
    profileTier: assignProfileTier(updatedScore),
  };
};
