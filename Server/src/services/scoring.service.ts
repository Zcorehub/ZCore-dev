import { QuestionnaireData } from "../types";
import {
  fetchStellarWalletData,
  calculateStellarScore,
  StellarWalletData,
} from "./stellar.service";

const SCORE_MIN = 300;
const SCORE_MAX = 850;

// Función original para backward compatibility
export const calculateInitialScore = (questionnaire: QuestionnaireData) => {
  const {
    walletAge = 0,
    averageBalance = 0,
    transactionCount = 0,
    defiInteractions = 0,
    monthlyIncome = 0,
  } = questionnaire;

  const normalized =
    walletAge * 0.2 +
    averageBalance * 0.0001 +
    transactionCount * 0.1 +
    defiInteractions * 5 +
    monthlyIncome * 0.0005;

  const rawScore = SCORE_MIN + normalized;
  const bounded = Math.min(
    Math.max(Math.round(rawScore), SCORE_MIN),
    SCORE_MAX
  );
  return bounded;
};

// Nueva función que combina cuestionario + datos de Stellar
export const calculateEnhancedScore = async (
  questionnaire: QuestionnaireData,
  walletAddress: string
): Promise<{
  score: number;
  stellarData: StellarWalletData;
  breakdown: {
    questionnaireScore: number;
    stellarScore: number;
    finalScore: number;
  };
}> => {
  try {
    // 1. Calcular score del cuestionario (peso 40%)
    const questionnaireScore = calculateInitialScore(questionnaire);

    // 2. Obtener y calcular score de Stellar (peso 60%)
    const stellarData = await fetchStellarWalletData(walletAddress);
    const stellarScore = calculateStellarScore(stellarData);

    // 3. Combinar scores con pesos
    const combinedScore = stellarData.isValid
      ? questionnaireScore * 0.4 + stellarScore * 0.6
      : questionnaireScore; // Si Stellar falla, usar solo cuestionario

    // 4. Normalizar al rango 300-850
    const normalizedScore =
      SCORE_MIN + (combinedScore / 380) * (SCORE_MAX - SCORE_MIN);
    const finalScore = Math.min(
      Math.max(Math.round(normalizedScore), SCORE_MIN),
      SCORE_MAX
    );

    return {
      score: finalScore,
      stellarData,
      breakdown: {
        questionnaireScore: Math.round(questionnaireScore),
        stellarScore: Math.round(stellarScore),
        finalScore,
      },
    };
  } catch (error) {
    console.error("Error calculating enhanced score:", error);

    // Fallback al score original si hay error
    const fallbackScore = calculateInitialScore(questionnaire);
    return {
      score: fallbackScore,
      stellarData: {
        walletAge: 0,
        totalTransactions: 0,
        successfulTransactions: 0,
        averageBalance: 0,
        accountAge: 0,
        operationsCount: 0,
        trustlineCount: 0,
        isValid: false,
        firstTransactionDate: null,
      },
      breakdown: {
        questionnaireScore: fallbackScore,
        stellarScore: 0,
        finalScore: fallbackScore,
      },
    };
  }
};

export const assignProfileTier = (score: number) => {
  if (score >= 750) return "A";
  if (score >= 650) return "B";
  return "C";
};

export const updateScoreFromPayment = (
  score: number,
  status: "paid" | "defaulted"
) => {
  const delta = status === "paid" ? 10 : -30;
  const updatedScore = Math.min(Math.max(score + delta, SCORE_MIN), SCORE_MAX);
  return {
    score: updatedScore,
    profileTier: assignProfileTier(updatedScore),
  };
};
