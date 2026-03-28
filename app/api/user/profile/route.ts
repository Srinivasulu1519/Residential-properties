import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { updateUser, logUserActivity } from "@/lib/users-db"

export async function PATCH(request: NextRequest) {
    try {
        const decoded = getUserFromRequest(request)
        if (!decoded) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })

        const { name, phone } = await request.json()

        const updatedUser = await updateUser(decoded.userId, { name, phone })
        await logUserActivity(decoded.userId, "Profile updated", "account")

        return NextResponse.json({
            success: true,
            user: updatedUser
        })
    } catch (error) {
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
    }
}
