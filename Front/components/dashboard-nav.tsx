"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, LayoutDashboard, History, User, Link2 } from "lucide-react"
import { AuthService } from "@/lib/auth"
import { truncateWallet } from "@/lib/stellar"
import { useWallet } from "@/providers/wallet-provider"
import { NetworkBadge } from "@/components/network-badge"
import { ZCoreLogo } from "@/components/zcore-logo"

export function DashboardNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { address, walletName, disconnect } = useWallet()
  const sessionWallet = AuthService.getWallet()
  const displayWallet = address ?? sessionWallet

  const handleLogout = async () => {
    await disconnect()
    AuthService.clearSession()
    router.push("/login")
  }

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/history", label: "History", icon: History },
    { href: "/dashboard/attestation", label: "On-Chain", icon: Link2 },
    { href: "/dashboard/profile", label: "Profile", icon: User },
  ]

  return (
    <div className="border-b border-white/[0.08] bg-[#080B14]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <ZCoreLogo href="/dashboard" size="sm" />
            <NetworkBadge className="hidden sm:inline-flex" />
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-indigo-600 text-white"
                        : "text-white/60 hover:text-white hover:bg-white/[0.06]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {displayWallet && (
              <div className="hidden sm:block text-right">
                {walletName && (
                  <p className="text-xs text-white/40">{walletName}</p>
                )}
                <p className="text-sm font-mono text-white/70">{truncateWallet(displayWallet)}</p>
              </div>
            )}
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-white/10 bg-transparent hover:bg-white/[0.06] text-white/80"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Disconnect
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
