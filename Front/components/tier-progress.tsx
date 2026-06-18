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
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">
          Tier {currentTier}
          {nextTier ? ` → ${nextTier}` : " (max)"}
        </span>
        <span className="font-medium tabular-nums">{score} pts</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      {nextTier ? (
        <p className="text-xs text-muted-foreground">
          {pointsToNext} points to reach {TIER_LABELS[nextTier]}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">Maximum tier reached</p>
      )}
    </div>
  )
}
