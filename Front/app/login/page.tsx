"use client"

import Link from "next/link"
import { WalletAuthCard } from "@/components/wallet-auth-card"
import { ArrowLeft } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <WalletAuthCard mode="login" />
      </div>
    </div>
  )
}
