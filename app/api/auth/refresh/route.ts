import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyRefreshToken, signToken, getCookieNamesForRole, type UserRole } from "@/lib/auth"
import { getUserById } from "@/lib/users-db"

export async function POST(request: NextRequest) {
    try {
        // Since we are moving to cookies, we should check both body and cookie for refresh token
        // But the previous implementation expected it in the body.
        const body = await request.json().catch(() => ({}))
        let refreshToken = body.refreshToken

        if (!refreshToken) {
            // Check cookie as backup
            const cookieStore = await cookies()
            // To know which cookie to check, we might need a hint, but we can try both
            const userRefresh = cookieStore.get("user-refresh-token")?.value
            const adminRefresh = cookieStore.get("admin-refresh-token")?.value
            refreshToken = userRefresh || adminRefresh
        }

        if (!refreshToken) {
            return NextResponse.json(
                { success: false, message: "Refresh token is required" },
                { status: 400 }
            )
        }

        const decoded = verifyRefreshToken(refreshToken)
        if (!decoded) {
            return NextResponse.json(
                { success: false, message: "Invalid or expired refresh token" },
                { status: 401 }
            )
        }

        // Verify user still exists and is active
        const user = await getUserById(decoded.userId)
        if (!user) {
            return NextResponse.json(
                { success: false, message: "User no longer exists" },
                { status: 401 }
            )
        }

        // Issue new access token
        const tokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role as UserRole,
            name: user.name,
            phone: (user as any).phone,
        }
        const token = signToken(tokenPayload)

        // Set role-scoped HTTP Only Cookie
        const role = user.role.toLowerCase() as UserRole
        const cookieNames = getCookieNamesForRole(role)
        const cookieStore = await cookies()

        cookieStore.set(cookieNames.token, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24, // 24 hours
            path: "/",
        })

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
                subscriptionActive: user.subscriptionActive,
                trialEndsAt: user.trialEndsAt,
            },
        })
    } catch (error) {
        console.error("Token refresh error:", error)
        return NextResponse.json(
            { success: false, message: "Token refresh failed" },
            { status: 500 }
        )
    }
}
