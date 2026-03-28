import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getAllUsers, createUser } from "@/lib/users-db"
import { sendWelcomeEmail, sendAdminNewUserNotification } from "@/lib/email"

// GET - List all users (admin only)
export async function GET(request: NextRequest) {
    const authResult = requireAuth(request, "admin")
    if ("error" in authResult) {
        return NextResponse.json(
            { success: false, message: authResult.error },
            { status: authResult.status }
        )
    }

    try {
        const users = await getAllUsers()
        return NextResponse.json({ success: true, users })
    } catch (error) {
        console.error("Failed to fetch users:", error)
        return NextResponse.json(
            { success: false, message: "Failed to fetch users" },
            { status: 500 }
        )
    }
}

// POST - Create a new user/admin (admin only)
export async function POST(request: NextRequest) {
    const authResult = requireAuth(request, "admin")
    if ("error" in authResult) {
        return NextResponse.json(
            { success: false, message: authResult.error },
            { status: authResult.status }
        )
    }

    try {
        const { name, email, password, role } = await request.json()

        if (!name || !email || !password) {
            return NextResponse.json(
                { success: false, message: "Name, email, and password are required" },
                { status: 400 }
            )
        }

        if (password.length < 6) {
            return NextResponse.json(
                { success: false, message: "Password must be at least 6 characters" },
                { status: 400 }
            )
        }

        const validRoles = ["admin", "user"]
        const userRole = validRoles.includes(role) ? role : "user"

        const user = await createUser(name, email, password, userRole)

        // Send emails (fire-and-forget)
        sendWelcomeEmail(name, email)
        sendAdminNewUserNotification(name, email, userRole)

        return NextResponse.json(
            { success: true, message: `${userRole === "admin" ? "Admin" : "User"} created successfully`, user },
            { status: 201 }
        )
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to create user"
        const status = message.includes("already exists") ? 409 : 500
        return NextResponse.json({ success: false, message }, { status })
    }
}
