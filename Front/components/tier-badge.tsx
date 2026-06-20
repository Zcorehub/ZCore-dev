import { TIER_COLORS, TIER_LABELS, type ProfileTier } from "@/lib/types"
import { cn } from "@/lib/utils"

const TIER_GLOW: Record<ProfileTier, string> = {
  A: "shadow-[0_0_16px_rgba(255,255,255,0.12)]",
  B: "shadow-[0_0_12px_rgba(255,255,255,0.07)]",
  C: "shadow-[0_0_8px_rgba(255,255,255,0.04)]",
  REJECTED: "",
}

export function TierBadge({ tier, className }: { tier: string; className?: string }) {
  const key = (tier in TIER_LABELS ? tier : "REJECTED") as ProfileTier

  return (
    <span
      aria-label={`Credit tier ${TIER_LABELS[key]}`}
      className={cn(
        "inline-flex items-center border px-3 py-1 text-[10px] font-bold uppercase tracking-zk zk-badge transition-shadow duration-300",
        TIER_COLORS[key],
        TIER_GLOW[key],
        className
      )}
    >
      {TIER_LABELS[key]}
    </span>
  )
}
