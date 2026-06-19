import { PAYMENT_SCORE_DELTA, SCORE_MAX } from "../constants/scoring.constants";
import { assignProfileTier } from "./scoring.service";

type ScoreInput = {
  stellarBase: number;
  creditEvents: Array<{ scoreImpact: number }>;
  payments?: Array<{ status: string }>;
};

export type RecalculatedScore = {
  score: number;
  profileTier: "A" | "B" | "C" | "REJECTED";
};

export const recalculateScoreFromInputs = ({
  stellarBase,
  creditEvents,
  payments = [],
}: ScoreInput): RecalculatedScore => {
  const eventImpact = creditEvents.reduce(
    (total, event) => total + event.scoreImpact,
    0
  );
  const paymentImpact = payments.reduce((total, payment) => {
    if (payment.status === "paid") return total + PAYMENT_SCORE_DELTA.paid;
    if (payment.status === "defaulted") {
      return total + PAYMENT_SCORE_DELTA.defaulted;
    }
    return total;
  }, 0);
  const score = Math.min(
    Math.max(stellarBase + eventImpact + paymentImpact, 0),
    SCORE_MAX
  );

  return {
    score,
    profileTier: assignProfileTier(score),
  };
};