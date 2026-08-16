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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const PROPERTY_TYPES = [
  { value: "plot", label: "Plots", icon: LandPlot, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200/60" },
  { value: "apartment", label: "Apartments", icon: Building2, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200/60" },
  { value: "villa", label: "Villas", icon: Castle, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200/60" },
  { value: "farmhouse", label: "Farmhouse", icon: Home, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200/60" },
  { value: "agriculture_land", label: "Agriculture Land", icon: Tractor, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200/60" },
  { value: "rent", label: "Rent", icon: Key, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200/60" },
  { value: "commercial", label: "Commercial", icon: Store, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200/60" },
  { value: "independent_house", label: "Independent House", icon: Warehouse, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200/60" },
]

export function SiteHeader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const megaRef = useRef<HTMLDivElement>(null)
  const megaTimeout = useRef<NodeJS.Timeout | null>(null)
  const { isAuthenticated, user, logout } = useAdminAuth()
  const welcomeShown = useRef(false)

  useEffect(() => {
    if (typeof window !== "undefined" && !welcomeShown.current) {
      const showWelcome = sessionStorage.getItem("show_welcome")
      if (showWelcome === "true" && user?.name) {
        welcomeShown.current = true
        sessionStorage.removeItem("show_welcome")
        setTimeout(() => {
          import("sonner").then(({ toast }) => {
            toast.success(`Welcome back, ${user.name.split(' ')[0]}!`, {
              description: "You have successfully logged in.",
            })
          })
        }, 500)
      }
    }
  }, [user])

  // Scroll detection for header styling
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

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
    const wasAdmin = user?.role === "admin"
    logout()
    setMobileOpen(false)
    if (wasAdmin) {
      import("sonner").then(({ toast }) => {
        toast.success("Logged out successfully", {
          description: "You have been logged out from admin panel and website."
        })
      })
    }
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
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border/60 bg-background/95 backdrop-blur-xl shadow-sm shadow-black/[0.03]"
          : "border-b border-transparent bg-background/80 backdrop-blur-sm"
      )}
    >
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center transition-opacity hover:opacity-80">
          <PropVistaLogo size="md" />
        </Link>

        {/* ========== DESKTOP NAV ========== */}
        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/"
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors",
              pathname === "/" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
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
                "flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors",
                pathname === "/properties" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Properties
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", megaOpen && "rotate-180")} />
            </button>

            {/* Mega Dropdown */}
            {megaOpen && (
              <div className="absolute left-1/2 top-full pt-3 -translate-x-1/2 z-50">
                <div className="w-[540px] rounded-xl border border-border/60 bg-card shadow-xl shadow-black/[0.08] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Header */}
                  <div className="border-b border-border/40 px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="font-serif text-base font-semibold text-foreground">Explore Properties</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Find your perfect space by category</p>
                    </div>
                    <Link
                      href="/properties"
                      onClick={() => setMegaOpen(false)}
                      className="text-xs text-primary font-medium hover:text-primary/80 transition-colors"
                    >
                      View All →
                    </Link>
                  </div>

                  {/* Grid */}
                  <div className="grid grid-cols-2 gap-1 p-3">
                    {PROPERTY_TYPES.map((type) => {
                      const Icon = type.icon
                      const isActive = currentType === type.value
                      return (
                        <Link
                          key={type.value}
                          href={`/properties?type=${type.value}`}
                          onClick={() => setMegaOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-150 group",
                            isActive
                              ? "bg-primary/5 text-primary"
                              : "text-foreground hover:bg-secondary/60"
                          )}
                        >
                          <div className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                            isActive ? "bg-primary/10" : "bg-secondary group-hover:bg-primary/5"
                          )}>
                            <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary/70")} />
                          </div>
                          <span className={cn("text-sm font-medium", isActive && "text-primary")}>
                            {type.label}
                          </span>
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
        <div className="hidden items-center gap-3 md:flex">
          {/* Post Property */}
          <Link
            href={isAuthenticated ? "/post-property" : "/auth/register"}
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md"
          >
            <PlusCircle className="h-4 w-4" />
            Post Property
          </Link>

          {isAuthenticated && user ? (
            <>
              {user.role === "admin" ? (
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
                  <Link href="/admin/dashboard">
                    <LayoutDashboard className="mr-1.5 h-4 w-4" />
                    Admin
                  </Link>
                </Button>
              ) : (
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
                  <Link href="/dashboard">
                    <User className="mr-1.5 h-4 w-4" />
                    Profile
                  </Link>
                </Button>
              )}
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-9 w-9" onClick={() => setShowLogoutConfirm(true)}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground font-medium" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button variant="outline" size="sm" className="rounded-full font-medium" asChild>
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
        <div className="border-t border-border/40 bg-background px-6 py-5 md:hidden animate-in fade-in slide-in-from-top-1 duration-200">
          <nav className="flex flex-col gap-1">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                pathname === "/" ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              Home
            </Link>
            <Link
              href="/properties"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                pathname === "/properties" && !currentType ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              All Properties
            </Link>

            {/* Property Types Grid in Mobile */}
            <div className="my-3 grid grid-cols-2 gap-2 px-1">
              {PROPERTY_TYPES.map((type) => {
                const Icon = type.icon
                const isActive = currentType === type.value
                return (
                  <Link
                    key={type.value}
                    href={`/properties?type=${type.value}`}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors",
                      isActive
                        ? "bg-primary/5 border-primary/20 text-primary"
                        : "border-border/50 text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    )}
                  >
                    <Icon className={cn("h-3.5 w-3.5", isActive ? "text-primary" : "text-muted-foreground")} />
                    {type.label}
                  </Link>
                )
              })}
            </div>

            <div className="mt-3 flex flex-col gap-2.5 border-t border-border/40 pt-4">
              {/* Post Property Mobile */}
              <Link
                href={isAuthenticated ? "/post-property" : "/auth/register"}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
              >
                <PlusCircle className="h-4 w-4" />
                Post Property
              </Link>

              {isAuthenticated && user ? (
                <>
                  {user.role === "admin" ? (
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2 rounded-lg" asChild>
                      <Link href="/admin/dashboard" onClick={() => setMobileOpen(false)}>
                        <LayoutDashboard className="h-4 w-4" />
                        Admin Panel
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2 rounded-lg" asChild>
                      <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                        <User className="h-4 w-4" />
                        My Profile
                      </Link>
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground" onClick={() => setShowLogoutConfirm(true)}>
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="w-full rounded-lg" asChild>
                    <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button size="sm" className="w-full rounded-full" asChild>
                    <Link href="/auth/register" onClick={() => setMobileOpen(false)}>
                      Register
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}

      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? {user?.role === "admin" ? "You will be logged out from both the admin panel and the website." : "You will be logged out from your account."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  )
}
