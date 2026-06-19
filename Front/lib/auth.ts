"use client"

export interface Session {
  walletAddress: string
  score: number
}

const SESSION_KEY = "zcore_session"
const TOKEN_KEY = "zcore_token"

export const AuthService = {
  setSession(session: Session, token?: string) {
    if (typeof window === "undefined") return
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    if (token) {
      sessionStorage.setItem(TOKEN_KEY, token)
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

  getToken(): string | null {
    if (typeof window === "undefined") return null
    return sessionStorage.getItem(TOKEN_KEY)
  },

  getWallet(): string | null {
    return this.getSession()?.walletAddress ?? null
  },

  updateScore(score: number) {
    const session = this.getSession()
    if (session) {
      this.setSession({ ...session, score }, this.getToken() ?? undefined)
    }
  },

  clearSession() {
    if (typeof window === "undefined") return
    localStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
  },

  isAuthenticated(): boolean {
    return !!this.getWallet() && !!this.getToken()
  },
}
