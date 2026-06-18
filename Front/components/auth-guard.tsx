"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { AuthService } from "@/lib/auth"
import { DappShell } from "@/components/dapp-shell"
import { ZCoreLogo } from "@/components/zcore-logo"
import { Loader2 } from "lucide-react"

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      router.push("/login")
    } else {
      setIsChecking(false)
    }
  }, [router])

  if (isChecking) {
    return (
      <DappShell withGrid={false}>
        <div className="flex flex-col items-center justify-center min-h-screen gap-6">
          <ZCoreLogo size="md" />
          <Loader2 className="h-6 w-6 animate-spin text-white/40" />
        </div>
      </DappShell>
    )
  }

  return <>{children}</>
}
