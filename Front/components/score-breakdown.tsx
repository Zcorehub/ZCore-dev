import { cn } from "@/lib/utils"

interface ScoreBreakdownProps {
  stellarBase: number
  eventsScore: number
  totalScore: number
  className?: string
}

export function ScoreBreakdown({
  stellarBase,
  eventsScore,
  totalScore,
  className,
}: ScoreBreakdownProps) {
  const stellarPct = totalScore > 0 ? (stellarBase / totalScore) * 100 : 0
  const eventsPct = totalScore > 0 ? (eventsScore / totalScore) * 100 : 0

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative flex h-3 w-full overflow-hidden bg-white/[0.06]">
        {stellarBase > 0 && (
          <div
            className="h-full bg-gradient-to-r from-neutral-500 via-white to-neutral-300 transition-all duration-700"
            style={{ width: `${stellarPct}%` }}
            title={`Stellar Base: ${stellarBase}`}
          />
        )}
        {eventsScore > 0 && (
          <div
            className="h-full bg-gradient-to-r from-neutral-600 via-neutral-400 to-neutral-500 transition-all duration-700 ml-px"
            style={{ width: `${eventsPct}%` }}
            title={`Partner Events: ${eventsScore}`}
          />
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div className="flex items-start gap-2">
          <span className="mt-1 h-2 w-2 shrink-0 bg-white/80" />
          <div>
            <p className="font-bold uppercase tracking-zk text-white/70">Stellar Base</p>
            <p className="text-white/40">
              {stellarBase} <span className="text-white/25">/ 150 pts</span>
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <span className="mt-1 h-2 w-2 shrink-0 bg-neutral-500" />
          <div>
            <p className="font-bold uppercase tracking-zk text-white/70">Partner Events</p>
            <p className="text-white/40">
              {eventsScore} <span className="text-white/25">pts</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
