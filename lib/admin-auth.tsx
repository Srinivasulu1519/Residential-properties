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
  const pathname = usePathname()

  const getAuthHeaders = useCallback((): Record<string, string> => {
    const storedToken = sessionStorage.getItem(TOKEN_KEY)
    return storedToken ? { "x-session-token": encryptPayload(storedToken) } : {}
  }, [])

  const refreshUser = useCallback(async (roleHint?: string) => {
    try {
      const url = roleHint ? `/api/auth/me?role=${roleHint}` : "/api/auth/me"
      const res = await fetch(url, {
        headers: { ...getAuthHeaders() }
      })
      const data = await res.json()
      
      if (data.success) {
        setUser(data.user)
        setIsAuthenticated(true)
        sessionStorage.setItem(USER_KEY, JSON.stringify(data.user))
        // The cookie might still switch, but our headers will keep this tab stable
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
    }
  }, [getAuthHeaders])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const roleHint = pathname?.startsWith("/admin") ? "admin" : "user"

      // Initial state from sessionStorage for speed
      const storedUser = sessionStorage.getItem(USER_KEY)
      const storedToken = sessionStorage.getItem(TOKEN_KEY)
      if (storedUser && storedToken) {
        const parsed = JSON.parse(storedUser)
        if (parsed.role === roleHint) {
          setUser(parsed)
          setIsAuthenticated(true)
          setToken(storedToken)
        }
      }

      refreshUser(roleHint)
    }
  }, [refreshUser, pathname])

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
