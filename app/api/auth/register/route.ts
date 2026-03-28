import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createUser } from "@/lib/users-db"
import { signToken, signRefreshToken, getCookieNamesForRole, type UserRole } from "@/lib/auth"
import { sendAdminNewUserNotification } from "@/lib/email"
import { notifyOnRegistration } from "@/lib/notifications"
import { decryptPayload } from "@/lib/encryption"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        let { name, email, password, phone } = body

        // Handle encrypted payloads for visual security in DevTools
        if (body.encryptedData) {
            const decrypted = decryptPayload(body.encryptedData)
            if (decrypted) {
                name = decrypted.name
                email = decrypted.email
                password = decrypted.password
                phone = decrypted.phone
            }
        }

        if (!name || !email || !password || !phone) {
            return NextResponse.json(
                { success: false, message: "Name, email, password, and phone number are required" },
                { status: 400 }
            )
        }

        if (password.length < 6) {
            return NextResponse.json(
                { success: false, message: "Password must be at least 6 characters" },
                { status: 400 }
            )
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, message: "Invalid email format" },
                { status: 400 }
            )
        }

        const user = await createUser(name, email, password, "user", phone)

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
        const role = (user.role as string).toLowerCase() as UserRole
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

        // Send notifications (fire-and-forget)
        notifyOnRegistration({ id: user.id, name, email, phone })
        sendAdminNewUserNotification(name, email, "user")

        return NextResponse.json(
            {
                success: true,
                message: "Registration successful",
                token, // Return token for sessionStorage isolation
                user: {
                    id: user.id,
                    name: user.name,
                    role: user.role,
                    trialEndsAt: user.trialEndsAt,
                    subscriptionActive: user.subscriptionActive,
                },
            },
            { status: 201 }
        )
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Registration failed"
        const status = message.includes("already exists") ? 409 : 500
        return NextResponse.json({ success: false, message }, { status })
    }
}
