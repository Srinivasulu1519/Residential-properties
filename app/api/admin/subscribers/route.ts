import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/admin/subscribers — list all premium subscribers
 */
export async function GET(request: NextRequest) {
    try {
        const auth = requireAuth(request, "admin")
        if ("error" in auth) {
            return NextResponse.json({ error: auth.error }, { status: auth.status })
        }

        const subscribers = await prisma.user.findMany({
            where: {
                subscriptionActive: true,
                role: "USER",
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                subscriptionActive: true,
                contactViewsUsed: true,
                contactViewsLimit: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
        })

        // Also get users still on free trial
        const freeUsers = await prisma.user.findMany({
            where: {
                subscriptionActive: false,
                role: "USER",
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                subscriptionActive: true,
                contactViewsUsed: true,
                contactViewsLimit: true,
                trialEndsAt: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
        })

        const now = new Date()
        const freeUsersWithStatus = freeUsers.map((u) => ({
            ...u,
            trialEndsAt: u.trialEndsAt?.toISOString() || null,
            createdAt: u.createdAt.toISOString(),
            isTrialExpired: u.trialEndsAt ? now > u.trialEndsAt : false,
            daysRemaining: u.trialEndsAt
                ? Math.max(0, Math.ceil((u.trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
                : null,
        }))

        return NextResponse.json({
            success: true,
            subscribers: subscribers.map((s) => ({
                ...s,
                createdAt: s.createdAt.toISOString(),
            })),
            freeUsers: freeUsersWithStatus,
            totalPremium: subscribers.length,
            totalFree: freeUsers.length,
            totalExpired: freeUsersWithStatus.filter((u) => u.isTrialExpired).length,
        })
    } catch (error) {
        console.error("Subscribers error:", error)
        return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 })
    }
}
