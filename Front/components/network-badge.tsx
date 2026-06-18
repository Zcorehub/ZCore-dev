import { getStellarNetworkLabel } from "@/lib/wallet-kit"
import { cn } from "@/lib/utils"

export function NetworkBadge({ className }: { className?: string }) {
  const network = getStellarNetworkLabel()
  const isTestnet = network === "testnet"

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        isTestnet
          ? "bg-amber-500/10 text-amber-700 border-amber-500/30"
          : "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
        className
      )}
    >
      {isTestnet ? "Testnet" : "Mainnet"}
    </span>
  )
}
