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

// Nueva función que calcula score únicamente desde Stellar (máximo 350 puntos)
export const calculateStellarOnlyScore = async (
  walletAddress: string
): Promise<{
  score: number;
  stellarData: StellarWalletData;
}> => {
  try {
    // 1. Obtener datos de Stellar
    const stellarData = await fetchStellarWalletData(walletAddress);

    // 2. Si la wallet no es válida, no proceder
    if (!stellarData.isValid) {
      return {
        score: 0,
        stellarData,
      };
    }

    // 3. Calcular score optimizado para 350 puntos máximo
    const stellarScore = calculateOptimizedStellarScore(stellarData);

    return {
      score: stellarScore,
      stellarData,
    };
  } catch (error) {
    console.error("Error calculating Stellar-only score:", error);
    throw new Error("Unable to validate Stellar wallet");
  }
};

// Función optimizada para scoring solo con Stellar (máximo 350 puntos)
const calculateOptimizedStellarScore = (
  stellarData: StellarWalletData
): number => {
  if (!stellarData.isValid) {
    return 0;
  }

  let score = 0;

  // 1. Edad de wallet (máximo 80 puntos)
  // Wallets más antiguas son más confiables
  const ageScore = Math.min((stellarData.walletAge / 365) * 40, 80); // 40 puntos por año, máx 80
  score += ageScore;

  // 2. Actividad transaccional (máximo 70 puntos)
  const txScore = Math.min(stellarData.totalTransactions * 0.4, 70);
  score += txScore;

  // 3. Tasa de éxito (máximo 50 puntos)
  const successRate =
    stellarData.totalTransactions > 0
      ? stellarData.successfulTransactions / stellarData.totalTransactions
      : 0;
  const successScore = successRate * 50;
  score += successScore;

  // 4. Balance XLM (máximo 60 puntos)
  // Usar log para evitar que balances muy altos dominen
  const balanceScore = Math.min(
    Math.log10(stellarData.averageBalance + 1) * 15,
    60
  );
  score += balanceScore;

  // 5. Diversidad de activos / DeFi usage (máximo 50 puntos)
  const trustlineScore = Math.min(stellarData.trustlineCount * 10, 50);
  score += trustlineScore;

  // 6. Actividad de operaciones (máximo 40 puntos)
  const opsScore = Math.min(stellarData.operationsCount * 0.25, 40);
  score += opsScore;

  return Math.round(score);
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
