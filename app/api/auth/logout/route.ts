import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { ADMIN_TOKEN_COOKIE, USER_TOKEN_COOKIE, ADMIN_REFRESH_COOKIE, USER_REFRESH_COOKIE, getTokenFromRequest, decodeTokenUnsafe } from "@/lib/auth"
import { blacklistToken } from "@/lib/token-blacklist"

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies()
        
        // ─── JTI Blacklisting: Revoke the current token ─────────
        // Extract the token from the request to get its JTI
        const token = getTokenFromRequest(request)
        if (token) {
            const decoded = decodeTokenUnsafe(token)
            if (decoded?.jti && decoded?.exp) {
                // Add the JTI to the blacklist with TTL = token's remaining lifespan
                blacklistToken(decoded.jti, decoded.exp)
            }
        }

        // ─── Cookie Cleanup ──────────────────────────────────────
        let roleToLogout: string | null = null
        try {
            const body = await request.json()
            roleToLogout = body.role
        } catch {
            // No body provided
        }

        if (roleToLogout === "admin") {
            cookieStore.set(ADMIN_TOKEN_COOKIE, "", { maxAge: 0, path: "/" })
            cookieStore.set(ADMIN_REFRESH_COOKIE, "", { maxAge: 0, path: "/" })
        } else if (roleToLogout === "user") {
            cookieStore.set(USER_TOKEN_COOKIE, "", { maxAge: 0, path: "/" })
            cookieStore.set(USER_REFRESH_COOKIE, "", { maxAge: 0, path: "/" })
        } else {
            // Fallback: Clear all role-scoped cookies if no specific role is provided
            cookieStore.set(ADMIN_TOKEN_COOKIE, "", { maxAge: 0, path: "/" })
            cookieStore.set(USER_TOKEN_COOKIE, "", { maxAge: 0, path: "/" })
            cookieStore.set(ADMIN_REFRESH_COOKIE, "", { maxAge: 0, path: "/" })
            cookieStore.set(USER_REFRESH_COOKIE, "", { maxAge: 0, path: "/" })
        }

        // Legacy cleanup
        cookieStore.set("auth-token", "", { maxAge: 0, path: "/" })
        cookieStore.set("refresh-token", "", { maxAge: 0, path: "/" })

        return NextResponse.json({ success: true, message: "Logged out successfully" })
    } catch (error) {
        return NextResponse.json({ success: false, message: "Logout failed" }, { status: 500 })
    }
}
