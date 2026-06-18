"use client"

import Link from "next/link"
import { WalletAuthCard } from "@/components/wallet-auth-card"
import { ZCoreLogo } from "@/components/zcore-logo"
import { DappShell } from "@/components/dapp-shell"
import { ArrowLeft } from "lucide-react"

export default function RegisterPage() {
  return (
    <DappShell>
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[480px] h-[480px] rounded-full bg-white/[0.03] blur-[120px] pointer-events-none" />

        <div className="relative w-full max-w-md">
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-zk text-white/40 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <ZCoreLogo size="sm" />
          </div>
          <WalletAuthCard mode="register" />
        </div>
      </div>
    </DappShell>
  )
}
