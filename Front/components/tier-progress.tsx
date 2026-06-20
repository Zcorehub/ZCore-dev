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

const SCORE_MAX = 850
const THRESHOLD_MARKERS = [
  { score: 100, label: "C" },
  { score: 350, label: "B" },
  { score: 600, label: "A" },
]

export function TierProgress({
  score,
  currentTier,
  nextTier,
  progress,
  pointsToNext,
  className,
}: TierProgressProps) {
  const tierLabel =
    currentTier in TIER_LABELS ? TIER_LABELS[currentTier as ProfileTier] : currentTier
  const progressLabel = nextTier
    ? `${score} points, ${tierLabel} tier, ${pointsToNext} points to reach ${TIER_LABELS[nextTier]}`
    : `${score} points, ${tierLabel} tier, maximum tier reached`

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between text-xs">
        <span className="text-white/40 uppercase tracking-zk">
          Tier {currentTier}
          {nextTier ? ` → ${nextTier}` : " (max)"}
        </span>
        <span className="font-bold tabular-nums text-white/70">{score} pts</span>
      </div>
      <div className="relative h-1.5 w-full overflow-visible bg-white/[0.06]">
        <div
          role="progressbar"
          aria-label={progressLabel}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          className="h-full bg-gradient-to-r from-neutral-600 via-white to-neutral-400 transition-all duration-500 shadow-[0_0_12px_rgba(255,255,255,0.15)]"
          style={{ width: `${(score / SCORE_MAX) * 100}%` }}
        />
        {THRESHOLD_MARKERS.map((marker) => {
          const pct = (marker.score / SCORE_MAX) * 100
          const reached = score >= marker.score
          return (
            <div
              key={marker.label}
              className="absolute top-0 flex flex-col items-center"
              style={{ left: `${pct}%` }}
            >
              <div
                className={cn(
                  "w-px h-1.5",
                  reached ? "bg-white/50" : "bg-white/15"
                )}
              />
            </div>
          )
        })}
      </div>
      <div className="relative flex justify-between text-[9px] text-white/20 uppercase tracking-zk-wide">
        <span>0</span>
        {THRESHOLD_MARKERS.map((marker) => (
          <span
            key={marker.label}
            className={cn(score >= marker.score ? "text-white/40" : "text-white/20")}
          >
            {marker.score}
          </span>
        ))}
        <span>850</span>
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
