"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, LayoutDashboard, Search, Building2, Receipt } from "lucide-react"
import { AuthService } from "@/lib/auth"
import { useState, useEffect } from "react"

export function DashboardNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<{ email: string } | null>(null)

  useEffect(() => {
    setUser(AuthService.getUser())
  }, [])

  const handleLogout = () => {
    AuthService.removeToken()
    router.push("/login")
  }

  const navItems = [
    { href: "/dashboard", label: "Scoring", icon: LayoutDashboard },
    { href: "/dashboard/search", label: "Search Profile", icon: Search },
    { href: "/dashboard/lender", label: "Lender Profiles", icon: Building2 },
    { href: "/dashboard/payments", label: "Payments", icon: Receipt },
  ]

  return (
    <div className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold">
              ZCore
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === item.href
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
            {user && <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>}
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
