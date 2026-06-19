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
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:text-xs focus:font-bold focus:uppercase focus:tracking-zk focus:text-black"
      >
        Skip to content
      </a>
      {withGrid && (
        <>
          <div className="pointer-events-none fixed inset-0 grid-bg opacity-30" aria-hidden />
          <div className="pointer-events-none fixed inset-0 bg-noise opacity-[0.04]" aria-hidden />
        </>
      )}
      <main id="main-content" className="relative" tabIndex={-1}>
        {children}
      </main>
    </div>
  )
}
