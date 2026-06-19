export const SCORE_MAX = 850;
export const STELLAR_BASE_MAX = 150;

export const PROFILE_TIER_THRESHOLDS = {
  A: 600,
  B: 350,
  C: 100,
} as const;

export const PAYMENT_SCORE_DELTA = {
  paid: 10,
  defaulted: -30,
} as const;

export const COUNTERPARTY_DECAY_TABLE = [1.0, 0.7, 0.4, 0.1] as const;

export const EVENT_WEIGHTS = {
  escrow_completed: { base: 15, perUSDC: 0.005, maxPerEvent: 60 },
  loan_repaid: { base: 20, perUSDC: 0.008, maxPerEvent: 80 },
  tanda_round_paid: { base: 10, perUSDC: 0.003, maxPerEvent: 30 },
  tanda_cycle_completed: { base: 40, perUSDC: 0.01, maxPerEvent: 100 },
} as const;
