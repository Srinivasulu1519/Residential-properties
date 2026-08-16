import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getUserByEmail, verifyPassword, logUserActivity } from "@/lib/users-db"
import { signToken, signRefreshToken, getCookieNamesForRole, type UserRole } from "@/lib/auth"
import { notifyOnLogin } from "@/lib/notifications"
import { decryptPayload } from "@/lib/encryption"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        let { email, password } = body

        // Handle encrypted payloads for visual security in DevTools
        if (body.encryptedData) {
            const decrypted = decryptPayload(body.encryptedData)
            if (decrypted) {
                email = decrypted.email
                password = decrypted.password
            }
        }

        if (!email || !password) {
            return NextResponse.json(
                { success: false, message: "Email and password are required" },
                { status: 400 }
            )
        }

        const user = await getUserByEmail(email)
        if (!user) {
            return NextResponse.json(
                { success: false, message: "Invalid email or password" },
                { status: 401 }
            )
        }

        const isValid = await verifyPassword(user, password)
        if (!isValid) {
            return NextResponse.json(
                { success: false, message: "Invalid email or password" },
                { status: 401 }
            )
        }

        const tokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role as UserRole,
            name: user.name,
            phone: user.phone,
        }

        const token = signToken(tokenPayload)
        const refreshToken = signRefreshToken(tokenPayload)
        
        // Set role-scoped HTTP Only Cookies
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
        cookieStore.set(cookieNames.refresh, refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        })

        // Admin gets both cookies so the user-facing site also recognizes them
        if (role === "admin") {
            const userCookieNames = getCookieNamesForRole("user")
            cookieStore.set(userCookieNames.token, token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 60 * 60 * 24,
                path: "/",
            })
            cookieStore.set(userCookieNames.refresh, refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 60 * 60 * 24 * 7,
                path: "/",
            })
        }

        // Clear legacy single auth-token cookies to prevent session conflicts
        cookieStore.set("auth-token", "", { maxAge: 0, path: "/" })
        cookieStore.set("refresh-token", "", { maxAge: 0, path: "/" })

        // Log activity and send notifications (fire-and-forget)
        logUserActivity(user.id, "Logged in", "login")
        notifyOnLogin({ id: user.id, name: user.name, email: user.email, phone: user.phone })

        return NextResponse.json({
            success: true,
            message: "Login successful",
            token, // Return token for sessionStorage isolation
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
                trialEndsAt: user.trialEndsAt,
                subscriptionActive: user.subscriptionActive,
            },
        })
    } catch (error) {
        console.error("Login error:", error)
        return NextResponse.json(
            { success: false, message: "Login failed" },
            { status: 500 }
        )
    }
}
