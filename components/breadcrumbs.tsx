"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

export function Breadcrumbs() {
    const pathname = usePathname()
    const pathSegments = pathname.split("/").filter((segment) => segment !== "")

    // Don't show breadcrumbs on the dashboard itself or login
    if (pathname === "/admin" || pathname === "/admin/dashboard") {
        return null
    }

    return (
        <nav aria-label="Breadcrumb" className="flex items-center text-sm font-medium">
            <ol className="flex items-center gap-2">
                <li>
                    <Link
                        href="/admin/dashboard"
                        className="flex items-center text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <Home className="h-4 w-4" />
                        <span className="sr-only">Admin Dashboard</span>
                    </Link>
                </li>

                {pathSegments.map((segment, index) => {
                    // Skip 'admin' if it's the first segment to keep it cleaner
                    if (segment === "admin" && index === 0) return null

                    const href = `/${pathSegments.slice(0, index + 1).join("/")}`
                    const isLast = index === pathSegments.length - 1

                    // Format segment name (e.g., 'new' -> 'New', 'property-list' -> 'Property List')
                    const label = segment
                        .replace(/-/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())

                    return (
                        <li key={href} className="flex items-center gap-2">
                            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                            {isLast ? (
                                <span className="text-foreground font-semibold" aria-current="page">
                                    {label}
                                </span>
                            ) : (
                                <Link
                                    href={href}
                                    className="text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    {label}
                                </Link>
                            )}
                        </li>
                    )
                })}
            </ol>
        </nav>
    )
}
