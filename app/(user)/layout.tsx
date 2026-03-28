"use client"

import { Suspense } from "react"
import { PropertyProvider } from "@/lib/property-context"
import { AdminAuthProvider } from "@/lib/admin-auth"

export default function UserLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <Suspense>
            <AdminAuthProvider>
                <PropertyProvider>
                    {children}
                </PropertyProvider>
            </AdminAuthProvider>
        </Suspense>
    )
}
