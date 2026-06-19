export type ProfileTier = "A" | "B" | "C" | "REJECTED";

const TIER_THRESHOLDS = {
  A: 600,
  B: 350,
  C: 100,
} as const;

const TIER_COLORS: Record<ProfileTier, string> = {
  A: "text-emerald-400",
  B: "text-blue-400",
  C: "text-amber-400",
  REJECTED: "text-red-400",
};

export function assignTierFromScore(score: number): ProfileTier {
  if (score >= TIER_THRESHOLDS.A) return "A";
  if (score >= TIER_THRESHOLDS.B) return "B";
  if (score >= TIER_THRESHOLDS.C) return "C";
  return "REJECTED";
}

export function getTierColor(tier: ProfileTier): string {
  return TIER_COLORS[tier] ?? TIER_COLORS.REJECTED;
}

export function getTierLabel(tier: ProfileTier): string {
  if (tier === "REJECTED") return "Sin tier";
  return `Tier ${tier}`;
}

export function getNextTierThreshold(tier: ProfileTier): number | null {
  switch (tier) {
    case "REJECTED":
      return TIER_THRESHOLDS.C;
    case "C":
      return TIER_THRESHOLDS.B;
    case "B":
      return TIER_THRESHOLDS.A;
    default:
      return null;
  }
}
