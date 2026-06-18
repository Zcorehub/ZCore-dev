import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface DappShellProps {
  children: ReactNode
  className?: string
  withGrid?: boolean
}

export function DappShell({ children, className, withGrid = true }: DappShellProps) {
  return (
    <div className={cn("min-h-screen bg-black text-white relative", className)}>
      {withGrid && (
        <>
          <div className="pointer-events-none fixed inset-0 grid-bg opacity-30" aria-hidden />
          <div className="pointer-events-none fixed inset-0 bg-noise opacity-[0.04]" aria-hidden />
        </>
      )}
      <div className="relative">{children}</div>
    </div>
  )
}
