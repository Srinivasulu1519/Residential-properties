import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import crypto from "crypto"

export async function POST(request: NextRequest) {
    try {
        const user = getUserFromRequest(request)
        if (!user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
        }

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json()

        const key_secret = process.env.RAZORPAY_KEY_SECRET
        if (!key_secret) {
            return NextResponse.json({ success: false, message: "Razorpay secret not configured" }, { status: 500 })
        }

        // Verify Razorpay signature
        const expectedSignature = crypto
            .createHmac("sha256", key_secret)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex")

        if (expectedSignature !== razorpay_signature) {
            return NextResponse.json({ success: false, message: "Invalid payment signature" }, { status: 400 })
        }

        // Signature verified! Upgrade user to Premium
        const { prisma } = await import("@/lib/prisma")
        
        // Use Prisma to upgrade user
        const updatedUser = await prisma.user.update({
            where: { id: (user as any).userId },
            data: {
                subscriptionActive: true,
                trialEndsAt: null // Full premium doesn't need trial countdown
            }
        })

        return NextResponse.json({
            success: true,
            message: "Payment verified and account upgraded to Premium!",
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                subscriptionActive: updatedUser.subscriptionActive
            }
        })
    } catch (error) {
        console.error("Razorpay verification error:", error)
        return NextResponse.json({ success: false, message: "Verification failed" }, { status: 500 })
    }
}
