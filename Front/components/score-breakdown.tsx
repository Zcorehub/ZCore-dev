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
      <div className="flex h-4 w-full overflow-hidden rounded-full bg-muted">
        {stellarBase > 0 && (
          <div
            className="bg-sky-500 transition-all"
            style={{ width: `${stellarPct}%` }}
            title={`Stellar Base: ${stellarBase}`}
          />
        )}
        {eventsScore > 0 && (
          <div
            className="bg-violet-500 transition-all"
            style={{ width: `${eventsPct}%` }}
            title={`Partner Events: ${eventsScore}`}
          />
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-sky-500" />
          <div>
            <p className="font-medium">Stellar Base</p>
            <p className="text-muted-foreground">{stellarBase} / 150 pts</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-violet-500" />
          <div>
            <p className="font-medium">Partner Events</p>
            <p className="text-muted-foreground">{eventsScore} pts</p>
          </div>
        </div>
      </div>
    </div>
  )
}
