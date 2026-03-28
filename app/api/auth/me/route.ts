import { NextRequest, NextResponse } from "next/server"
import { getUserByRole, getUserFromRequest, type UserRole } from "@/lib/auth"

export async function GET(request: NextRequest) {
    try {
        const roleHint = request.nextUrl.searchParams.get("role") as UserRole | null

        let user = null

        if (roleHint) {
            // STRICT: only return the user from the requested role's cookie.
            // Do NOT fall back to the other role — this prevents admin session
            // from leaking into user tabs and vice versa.
            user = getUserByRole(request, roleHint)

            if (!user) {
                return NextResponse.json(
                    { success: false, message: "Not authenticated for this role" },
                    { status: 401 }
                )
            }
        } else {
            // No role hint: try any available cookie (legacy behavior)
            user = getUserFromRequest(request)
        }

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Not authenticated" },
                { status: 401 }
            )
        }

        // Fetch fresh status from DB
        const { getUserById } = await import("@/lib/users-db")
        const fullUser = await getUserById((user as any).userId)

        return NextResponse.json({
            success: true,
            user: {
                id: (user as any).userId,
                name: (user as any).name,
                email: fullUser?.email,
                phone: fullUser?.phone,
                role: (user as any).role,
                subscriptionActive: fullUser?.subscriptionActive ?? false,
                trialEndsAt: fullUser?.trialEndsAt 
            }
        })
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Failed to authenticate session" },
            { status: 500 }
        )
    }
}
