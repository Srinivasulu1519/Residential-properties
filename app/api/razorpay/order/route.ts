import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getSubscriptionPricing } from "@/lib/settings"

export async function POST(request: NextRequest) {
    try {
        const user = getUserFromRequest(request)
        if (!user) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
        }

        const key_id = process.env.RAZORPAY_KEY_ID
        const key_secret = process.env.RAZORPAY_KEY_SECRET

        if (!key_id || !key_secret) {
            return NextResponse.json({ success: false, message: "Razorpay keys not configured" }, { status: 500 })
        }

        // Fetch dynamic pricing from DB (admin-managed)
        const pricing = await getSubscriptionPricing()
        const amount = pricing.totalPaise // Total including GST, in paise for Razorpay
        const currency = "INR"
        const receipt = `receipt_${Date.now()}`

        // Create Razorpay Order via Fetch API to avoid dependency issues on this system
        const auth = Buffer.from(`${key_id}:${key_secret}`).toString("base64")
        
        const response = await fetch("https://api.razorpay.com/v1/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Basic ${auth}`
            },
            body: JSON.stringify({
                amount,
                currency,
                receipt,
            })
        })

        const order = await response.json()

        if (!response.ok) {
            console.error("Razorpay order creation error:", order)
            return NextResponse.json({ 
                success: false, 
                message: order.error?.description || "Failed to create payment order" 
            }, { status: 400 })
        }

        return NextResponse.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: key_id // Send public key to frontend
        })
    } catch (error) {
        console.error("Razorpay order API error:", error)
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
    }
}
