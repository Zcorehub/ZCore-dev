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
      <div className="flex h-2 w-full overflow-hidden bg-white/[0.06]">
        {stellarBase > 0 && (
          <div
            className="bg-gradient-to-r from-neutral-600 via-white to-neutral-400 transition-all"
            style={{ width: `${stellarPct}%` }}
            title={`Stellar Base: ${stellarBase}`}
          />
        )}
        {eventsScore > 0 && (
          <div
            className="bg-gradient-to-r from-neutral-700 via-neutral-400 to-neutral-500 transition-all"
            style={{ width: `${eventsPct}%` }}
            title={`Partner Events: ${eventsScore}`}
          />
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 bg-white/80 shrink-0" />
          <div>
            <p className="font-bold uppercase tracking-zk text-white/70">Stellar Base</p>
            <p className="text-white/40">{stellarBase} / 150 pts</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 bg-neutral-500 shrink-0" />
          <div>
            <p className="font-bold uppercase tracking-zk text-white/70">Partner Events</p>
            <p className="text-white/40">{eventsScore} pts</p>
          </div>
        </div>
      </div>
    </div>
  )
}
