import { QuestionnaireData } from "../types";

const SCORE_MIN = 300;
const SCORE_MAX = 850;

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
