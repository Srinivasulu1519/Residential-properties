import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/user/my-properties — list all properties posted by the authenticated user
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

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        })

        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            )
        }

        const properties = await prisma.property.findMany({
            where: { postedById: decoded.userId },
            orderBy: { createdAt: "desc" },
        })

        const now = new Date()
        const isUserTrialExpired = user.trialEndsAt && now > user.trialEndsAt && !user.subscriptionActive && user.role !== "ADMIN"

        const propertiesWithStatus = properties.map((p) => ({
            ...p,
            type: p.type.toLowerCase(),
            status: p.status.toLowerCase(),
            createdAt: p.createdAt.toISOString(),
            updatedAt: p.updatedAt.toISOString(),
            expiresAt: p.expiresAt?.toISOString() || null,
            isExpired: p.expiresAt ? now > p.expiresAt : false,
            isInactive: isUserTrialExpired,
            isActive: (p as any).isActive,
            daysRemaining: p.expiresAt
                ? Math.max(0, Math.ceil((p.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
                : null,
        }))

        return NextResponse.json({
            success: true,
            properties: propertiesWithStatus,
            total: propertiesWithStatus.length,
            active: propertiesWithStatus.filter((p) => !p.isExpired).length,
            expired: propertiesWithStatus.filter((p) => p.isExpired).length,
        })
    } catch (error) {
        console.error("My properties error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to fetch your properties" },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/user/my-properties — remove own listing
 * Body: { propertyId: string }
 */
export async function DELETE(request: NextRequest) {
    try {
        const decoded = getUserFromRequest(request)
        if (!decoded) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            )
        }

        const { propertyId } = await request.json()
        if (!propertyId) {
            return NextResponse.json(
                { success: false, message: "propertyId is required" },
                { status: 400 }
            )
        }

        // Verify ownership
        const property = await prisma.property.findUnique({
            where: { id: propertyId },
        })

        if (!property) {
            return NextResponse.json(
                { success: false, message: "Property not found" },
                { status: 404 }
            )
        }

        if (property.postedById !== decoded.userId && decoded.role !== "admin") {
            return NextResponse.json(
                { success: false, message: "You can only delete your own properties" },
                { status: 403 }
            )
        }

        // Delete related records first
        await prisma.lead.deleteMany({ where: { propertyId } })
        await prisma.contactView.deleteMany({ where: { propertyId } })
        await prisma.notification.deleteMany({ where: { propertyId } })
        await prisma.property.delete({ where: { id: propertyId } })

        return NextResponse.json({
            success: true,
            message: "Property deleted successfully",
        })
    } catch (error) {
        console.error("Delete my property error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to delete property" },
            { status: 500 }
        )
    }
}
