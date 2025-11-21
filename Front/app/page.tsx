import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, TrendingUp, Lock, Globe, CheckCircle } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            ZCore
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Create Account</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Shield className="h-4 w-4" />
            Private Credit Scoring for Web3
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">
            Prove Your Creditworthiness Without Revealing Your Data
          </h1>
          <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
            ZCore enables under-collateralized lending in DeFi through portable, verifiable reputation. Get fair credit
            offers based on your history, not just your collateral.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">
                Get Started
              </Button>
            </Link>
            <Link href={`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api-docs`} target="_blank">
              <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
                View API Docs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-24 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
            Three simple steps to unlock better credit terms in Web3
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <CardTitle>Create Your Profile</CardTitle>
                <CardDescription>
                  Connect your wallet and answer a quick questionnaire about your financial activity
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <CardTitle>Get Your Score</CardTitle>
                <CardDescription>
                  ZCore computes your risk score using on-chain data and your provided information
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <CardTitle>Access Better Terms</CardTitle>
                <CardDescription>
                  Lenders use your score to offer personalized credit conditions across protocols
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Why ZCore?</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="flex gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Privacy-Preserving</h3>
                <p className="text-muted-foreground">
                  Zero-knowledge proofs let you prove creditworthiness without exposing sensitive financial data
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Portable Reputation</h3>
                <p className="text-muted-foreground">
                  Build your credit history once, reuse it across any DeFi protocol that integrates with ZCore
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Dynamic Scoring</h3>
                <p className="text-muted-foreground">
                  Your score improves with every successful payment and adapts to your behavior in real-time
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Fair & Transparent</h3>
                <p className="text-muted-foreground">
                  Data-driven credit decisions replace over-collateralization, unlocking capital efficiency
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-24 bg-primary/5">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to Build Your Web3 Credit?</h2>
          <p className="text-xl text-muted-foreground">
            Join the future of decentralized finance with reputation-based lending
          </p>
          <Link href="/register">
            <Button size="lg" className="text-lg px-8">
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 ZCore. Credit scoring infrastructure for Web3.</p>
          <div className="flex justify-center gap-6 mt-4">
            <Link
              href={`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api-docs`}
              target="_blank"
              className="hover:text-foreground"
            >
              API Documentation
            </Link>
            <Link
              href={`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/api-docs.json`}
              target="_blank"
              className="hover:text-foreground"
            >
              OpenAPI Spec
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
