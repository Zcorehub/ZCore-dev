import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface ZCoreLogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  href?: string
  className?: string
  onClick?: () => void
}

const SIZES = {
  sm: { h: 18, w: 81 },
  md: { h: 24, w: 108 },
  lg: { h: 32, w: 144 },
  xl: { h: 40, w: 180 },
}

export function ZCoreLogo({ size = "md", href, className, onClick }: ZCoreLogoProps) {
  const { h, w } = SIZES[size]

  const content = (
    <span className={cn("inline-flex group", className)}>
      <Image
        src="/logo_name.png"
        alt="ZCore"
        width={w}
        height={h}
        className="object-contain object-left group-hover:opacity-80 transition-opacity"
        priority={size === "sm" || size === "md"}
      />
    </span>
  )

  if (href) {
    return (
      <Link href={href} className="inline-flex" onClick={onClick}>
        {content}
      </Link>
    )
  }

  return content
}
