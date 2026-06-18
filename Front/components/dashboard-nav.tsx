"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, LayoutDashboard, History } from "lucide-react"
import { AuthService } from "@/lib/auth"
import { truncateWallet } from "@/lib/stellar"
import { useState, useEffect } from "react"

export function DashboardNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [wallet, setWallet] = useState<string | null>(null)

  useEffect(() => {
    setWallet(AuthService.getWallet())
  }, [])

  const handleLogout = () => {
    AuthService.clearSession()
    router.push("/login")
  }

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/history", label: "History", icon: History },
  ]

  return (
    <div className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold">
              ZCore
            </Link>
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
          <div className="flex items-center gap-4">
            {wallet && (
              <span className="text-sm font-mono text-muted-foreground hidden sm:inline">
                {truncateWallet(wallet)}
              </span>
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
