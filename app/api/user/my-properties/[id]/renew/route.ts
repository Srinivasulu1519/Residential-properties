import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const decoded = getUserFromRequest(request)
        if (!decoded) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
        }

        const { id: propertyId } = await params

        // Verify ownership
        const property = await prisma.property.findUnique({
            where: { id: propertyId }
        })

        if (!property) {
            return NextResponse.json({ success: false, message: "Property not found" }, { status: 404 })
        }

        if (property.postedById !== decoded.userId && decoded.role !== "admin") {
            return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
        }

        // Renew listing: Extend expiry by 30 days
        const newExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        
        await prisma.property.update({
            where: { id: propertyId },
            data: { 
                expiresAt: newExpiry,
                status: "AVAILABLE" // Reactivate if it was expired
            }
        })

        return NextResponse.json({
            success: true,
            message: "Listing renewed for another 30 days!",
            expiresAt: newExpiry
        })
    } catch (error) {
        console.error("Renew property error:", error)
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
    }
}
