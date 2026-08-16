import { getSetting, setSetting } from "@/lib/settings"

// ─── Subscription Enforcement Setting ────────────────────────
// When enabled (default: true), users see trial gates, contact view limits, and upgrade prompts.
// When disabled by admin, ALL users can access properties and contacts freely without subscription.

const SUBSCRIPTION_ENABLED_KEY = "subscription_enabled"
const DEFAULT_VALUE = "true" // Subscription enforcement is ON by default

/**
 * Check if subscription enforcement is enabled.
 * @returns true if subscription/trial gates should be enforced
 */
export async function isSubscriptionEnforcementEnabled(): Promise<boolean> {
    const value = await getSetting(SUBSCRIPTION_ENABLED_KEY)
    // If the key doesn't exist in DB yet, default to "true"
    if (!value) return true
    return value === "true"
}

/**
 * Set the subscription enforcement toggle.
 * @param enabled - true to enforce subscription, false to allow free access
 */
export async function setSubscriptionEnforcement(enabled: boolean): Promise<void> {
    await setSetting(SUBSCRIPTION_ENABLED_KEY, enabled ? "true" : "false")
    console.log(`[SubscriptionSettings] Enforcement ${enabled ? "ENABLED" : "DISABLED"} by admin`)
}
