import { TIER_COLORS, TIER_LABELS, type ProfileTier } from "@/lib/types"
import { cn } from "@/lib/utils"

export function TierBadge({ tier, className }: { tier: string; className?: string }) {
  const key = (tier in TIER_LABELS ? tier : "REJECTED") as ProfileTier

  return (
    <span
      className={cn(
        "inline-flex items-center border px-3 py-1 text-[10px] font-bold uppercase tracking-zk",
        TIER_COLORS[key],
        className
      )}
    >
      {TIER_LABELS[key]}
    </span>
  )
}
