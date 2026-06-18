import { TIER_LABELS, type ProfileTier } from "@/lib/types"
import { cn } from "@/lib/utils"

interface TierProgressProps {
  score: number
  currentTier: string
  nextTier: ProfileTier | null
  progress: number
  pointsToNext: number
  className?: string
}

export function TierProgress({
  score,
  currentTier,
  nextTier,
  progress,
  pointsToNext,
  className,
}: TierProgressProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between text-xs">
        <span className="text-white/40 uppercase tracking-zk">
          Tier {currentTier}
          {nextTier ? ` → ${nextTier}` : " (max)"}
        </span>
        <span className="font-bold tabular-nums text-white/70">{score} pts</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden bg-white/[0.06]">
        <div
          className="h-full bg-gradient-to-r from-neutral-600 via-white to-neutral-400 transition-all duration-500 shadow-[0_0_12px_rgba(255,255,255,0.15)]"
          style={{ width: `${progress}%` }}
        />
      </div>
      {nextTier ? (
        <p className="text-[10px] text-white/30 uppercase tracking-zk-wide">
          {pointsToNext} points to reach {TIER_LABELS[nextTier]}
        </p>
      ) : (
        <p className="text-[10px] text-white/30 uppercase tracking-zk-wide">Maximum tier reached</p>
      )}
    </div>
  )
}
