"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthService } from "@/lib/auth"
import { IntroSplash } from "@/components/intro-splash"
import { DappShell } from "@/components/dapp-shell"
import { ZCoreLogo } from "@/components/zcore-logo"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (AuthService.isAuthenticated()) {
      router.replace("/dashboard")
      return
    }
    setReady(true)
  }, [router])

  if (!ready) {
    return (
      <DappShell withGrid={false}>
        <div className="flex flex-col items-center justify-center min-h-screen gap-6">
          <ZCoreLogo size="md" />
          <Loader2 className="h-6 w-6 animate-spin text-white/40" />
        </div>
      </DappShell>
    )
  }

  return <IntroSplash />
}
