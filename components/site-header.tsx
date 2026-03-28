"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import {
  Menu, X, LogOut, LayoutDashboard, User, PlusCircle, ChevronDown,
  LandPlot, Building2, Home, Warehouse, Tractor, Key, Store, Castle, Sparkles
} from "lucide-react"
import { PropVistaLogo } from "@/components/propvista-logo"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAdminAuth } from "@/lib/admin-auth"

const PROPERTY_TYPES = [
  { value: "plot", label: "Plots", icon: LandPlot, color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-200" },
  { value: "apartment", label: "Apartments", icon: Building2, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200" },
  { value: "villa", label: "Villas", icon: Castle, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" },
  { value: "farmhouse", label: "Farmhouse", icon: Home, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  { value: "agriculture_land", label: "Agriculture Land", icon: Tractor, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
  { value: "rent", label: "Rent", icon: Key, color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-200" },
  { value: "commercial", label: "Commercial", icon: Store, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  { value: "independent_house", label: "Independent House", icon: Warehouse, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
]

export function SiteHeader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const megaRef = useRef<HTMLDivElement>(null)
  const megaTimeout = useRef<NodeJS.Timeout | null>(null)
  const { isAuthenticated, user, logout } = useAdminAuth()

  useState(() => {
    if (typeof window !== "undefined") {
      const showWelcome = sessionStorage.getItem("show_welcome")
      if (showWelcome === "true" && user?.name) {
        setTimeout(() => {
          import("sonner").then(({ toast }) => {
            toast.success(`Welcome back, ${user.name.split(' ')[0]}!`, {
              description: "Great to see you again.",
            })
          })
          sessionStorage.removeItem("show_welcome")
        }, 500)
      }
    }
  })

  // Close mega menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) {
        setMegaOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleLogout = () => {
    logout()
    setMobileOpen(false)
    router.push("/")
  }

  const handleMegaEnter = () => {
    if (megaTimeout.current) clearTimeout(megaTimeout.current)
    setMegaOpen(true)
  }
  const handleMegaLeave = () => {
    megaTimeout.current = setTimeout(() => setMegaOpen(false), 200)
  }

  const currentType = searchParams.get("type")

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <Link href="/" className="flex items-center transition-all hover:opacity-90">
          <PropVistaLogo size="md" />
        </Link>

        {/* ========== DESKTOP NAV ========== */}
        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/"
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary",
              pathname === "/" ? "bg-secondary text-secondary-foreground" : "text-muted-foreground"
            )}
          >
            Home
          </Link>

          {/* Properties Mega Menu */}
          <div
            ref={megaRef}
            className="relative"
            onMouseEnter={handleMegaEnter}
            onMouseLeave={handleMegaLeave}
          >
            <button
              onClick={() => setMegaOpen(!megaOpen)}
              className={cn(
                "flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary",
                pathname === "/properties" ? "bg-secondary text-secondary-foreground" : "text-muted-foreground"
              )}
            >
              Properties
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", megaOpen && "rotate-180")} />
            </button>

            {/* Mega Dropdown */}
            {megaOpen && (
              <div className="absolute left-1/2 top-full pt-2 -translate-x-1/2 z-50">
                <div className="w-[520px] rounded-xl border border-border bg-background shadow-xl shadow-black/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-slate-900 to-emerald-900 px-5 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold text-sm">Browse Properties</p>
                      <p className="text-white/50 text-xs">Find your perfect property by type</p>
                    </div>
                    <Link
                      href="/properties"
                      onClick={() => setMegaOpen(false)}
                      className="text-xs text-emerald-300 hover:text-emerald-200 font-medium transition-colors"
                    >
                      View All →
                    </Link>
                  </div>

                  {/* Grid */}
                  <div className="grid grid-cols-2 gap-2 p-4">
                    {PROPERTY_TYPES.map((type) => {
                      const Icon = type.icon
                      const isActive = currentType === type.value
                      return (
                        <Link
                          key={type.value}
                          href={`/properties?type=${type.value}`}
                          onClick={() => setMegaOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all duration-200 hover:shadow-sm group",
                            isActive
                              ? `${type.bg} ${type.border} shadow-sm`
                              : "border-transparent hover:border-border hover:bg-secondary/50"
                          )}
                        >
                          <div className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                            isActive ? type.bg : "bg-secondary group-hover:" + type.bg
                          )}>
                            <Icon className={cn("h-4.5 w-4.5", type.color)} />
                          </div>
                          <div>
                            <p className={cn("text-sm font-medium", isActive ? type.color : "text-foreground")}>
                              {type.label}
                            </p>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* ========== RIGHT SIDE ========== */}
        <div className="hidden items-center gap-2 md:flex">
          {/* Post Property - Always Visible */}
          <Link
            href={isAuthenticated ? "/post-property" : "/auth/register"}
            className="relative flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition-all hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5"
          >
            <PlusCircle className="h-4 w-4" />
            Post Property
            <span className="ml-1 flex items-center gap-0.5 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="h-3 w-3" />
              Free 30 Days
            </span>
          </Link>

          {isAuthenticated && user ? (
            <>
              {user.role === "admin" ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/dashboard">
                    <LayoutDashboard className="mr-1.5 h-4 w-4" />
                    Admin
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard">
                    <User className="mr-1.5 h-4 w-4" />
                    My Profile
                  </Link>
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="mr-1.5 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/register">Register</Link>
              </Button>
            </>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* ========== MOBILE MENU ========== */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-secondary",
                pathname === "/" ? "bg-secondary text-secondary-foreground" : "text-muted-foreground"
              )}
            >
              Home
            </Link>
            <Link
              href="/properties"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-secondary",
                pathname === "/properties" && !currentType ? "bg-secondary text-secondary-foreground" : "text-muted-foreground"
              )}
            >
              All Properties
            </Link>

            {/* Property Types Grid in Mobile */}
            <div className="my-2 grid grid-cols-2 gap-1.5 px-1">
              {PROPERTY_TYPES.map((type) => {
                const Icon = type.icon
                const isActive = currentType === type.value
                return (
                  <Link
                    key={type.value}
                    href={`/properties?type=${type.value}`}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs font-medium transition-colors",
                      isActive
                        ? `${type.bg} ${type.border} ${type.color}`
                        : "border-border text-muted-foreground hover:bg-secondary"
                    )}
                  >
                    <Icon className={cn("h-3.5 w-3.5", type.color)} />
                    {type.label}
                  </Link>
                )
              })}
            </div>

            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
              {/* Post Property Mobile */}
              <Link
                href={isAuthenticated ? "/post-property" : "/auth/register"}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white"
              >
                <PlusCircle className="h-4 w-4" />
                Post Property
                <span className="flex items-center gap-0.5 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase">
                  <Sparkles className="h-3 w-3" />
                  Free 30 Days
                </span>
              </Link>

              {isAuthenticated && user ? (
                <>
                  {user.role === "admin" ? (
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2" asChild>
                      <Link href="/admin/dashboard" onClick={() => setMobileOpen(false)}>
                        <LayoutDashboard className="h-4 w-4" />
                        Admin Panel
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2" asChild>
                      <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                        <User className="h-4 w-4" />
                        My Profile
                      </Link>
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button size="sm" className="w-full" asChild>
                    <Link href="/auth/register" onClick={() => setMobileOpen(false)}>
                      Register
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
