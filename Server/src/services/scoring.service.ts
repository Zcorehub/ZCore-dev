import {
  COUNTERPARTY_DECAY_TABLE,
  EVENT_WEIGHTS,
  PAYMENT_SCORE_DELTA,
  PROFILE_TIER_THRESHOLDS,
  SCORE_MAX,
  STELLAR_BASE_MAX,
} from "../constants/scoring.constants";
import {
  fetchStellarWalletData,
  StellarWalletData,
} from "./stellar.service";
import { CreditEventType } from "../types";

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
  const idx = Math.min(interactionCount - 1, COUNTERPARTY_DECAY_TABLE.length - 1);
  return COUNTERPARTY_DECAY_TABLE[idx] ?? 0.1;
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
  if (score >= PROFILE_TIER_THRESHOLDS.A) return "A";
  if (score >= PROFILE_TIER_THRESHOLDS.B) return "B";
  if (score >= PROFILE_TIER_THRESHOLDS.C) return "C";
  return "REJECTED";
};

export const updateScoreFromPayment = (
  score: number,
  status: "paid" | "defaulted"
) => {
  const delta = PAYMENT_SCORE_DELTA[status];
  const updatedScore = Math.min(Math.max(score + delta, 0), SCORE_MAX);
  return {
    score: updatedScore,
    profileTier: assignProfileTier(updatedScore),
  };
};
