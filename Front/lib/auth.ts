"use client"

export interface Session {
  walletAddress: string
  score: number
}

const SESSION_KEY = "zcore_session"

export const AuthService = {
  setSession(session: Session) {
    if (typeof window !== "undefined") {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    }
  },

  getSession(): Session | null {
    if (typeof window === "undefined") return null
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as Session
    } catch {
      return null
    }
  },

  getWallet(): string | null {
    return this.getSession()?.walletAddress ?? null
  },

  updateScore(score: number) {
    const session = this.getSession()
    if (session) {
      this.setSession({ ...session, score })
    }
  },

  clearSession() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(SESSION_KEY)
    }
  },

  isAuthenticated(): boolean {
    return !!this.getWallet()
  },
}
