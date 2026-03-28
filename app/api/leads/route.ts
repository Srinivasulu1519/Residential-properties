import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createInAppNotification } from "@/lib/notifications"

export async function POST(request: NextRequest) {
    try {
        const user = getUserFromRequest(request)
        if (!user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
        }

        const { propertyId } = await request.json()
        if (!propertyId) {
            return NextResponse.json({ success: false, message: "Property ID is required" }, { status: 400 })
        }

        // Fetch full user to check for phone number (mandatory for leads)
        const currentUser = await prisma.user.findUnique({
            where: { id: user.userId },
            select: { phone: true }
        })

        if (!currentUser?.phone) {
            return NextResponse.json({ 
                success: false, 
                message: "Please add a contact number to your profile before expressing interest." 
            }, { status: 400 })
        }

        // Check if property exists
        const property = await prisma.property.findUnique({
            where: { id: propertyId }
        })

        if (!property) {
            return NextResponse.json({ success: false, message: "Property not found" }, { status: 404 })
        }

        // Create or update lead (prevent duplicate interest for the same user-property pair)
        // @ts-ignore - Prisma client needs regeneration/IDE sync to see 'lead' model
        const lead = await prisma.lead.upsert({
            where: {
                userId_propertyId: {
                    userId: user.userId,
                    propertyId: propertyId
                }
            },
            update: {}, // Just update the timestamp or similar if needed
            create: {
                userId: user.userId,
                propertyId: propertyId
            }
        })

        // Add notification for the property owner
        if (property.postedById) {
            await createInAppNotification(
                property.postedById,
                "LEAD",
                "New Interest in your Property",
                `A user has expressed interest in your property: ${property.title}.`,
                propertyId
            )
        }

        return NextResponse.json({
            success: true,
            message: "Interest expressed successfully",
            lead
        })
    } catch (error) {
        console.error("Lead creation error:", error)
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
    }
}
