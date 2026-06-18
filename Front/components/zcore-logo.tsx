import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface ZCoreLogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  href?: string
  className?: string
}

const sizes = {
  sm: { img: 28, text: "text-base" },
  md: { img: 36, text: "text-lg" },
  lg: { img: 48, text: "text-xl" },
}

export function ZCoreLogo({
  size = "md",
  showText = true,
  href,
  className,
}: ZCoreLogoProps) {
  const { img, text } = sizes[size]

  const content = (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Image
        src="/logo.jpeg"
        alt="ZCore"
        width={img}
        height={img}
        className="rounded-lg"
        priority
      />
      {showText && (
        <span className={cn("font-semibold tracking-tight text-white", text)}>ZCore</span>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="hover:opacity-90 transition-opacity">
        {content}
      </Link>
    )
  }

  return content
}
