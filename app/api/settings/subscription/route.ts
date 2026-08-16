import { NextResponse } from "next/server"
import { getSubscriptionPricing } from "@/lib/settings"

export async function GET() {
    try {
        const pricing = await getSubscriptionPricing()

        return NextResponse.json({
            success: true,
            pricing,
        })
    } catch (error) {
        console.error("Subscription settings GET error:", error)
        return NextResponse.json({ success: false, message: "Failed to fetch pricing" }, { status: 500 })
    }
}
