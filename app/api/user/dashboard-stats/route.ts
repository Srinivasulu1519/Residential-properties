import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
    try {
        const decoded = getUserFromRequest(request)
        if (!decoded) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: {
                savedProperties: { select: { id: true } },
                activities: {
                    orderBy: { date: "desc" },
                    take: 20
                }
            }
        })

        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            )
        }

        // Count recent activities (last 7 days)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const recentActivityCount = await prisma.activity.count({
            where: {
                userId: decoded.userId,
                date: { gte: sevenDaysAgo }
            }
        })

        // Count posted properties
        const now = new Date()
        const postedProperties = await prisma.property.findMany({
            where: { postedById: decoded.userId },
            select: { id: true, title: true, status: true, expiresAt: true, viewCount: true, createdAt: true },
            orderBy: { createdAt: "desc" },
            take: 10,
        })

        const activeListings = postedProperties.filter(
            (p) => !p.expiresAt || p.expiresAt > now
        ).length
        const expiredListings = postedProperties.filter(
            (p) => p.expiresAt && p.expiresAt <= now
        ).length

        // Unread notifications count
        const unreadNotifications = await prisma.notification.count({
            where: { userId: decoded.userId, isRead: false }
        })

        // Leads count for user's properties
        const totalLeads = await prisma.lead.count({
            where: { property: { postedById: decoded.userId } }
        })

        // Get lead counts per property
        const propertyLeadCounts = await prisma.lead.groupBy({
            by: ['propertyId'],
            where: { property: { postedById: decoded.userId } },
            _count: { _all: true }
        })

        const leadCountsMap = Object.fromEntries(
            propertyLeadCounts.map(lc => [lc.propertyId, lc._count._all])
        )

        // Trial status
        let trialDaysLeft = null
        if (user.trialEndsAt) {
            trialDaysLeft = Math.max(0, Math.ceil(
                (user.trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            ))
        }

        return NextResponse.json({
            success: true,
            stats: {
                savedProperties: user.savedProperties.length,
                searchHistoryCount: user.searchHistory.length,
                recentActivityCount,
                memberSince: user.createdAt.toISOString(),
                totalActivities: user.activities.length,
                // New stats
                postedProperties: postedProperties.length,
                activeListings,
                expiredListings,
                recentListings: postedProperties.map((p) => ({
                    id: p.id,
                    title: p.title,
                    status: p.status.toLowerCase(),
                    expiresAt: p.expiresAt?.toISOString() || null,
                    isExpired: p.expiresAt ? now > p.expiresAt : false,
                    viewCount: p.viewCount,
                    createdAt: p.createdAt.toISOString(),
                    leadsCount: leadCountsMap[p.id] || 0,
                })),
                contactViewsUsed: user.contactViewsUsed,
                contactViewsLimit: user.contactViewsLimit,
                unreadNotifications,
                trialDaysLeft,
                subscriptionActive: user.subscriptionActive,
                totalLeads,
            }
        })
    } catch (error) {
        console.error("Dashboard stats error:", error)
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        )
    }
}
