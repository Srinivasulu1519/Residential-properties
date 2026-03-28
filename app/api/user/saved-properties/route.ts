import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { toggleSavedProperty, logUserActivity } from "@/lib/users-db"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
    try {
        const decoded = getUserFromRequest(request)
        if (!decoded) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: { 
                savedProperties: {
                    orderBy: { createdAt: "desc" }
                }
            }
        })
        
        if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })

        return NextResponse.json({
            success: true,
            properties: user.savedProperties
        })
    } catch (error) {
        console.error("Error fetching saved properties:", error)
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const decoded = getUserFromRequest(request)
        if (!decoded) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })

        const { propertyId } = await request.json()
        if (!propertyId) return NextResponse.json({ success: false, message: "Property ID required" }, { status: 400 })

        const savedProperties = await toggleSavedProperty(decoded.userId, propertyId)

        // Find property title for logging
        const property = await prisma.property.findUnique({
            where: { id: propertyId }
        })
        const propertyTitle = property?.title || "Property"
        
        const isSaved = savedProperties.includes(propertyId)
        await logUserActivity(
            decoded.userId,
            `${isSaved ? "Saved" : "Unsaved"} ${propertyTitle}`,
            isSaved ? "heart" : "general"
        )

        return NextResponse.json({
            success: true,
            savedProperties
        })
    } catch (error) {
        console.error("Error toggling saved property:", error)
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
    }
}
