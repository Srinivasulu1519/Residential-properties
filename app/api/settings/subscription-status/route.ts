import { NextResponse } from "next/server"
import { isSubscriptionEnforcementEnabled } from "@/lib/subscription-settings"

/**
 * GET /api/settings/subscription-status
 * Public endpoint — returns whether subscription enforcement is active.
 * Used by client-side components (TrialGate, RentalContactGate) to decide
 * whether to show paywalls or allow free access.
 */
export async function GET() {
    try {
        const enabled = await isSubscriptionEnforcementEnabled()

        return NextResponse.json({
            success: true,
            subscriptionEnabled: enabled,
        })
    } catch (error) {
        console.error("Subscription status GET error:", error)
        // Default to enabled on error (safer — don't accidentally unlock premium content)
        return NextResponse.json({
            success: true,
            subscriptionEnabled: true,
        })
    }
}
