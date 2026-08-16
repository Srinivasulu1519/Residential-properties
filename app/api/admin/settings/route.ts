import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { getSubscriptionPricing, updateSubscriptionPrice, updateGstPercentage } from "@/lib/settings"

export async function GET(request: NextRequest) {
    try {
        const user = getUserFromRequest(request)
        if (!user || user.role !== "admin") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
        }

        const pricing = await getSubscriptionPricing()

        return NextResponse.json({
            success: true,
            pricing,
        })
    } catch (error) {
        console.error("Admin settings GET error:", error)
        return NextResponse.json({ success: false, message: "Failed to fetch settings" }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const user = getUserFromRequest(request)
        if (!user || user.role !== "admin") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { basePrice, gstPercentage } = body

        let pricing

        if (basePrice !== undefined) {
            const price = parseFloat(basePrice)
            if (isNaN(price) || price <= 0 || price > 99999) {
                return NextResponse.json(
                    { success: false, message: "Price must be between ₹1 and ₹99,999" },
                    { status: 400 }
                )
            }
            pricing = await updateSubscriptionPrice(price)
        }

        if (gstPercentage !== undefined) {
            const gst = parseFloat(gstPercentage)
            if (isNaN(gst) || gst < 0 || gst > 100) {
                return NextResponse.json(
                    { success: false, message: "GST must be between 0% and 100%" },
                    { status: 400 }
                )
            }
            pricing = await updateGstPercentage(gst)
        }

        if (!pricing) {
            pricing = await getSubscriptionPricing()
        }

        return NextResponse.json({
            success: true,
            message: "Subscription pricing updated successfully",
            pricing,
        })
    } catch (error) {
        console.error("Admin settings PUT error:", error)
        return NextResponse.json({ success: false, message: "Failed to update settings" }, { status: 500 })
    }
}
