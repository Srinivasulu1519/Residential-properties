import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/user/notifications — fetch user's notifications (paginated)
 */
export async function GET(request: NextRequest) {
    try {
        const decoded = getUserFromRequest(request)
        if (!decoded) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "20")
        const unreadOnly = searchParams.get("unread") === "true"

        const where: any = { userId: decoded.userId }
        if (unreadOnly) {
            where.isRead = false
        }

        const [notifications, total, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    property: {
                        select: { id: true, title: true, type: true, city: true, images: true },
                    },
                },
            }),
            prisma.notification.count({ where }),
            prisma.notification.count({ where: { userId: decoded.userId, isRead: false } }),
        ])

        return NextResponse.json({
            success: true,
            notifications: notifications.map((n) => ({
                ...n,
                createdAt: n.createdAt.toISOString(),
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            unreadCount,
        })
    } catch (error) {
        console.error("Notification fetch error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to fetch notifications" },
            { status: 500 }
        )
    }
}

/**
 * PATCH /api/user/notifications — mark notifications as read
 * Body: { notificationIds: string[] } or { markAllRead: true }
 */
export async function PATCH(request: NextRequest) {
    try {
        const decoded = getUserFromRequest(request)
        if (!decoded) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            )
        }

        const body = await request.json()

        if (body.markAllRead) {
            await prisma.notification.updateMany({
                where: { userId: decoded.userId, isRead: false },
                data: { isRead: true },
            })
        } else if (body.notificationIds && Array.isArray(body.notificationIds)) {
            await prisma.notification.updateMany({
                where: {
                    id: { in: body.notificationIds },
                    userId: decoded.userId,
                },
                data: { isRead: true },
            })
        } else {
            return NextResponse.json(
                { success: false, message: "Provide notificationIds array or markAllRead: true" },
                { status: 400 }
            )
        }

        return NextResponse.json({
            success: true,
            message: "Notifications updated",
        })
    } catch (error) {
        console.error("Notification update error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to update notifications" },
            { status: 500 }
        )
    }
}
