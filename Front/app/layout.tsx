import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono, Space_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AppProviders } from "@/providers/app-providers"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-zk",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://dapp-zcore.vercel.app"),
  title: "ZCore — Stellar Credit Dashboard",
  description:
    "Discover, access, and activate on-chain credit on Stellar. No banks. No forms. Just your wallet.",
  openGraph: {
    title: "ZCore",
    description: "Portable credit scoring for Stellar DeFi.",
    type: "website",
    images: ["/logo_name.png"],
  },
  icons: {
    icon: "/logo.jpeg",
    apple: "/logo.jpeg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${inter.variable} ${jetbrains.variable} ${spaceMono.variable} min-h-screen bg-black text-white antialiased font-zk`}
      >
        <AppProviders>{children}</AppProviders>
        <Analytics />
      </body>
    </html>
  )
}
