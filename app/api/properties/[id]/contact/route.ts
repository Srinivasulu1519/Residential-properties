import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isSubscriptionEnforcementEnabled } from "@/lib/subscription-settings"

/**
 * GET /api/properties/[id]/contact — get rental owner contact details
 * 
 * Implements 7 free contact views per user.
 * After 7 views, user must subscribe to see more contacts.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const decoded = getUserFromRequest(request)
        if (!decoded) {
            return NextResponse.json(
                { success: false, message: "Please login to view owner contact details" },
                { status: 401 }
            )
        }

        const { id: propertyId } = await params

        // Get property with owner details
        const property = await prisma.property.findUnique({
            where: { id: propertyId },
            select: {
                id: true,
                title: true,
                type: true,
                listingPurpose: true,
                ownerName: true,
                ownerPhone: true,
                ownerEmail: true,
            },
        })

        if (!property) {
            return NextResponse.json(
                { success: false, message: "Property not found" },
                { status: 404 }
            )
        }

        // Check if contact details exist
        if (!property.ownerPhone && !property.ownerEmail) {
            return NextResponse.json(
                { success: false, message: "No owner contact details available for this property" },
                { status: 404 }
            )
        }

        // Admin can always view contacts
        if (decoded.role === "admin") {
            return NextResponse.json({
                success: true,
                contact: {
                    ownerName: property.ownerName,
                    ownerPhone: property.ownerPhone,
                    ownerEmail: property.ownerEmail,
                },
            })
        }

        // Check if user already viewed this contact (doesn't count again)
        const existingView = await prisma.contactView.findUnique({
            where: {
                userId_propertyId: {
                    userId: decoded.userId,
                    propertyId,
                },
            },
        })

        if (existingView) {
            // Already viewed — return contact without counting
            return NextResponse.json({
                success: true,
                contact: {
                    ownerName: property.ownerName,
                    ownerPhone: property.ownerPhone,
                    ownerEmail: property.ownerEmail,
                },
                viewsUsed: (await prisma.user.findUnique({ where: { id: decoded.userId } }))?.contactViewsUsed || 0,
                viewsLimit: 7,
                alreadyViewed: true,
            })
        }

        // Get user to check limits
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
        })

        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            )
        }

        // Check if user has active subscription
        const hasAccess = user.subscriptionActive || user.contactViewsUsed < user.contactViewsLimit

        // If admin has disabled subscription enforcement, allow access regardless of limits
        const enforcementEnabled = await isSubscriptionEnforcementEnabled()

        if (!hasAccess && enforcementEnabled) {
            return NextResponse.json(
                {
                    success: false,
                    message: "You have used all your free contact views. Subscribe to continue viewing owner details.",
                    viewsUsed: user.contactViewsUsed,
                    viewsLimit: user.contactViewsLimit,
                    requiresSubscription: true,
                },
                { status: 403 }
            )
        }

        // Record the view and increment counter
        await Promise.all([
            prisma.contactView.create({
                data: {
                    userId: decoded.userId,
                    propertyId,
                },
            }),
            prisma.user.update({
                where: { id: decoded.userId },
                data: { contactViewsUsed: { increment: 1 } },
            }),
        ])

        return NextResponse.json({
            success: true,
            contact: {
                ownerName: property.ownerName,
                ownerPhone: property.ownerPhone,
                ownerEmail: property.ownerEmail,
            },
            viewsUsed: user.contactViewsUsed + 1,
            viewsLimit: user.contactViewsLimit,
        })
    } catch (error) {
        console.error("Contact view error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to get contact details" },
            { status: 500 }
        )
    }
}
