import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
    try {
        const decoded = getUserFromRequest(request)
        if (!decoded) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
        }

        // Simulate payment success and upgrade user
        const updatedUser = await prisma.user.update({
            where: { id: decoded.userId },
            data: {
                subscriptionActive: true,
                contactViewsLimit: 9999, // Essentially unlimited
                trialEndsAt: null // Full access
            }
        })

        return NextResponse.json({
            success: true,
            message: "Successfully upgraded to Premium!",
            user: {
                subscriptionActive: updatedUser.subscriptionActive,
                contactViewsLimit: updatedUser.contactViewsLimit
            }
        })
    } catch (error) {
        console.error("Upgrade error:", error)
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
    }
}
