"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import { toast } from "sonner"
import type { UserRole } from "@/lib/auth"
import { encryptPayload } from "@/lib/encryption"

export interface AuthUser {
  id: string
  name: string
  email: string
  role: "admin" | "user"
  phone?: string
  savedProperties?: string[]
  searchHistory?: string[]
  activities?: { type: string; title: string; date: string }[]
  trialEndsAt?: string
  subscriptionActive?: boolean
  createdAt?: string
}

interface AdminAuthContextType {
  isAuthenticated: boolean
  isInitialLoading: boolean
  user: AuthUser | null
  token: string | null
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  refreshUser: () => Promise<void>
  getAuthHeaders: () => Record<string, string>
  authenticatedFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

const TOKEN_KEY = "realestate_auth_token"
const USER_KEY = "realestate_auth_user"

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const pathname = usePathname()

  const getAuthHeaders = useCallback((): Record<string, string> => {
    const storedToken = sessionStorage.getItem(TOKEN_KEY)
    return storedToken ? { "x-session-token": encryptPayload(storedToken) } : {}
  }, [])

  const refreshUser = useCallback(async (roleHint?: string) => {
    try {
      const currentRole = user?.role || (typeof window !== "undefined" ? JSON.parse(sessionStorage.getItem(USER_KEY) || "{}").role : null)
      const role = roleHint || currentRole || (pathname?.startsWith("/admin") ? "admin" : "user")
      
      const url = role ? `/api/auth/me?role=${role}` : "/api/auth/me"
      const res = await fetch(url, {
        headers: { ...getAuthHeaders() }
      })
      const data = await res.json()
      
      if (data.success) {
        setUser(data.user)
        setIsAuthenticated(true)
        setToken(sessionStorage.getItem(TOKEN_KEY))
        sessionStorage.setItem(USER_KEY, JSON.stringify(data.user))
      } else {
        setUser(null)
        setIsAuthenticated(false)
        sessionStorage.removeItem(USER_KEY)
        sessionStorage.removeItem(TOKEN_KEY)
      }
    } catch (err) {
      console.error("Failed to refresh user:", err)
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsInitialLoading(false)
    }
  }, [getAuthHeaders, user?.role, pathname])

  useEffect(() => {
    if (typeof window !== "undefined") {
      // 1. Recover state from sessionStorage immediately for zero-flicker
      let storedUser = sessionStorage.getItem(USER_KEY)
      let storedToken = sessionStorage.getItem(TOKEN_KEY)
      
      // 1.5. Check for Token in Hash (Admin Session Transfer)
      const hash = window.location.hash
      let recoveredAdminToken = null
      if (hash.includes("as=")) {
        const hashToken = hash.split("as=")[1]?.split("&")[0]
        if (hashToken) {
          recoveredAdminToken = hashToken
          storedToken = hashToken
          sessionStorage.setItem(TOKEN_KEY, hashToken)
          // Also clear the hash from the URL
          window.history.replaceState(null, "", window.location.pathname + window.location.search)
        }
      }
      
      if (storedUser && storedToken) {
        try {
          const parsed = JSON.parse(storedUser)
          setUser(parsed)
          setIsAuthenticated(true)
          setToken(storedToken)
        } catch (e) { 
            console.error("Session parse error", e) 
            sessionStorage.removeItem(USER_KEY)
            sessionStorage.removeItem(TOKEN_KEY)
        }
      }

      // 2. Perform background refresh to ensure session is still valid
      // Only provide a role hint if we DON'T have a stored user
      const currentStoredRole = storedUser ? JSON.parse(storedUser).role : null
      
      // CRITICAL: If we recovered an admin token from the hash, force 'admin' role
      const roleHint = recoveredAdminToken 
        ? "admin" 
        : (!currentStoredRole ? (pathname?.startsWith("/admin") ? "admin" : "user") : currentStoredRole)
      
      refreshUser(roleHint)
      
      // Safety timeout: if refresh takes too long, stop loading
      const timer = setTimeout(() => setIsInitialLoading(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [refreshUser])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const encryptedData = encryptPayload({ email, password })
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ encryptedData }),
      })
      const data = await res.json()

      if (data.success) {
        setUser(data.user)
        setToken(data.token)
        setIsAuthenticated(true)
        sessionStorage.setItem(USER_KEY, JSON.stringify(data.user))
        sessionStorage.setItem(TOKEN_KEY, data.token)
        return { success: true, message: data.message }
      }
      return { success: false, message: data.message }
    } catch {
      return { success: false, message: "Login failed. Please try again." }
    }
  }, [])

  const register = useCallback(async (name: string, email: string, password: string, phone?: string) => {
    try {
      const encryptedData = encryptPayload({ name, email, password, phone })
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ encryptedData }),
      })
      const data = await res.json()

      if (data.success) {
        setUser(data.user)
        setToken(data.token)
        setIsAuthenticated(true)
        sessionStorage.setItem(USER_KEY, JSON.stringify(data.user))
        sessionStorage.setItem(TOKEN_KEY, data.token)
        return { success: true, message: data.message }
      }
      return { success: false, message: data.message }
    } catch {
      return { success: false, message: "Registration failed. Please try again." }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { 
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            ...getAuthHeaders()
        },
        body: JSON.stringify({ role: user?.role })
      })
    } catch (e) { console.error(e) }

    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)
  }, [user, getAuthHeaders])

  const authenticatedFetch = useCallback((input: RequestInfo | URL, init?: RequestInit) => {
    return fetch(input, {
      ...init,
      headers: {
        ...init?.headers,
        ...getAuthHeaders()
      }
    })
  }, [getAuthHeaders])

  return (
    <AdminAuthContext.Provider
      value={{ 
        isAuthenticated, 
        isInitialLoading,
        user, 
        token, 
        login, 
        register, 
        logout, 
        refreshUser,
        getAuthHeaders,
        authenticatedFetch
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider")
  }
  return context
}
