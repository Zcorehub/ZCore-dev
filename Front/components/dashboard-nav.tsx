"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, LayoutDashboard, History, User } from "lucide-react"
import { AuthService } from "@/lib/auth"
import { truncateWallet } from "@/lib/stellar"
import { useWallet } from "@/providers/wallet-provider"
import { NetworkBadge } from "@/components/network-badge"

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
    { href: "/dashboard/profile", label: "Profile", icon: User },
  ]

  return (
    <div className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-xl font-bold">
              ZCore
            </Link>
            <NetworkBadge className="hidden sm:inline-flex" />
            <nav className="hidden md:flex items-center gap-1">
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
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
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
                  <p className="text-xs text-muted-foreground">{walletName}</p>
                )}
                <p className="text-sm font-mono">{truncateWallet(displayWallet)}</p>
              </div>
            )}
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Disconnect
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
