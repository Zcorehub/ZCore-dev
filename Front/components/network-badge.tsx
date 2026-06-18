import { getStellarNetworkLabel } from "@/lib/wallet-kit"
import { cn } from "@/lib/utils"

export function NetworkBadge({ className }: { className?: string }) {
  const network = getStellarNetworkLabel()
  const isTestnet = network === "testnet"

  return (
    <span
      className={cn(
        "inline-flex items-center zk-badge border px-2 py-0.5 text-[10px] font-bold uppercase tracking-zk-wide",
        isTestnet
          ? "border-white/15 bg-white/[0.04] text-white/50"
          : "border-white/25 bg-white/[0.08] text-white/70",
        className
      )}
    >
      {isTestnet ? "Testnet" : "Mainnet"}
    </span>
  )
}
