import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
    try {
        const { token, password } = await request.json()

        if (!token || !password) {
            return NextResponse.json(
                { success: false, message: "Token and password are required" },
                { status: 400 }
            )
        }

        if (password.length < 6) {
            return NextResponse.json(
                { success: false, message: "Password must be at least 6 characters" },
                { status: 400 }
            )
        }

        // Find user by valid reset token
        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    gt: new Date() // Token hasn't expired
                }
            }
        })

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Invalid or expired reset token. Please request a new link." },
                { status: 400 }
            )
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Update user, clearing the reset token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        })

        return NextResponse.json({
            success: true,
            message: "Password updated successfully"
        })
    } catch (error) {
        console.error("Reset password error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to reset password" },
            { status: 500 }
        )
    }
}
