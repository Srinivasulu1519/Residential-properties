import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { isSubscriptionEnforcementEnabled, setSubscriptionEnforcement } from "@/lib/subscription-settings"

/**
 * GET /api/admin/subscription-toggle
 * Returns the current subscription enforcement status (admin only)
 */
export async function GET(request: NextRequest) {
    try {
        const user = getUserFromRequest(request)
        if (!user || user.role !== "admin") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
        }

        const enabled = await isSubscriptionEnforcementEnabled()

        return NextResponse.json({
            success: true,
            subscriptionEnabled: enabled,
        })
    } catch (error) {
        console.error("Subscription toggle GET error:", error)
        return NextResponse.json({ success: false, message: "Failed to fetch setting" }, { status: 500 })
    }
}

/**
 * PUT /api/admin/subscription-toggle
 * Toggle subscription enforcement on/off (admin only)
 * Body: { enabled: boolean }
 */
export async function PUT(request: NextRequest) {
    try {
        const user = getUserFromRequest(request)
        if (!user || user.role !== "admin") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { enabled } = body

        if (typeof enabled !== "boolean") {
            return NextResponse.json(
                { success: false, message: "'enabled' must be a boolean value" },
                { status: 400 }
            )
        }

        await setSubscriptionEnforcement(enabled)

        return NextResponse.json({
            success: true,
            subscriptionEnabled: enabled,
            message: enabled
                ? "Subscription enforcement enabled. Users will need to upgrade for full access."
                : "Subscription enforcement disabled. All users can access properties freely.",
        })
    } catch (error) {
        console.error("Subscription toggle PUT error:", error)
        return NextResponse.json({ success: false, message: "Failed to update setting" }, { status: 500 })
    }
}
