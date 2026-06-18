"use client"

import Link from "next/link"
import { WalletAuthCard } from "@/components/wallet-auth-card"
import { ZCoreLogo } from "@/components/zcore-logo"
import { ArrowLeft } from "lucide-react"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <ZCoreLogo size="sm" showText={false} />
        </div>
        <WalletAuthCard mode="register" />
      </div>
    </div>
  )
}
