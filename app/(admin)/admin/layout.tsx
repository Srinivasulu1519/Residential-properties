"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { AdminAuthProvider, useAdminAuth } from "@/lib/admin-auth"
import { PropertyProvider } from "@/lib/property-context"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { AdminSidebar } from "@/components/admin-sidebar"

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAdminAuth()
  const pathname = usePathname()

  // Lock root scrolling while in admin to prevent double scrollbars
  useEffect(() => {
    document.documentElement.style.overflow = "hidden"
    document.body.style.overflow = "hidden"
    return () => {
      document.documentElement.style.overflow = ""
      document.body.style.overflow = ""
    }
  }, [])

  // Don't wrap the login page in the admin sidebar layout
  if (pathname === "/admin") {
    return <>{children}</>
  }

  // Redirect to login if not authenticated or not admin
  if (!isAuthenticated || user?.role !== "admin") {
    return <AdminLoginRedirect />
  }

  return (
    <PropertyProvider>
      <div className="fixed inset-0 flex overflow-hidden bg-background">
        <AdminSidebar />
        <div className="flex flex-1 flex-col overflow-hidden relative">
          <header className="flex h-16 shrink-0 items-center border-b bg-card px-6 z-10">
            <Breadcrumbs />
          </header>
          <main className="flex-1 overflow-y-auto overflow-x-hidden [scrollbar-gutter:stable] bg-slate-50">
            <div className="mx-auto min-h-full max-w-7xl px-6 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </PropertyProvider>
  )
}

function AdminLoginRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.push("/admin")
  }, [router])
  return null
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminAuthProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminAuthProvider>
  )
}
