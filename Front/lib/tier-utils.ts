import type { ProfileTier } from "./types";

const TIER_THRESHOLDS: { tier: ProfileTier; min: number; max: number }[] = [
  { tier: "REJECTED", min: 0, max: 99 },
  { tier: "C", min: 100, max: 349 },
  { tier: "B", min: 350, max: 599 },
  { tier: "A", min: 600, max: 850 },
];

const TIER_COLORS: Record<ProfileTier, string> = {
  A: "text-emerald-400",
  B: "text-blue-400",
  C: "text-amber-400",
  REJECTED: "text-red-400",
};

export function getTierProgress(score: number) {
  const current =
    [...TIER_THRESHOLDS].reverse().find((t) => score >= t.min) ??
    TIER_THRESHOLDS[0];

  const currentIndex = TIER_THRESHOLDS.findIndex(
    (t) => t.tier === current.tier
  );
  const next = TIER_THRESHOLDS[currentIndex + 1] ?? null;

  if (!next) {
    return {
      currentTier: current.tier,
      nextTier: null as ProfileTier | null,
      progress: 100,
      pointsToNext: 0,
      nextThreshold: 850,
    };
  }

  const rangeStart = current.min;
  const rangeEnd = next.min;
  const progress = Math.min(
    100,
    Math.round(((score - rangeStart) / (rangeEnd - rangeStart)) * 100)
  );

  return {
    currentTier: current.tier,
    nextTier: next.tier,
    progress,
    pointsToNext: Math.max(0, next.min - score),
    nextThreshold: next.min,
  };
}

export function assignTierFromScore(score: number): ProfileTier {
  const { currentTier } = getTierProgress(score);
  return currentTier;
}

export function getTierColor(tier: ProfileTier): string {
  return TIER_COLORS[tier] ?? TIER_COLORS.REJECTED;
}

export function getTierLabel(tier: ProfileTier): string {
  if (tier === "REJECTED") return "Sin tier";
  return `Tier ${tier}`;
}

export function getNextTierThreshold(tier: ProfileTier): number | null {
  const index = TIER_THRESHOLDS.findIndex((t) => t.tier === tier);
  const next = TIER_THRESHOLDS[index + 1];
  return next?.min ?? null;
}
