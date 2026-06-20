"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, LayoutDashboard, History, User, Link2, Menu, X } from "lucide-react"
import { AuthService } from "@/lib/auth"
import { truncateWallet } from "@/lib/stellar"
import { useWallet } from "@/providers/wallet-provider"
import { NetworkBadge } from "@/components/network-badge"
import { ZCoreLogo } from "@/components/zcore-logo"
import { cn } from "@/lib/utils"

export function DashboardNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { address, walletName, disconnect } = useWallet()
  const sessionWallet = AuthService.getWallet()
  const displayWallet = address ?? sessionWallet
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

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

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href)

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 transition-all duration-300 border-b",
        scrolled
          ? "border-white/[0.08] bg-black/90 backdrop-blur-xl"
          : "border-white/[0.06] bg-black/80 backdrop-blur-md"
      )}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-6 min-w-0">
          <ZCoreLogo size="sm" href="/dashboard" onClick={() => setOpen(false)} />
          <NetworkBadge className="hidden sm:inline-flex" />
        </div>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-zk transition-colors zk-slash",
                  active
                    ? "text-white bg-white/[0.08] border border-white/15"
                    : "text-white/40 hover:text-white hover:bg-white/[0.05] border border-transparent"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
                {active && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-4 bg-white/60" />
                )}
              </Link>
            )
          })}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {displayWallet && (
            <div className="text-right">
              {walletName && <p className="text-[10px] text-white/30 uppercase tracking-zk-wide">{walletName}</p>}
              <p className="text-xs font-mono text-white/60">{truncateWallet(displayWallet)}</p>
            </div>
          )}
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="h-3.5 w-3.5" />
            Disconnect
          </Button>
        </div>

        <button
          type="button"
          className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
          onClick={() => setOpen((prev) => !prev)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div
        className={cn(
          "md:hidden border-t border-white/[0.08] bg-black/95 backdrop-blur-xl overflow-hidden transition-all duration-300",
          open ? "max-h-[28rem] opacity-100" : "max-h-0 opacity-0 border-t-0"
        )}
      >
        <div className="px-4 py-4 space-y-1 max-w-6xl mx-auto">
          {displayWallet && (
            <div className="px-3 py-2 mb-2 border border-white/[0.08] bg-white/[0.02]">
              <p className="text-[10px] text-white/30 uppercase tracking-zk-wide">{walletName ?? "Wallet"}</p>
              <p className="text-xs font-mono text-white/60 truncate">{displayWallet}</p>
            </div>
          )}
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 text-xs uppercase tracking-zk transition-colors",
                  active
                    ? "text-white bg-white/[0.08]"
                    : "text-white/70 hover:text-white hover:bg-white/[0.05]"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
          <div className="pt-3 mt-3 border-t border-white/[0.08]">
            <Button variant="outline" className="w-full" onClick={handleLogout}>
              <LogOut className="h-3.5 w-3.5" />
              Disconnect
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
