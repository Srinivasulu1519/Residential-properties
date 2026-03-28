import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json(
                { success: false, message: "Email is required" },
                { status: 400 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        })

        if (!user) {
            // For security reasons, don't reveal if the user exists
            return NextResponse.json({ success: true, message: "If the email is valid, a link has been sent." })
        }

        // Generate a random token
        const resetToken = crypto.randomBytes(32).toString('hex')
        const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry
            }
        })

        // Simulate sending email by logging in development, or integrate via Twilio SendGrid
        const resetUrl = `${request.nextUrl.origin}/auth/reset-password?token=${resetToken}`
        console.log(`[AUTH] Password reset link for ${user.email}: ${resetUrl}`)

        return NextResponse.json({
            success: true,
            message: "If the email is valid, a link has been sent."
        })
    } catch (error) {
        console.error("Forgot password error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to process request" },
            { status: 500 }
        )
    }
}
