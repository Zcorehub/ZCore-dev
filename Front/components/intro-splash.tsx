"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DappShell } from "@/components/dapp-shell"
import { cn } from "@/lib/utils"

const HASH_CHARS = "0123456789abcdef"
const ZK_PHASES = [
  "INITIALIZING CIRCUIT...",
  "COMPUTING WITNESS...",
  "GENERATING PROOF π...",
  "VERIFYING COMMITMENT...",
  "PROOF VALID ✓",
] as const

function randomHash(len = 64) {
  let s = "0x"
  for (let i = 0; i < len; i++) {
    s += HASH_CHARS[Math.floor(Math.random() * 16)]
  }
  return s
}

interface ZkLaunchOverlayProps {
  active: boolean
  onComplete: () => void
}

function ZkLaunchOverlay({ active, onComplete }: ZkLaunchOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [phase, setPhase] = useState(0)
  const [displayHash, setDisplayHash] = useState(() => randomHash(48))
  const completedRef = useRef(false)

  useEffect(() => {
    if (!active) return
    const interval = window.setInterval(() => setDisplayHash(randomHash(48)), 180)
    return () => clearInterval(interval)
  }, [active])

  useEffect(() => {
    if (!active) {
      setPhase(0)
      completedRef.current = false
      return
    }

    const timers = ZK_PHASES.map((_, i) =>
      window.setTimeout(() => setPhase(i), i * 520)
    )
    const done = window.setTimeout(() => {
      if (!completedRef.current) {
        completedRef.current = true
        onComplete()
      }
    }, 2800)

    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(done)
    }
  }, [active, onComplete])

  useEffect(() => {
    if (!active) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let raf = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener("resize", resize)

    type Particle = {
      x: number
      y: number
      vx: number
      vy: number
      text: string
      size: number
      alpha: number
      life: number
    }

    const particles: Particle[] = Array.from({ length: 120 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 2,
      vy: Math.random() * 3 + 1,
      text: randomHash(8 + Math.floor(Math.random() * 24)),
      size: 9 + Math.random() * 6,
      alpha: 0.15 + Math.random() * 0.55,
      life: Math.random(),
    }))

    const start = performance.now()

    const draw = (now: number) => {
      const t = (now - start) / 1000
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      const pull = Math.min(t * 0.8, 1)

      ctx.fillStyle = `rgba(0,0,0,${0.08 + pull * 0.12})`
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)

      for (const p of particles) {
        const dx = cx - p.x
        const dy = cy - p.y
        p.vx += dx * 0.0008 * pull
        p.vy += dy * 0.0008 * pull
        p.x += p.vx
        p.y += p.vy
        p.life += 0.008

        if (p.life > 1) {
          p.x = Math.random() * window.innerWidth
          p.y = -20
          p.text = randomHash(8 + Math.floor(Math.random() * 24))
          p.life = 0
          p.vx = (Math.random() - 0.5) * 2
          p.vy = Math.random() * 2 + 0.5
        }

        ctx.font = `${p.size}px var(--font-mono), monospace`
        ctx.fillStyle = `rgba(255,255,255,${p.alpha * (1 - pull * 0.3)})`
        ctx.fillText(p.text, p.x, p.y)
      }

      // Converging proof rings
      for (let i = 0; i < 4; i++) {
        const radius = (180 + i * 90) * (1 - pull * 0.85)
        ctx.strokeStyle = `rgba(255,255,255,${0.08 + (1 - pull) * 0.12})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.rect(cx - radius, cy - radius, radius * 2, radius * 2)
        ctx.stroke()
      }

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
    }
  }, [active])

  if (!active) return null

  return (
    <div
      className="fixed inset-0 z-[100] overflow-hidden bg-black animate-zk-fade-in"
      aria-live="polite"
      aria-label="Zero-knowledge proof verification"
    >
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      <div className="absolute inset-0 bg-noise opacity-[0.06] pointer-events-none" />
      <div className="absolute inset-0 zk-scanlines pointer-events-none" />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-[min(90vw,520px)] h-[min(90vw,520px)] border border-white/10 animate-zk-ring-spin"
          style={{ animationDuration: "1.2s" }}
        />
        <div
          className="absolute w-[min(70vw,380px)] h-[min(70vw,380px)] border border-white/[0.06] animate-zk-ring-spin-reverse"
          style={{ animationDuration: "0.9s" }}
        />
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30 mb-6 animate-zk-pulse">
          zk-snark · stellar · portable score
        </p>

        <p
          key={phase}
          className="text-sm sm:text-base font-mono font-bold uppercase tracking-zk-wide text-white animate-zk-phase-in mb-4"
        >
          {ZK_PHASES[phase]}
        </p>

        <p className="text-[10px] font-mono text-white/25 max-w-md break-all animate-zk-hash-scroll">
          {displayHash}
        </p>
      </div>

      <div className="absolute inset-0 bg-white animate-zk-flash pointer-events-none" />
    </div>
  )
}

export function IntroSplash() {
  const router = useRouter()
  const [launching, setLaunching] = useState(false)
  const [contentHidden, setContentHidden] = useState(false)

  const finishLaunch = useCallback(() => {
    router.push("/register")
  }, [router])

  const handleLaunch = () => {
    if (launching) return

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reducedMotion) {
      router.push("/register")
      return
    }

    setLaunching(true)
    window.setTimeout(() => setContentHidden(true), 200)
  }

  return (
    <>
      <ZkLaunchOverlay active={launching} onComplete={finishLaunch} />

      <DappShell withGrid={false}>
        <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 overflow-hidden">
          {/* Rotating ZK frames — same as landing CTA */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[min(85vw,520px)] h-[min(85vw,520px)] border border-white/[0.04] animate-zk-ring-spin-slow" />
            <div className="absolute w-[min(65vw,380px)] h-[min(65vw,380px)] border border-white/[0.03] animate-zk-ring-spin-reverse-slow" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-white/[0.03] via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[480px] h-[480px] rounded-full bg-white/[0.02] blur-[120px] pointer-events-none" />

          <div
            className={cn(
              "relative max-w-3xl mx-auto text-center transition-all duration-500",
              contentHidden && "opacity-0 scale-95 blur-sm"
            )}
          >
            <div className="absolute inset-0 bg-white/[0.02] blur-[80px] pointer-events-none animate-zk-glow-pulse" />

            <div className="relative">
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.08] mb-5">
                <span className="block animate-zk-slide-up" style={{ animationDelay: "0ms" }}>
                  STOP ASKING
                </span>
                <span
                  className="block gradient-text-animated animate-zk-slide-up"
                  style={{ animationDelay: "120ms" }}
                >
                  START PROVING.
                </span>
              </h1>

              <p
                className="text-white/45 text-sm sm:text-base tracking-wide mb-10 max-w-lg mx-auto animate-zk-slide-up"
                style={{ animationDelay: "240ms" }}
              >
                Register your Stellar wallet. Get your score. Own your credit history, permanently
                on-chain.
              </p>

              <div
                className="animate-zk-slide-up"
                style={{ animationDelay: "360ms" }}
              >
                <Button
                  size="lg"
                  className="px-10 h-14 text-sm glow-white group"
                  onClick={handleLaunch}
                  disabled={launching}
                >
                  Launch the App
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>

              <p
                className="mt-6 text-white/25 text-[10px] flex items-center justify-center gap-2 uppercase tracking-zk-wide animate-zk-slide-up"
                style={{ animationDelay: "480ms" }}
              >
                <CheckCircle className="w-3.5 h-3.5 text-white/40" />
                No email · No password · Wallet only
              </p>
            </div>
          </div>
        </section>
      </DappShell>
    </>
  )
}
