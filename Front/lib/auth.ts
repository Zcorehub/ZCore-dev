"use client"

export interface User {
  email: string
  walletAddress: string
  fullName: string
}

export const AuthService = {
  setToken(token: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("zcore_token", token)
    }
  },

  getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("zcore_token")
    }
    return null
  },

  removeToken() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("zcore_token")
      localStorage.removeItem("zcore_user")
    }
  },

  setUser(user: User) {
    if (typeof window !== "undefined") {
      localStorage.setItem("zcore_user", JSON.stringify(user))
    }
  },

  getUser(): User | null {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("zcore_user")
      return user ? JSON.parse(user) : null
    }
    return null
  },

  isAuthenticated(): boolean {
    return !!this.getToken()
  },
}
