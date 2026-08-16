import { prisma } from "@/lib/prisma"

// ─── Setting Keys ────────────────────────────────────────────
export const SETTING_KEYS = {
    SUBSCRIPTION_PRICE: "subscription_price", // Base price in INR (e.g. "499")
    GST_PERCENTAGE: "gst_percentage",         // GST rate (e.g. "18")
} as const

// ─── Defaults ────────────────────────────────────────────────
const DEFAULTS: Record<string, string> = {
    [SETTING_KEYS.SUBSCRIPTION_PRICE]: "499",
    [SETTING_KEYS.GST_PERCENTAGE]: "18",
}

// ─── Helpers ─────────────────────────────────────────────────

export async function getSetting(key: string): Promise<string> {
    try {
        const setting = await prisma.siteSetting.findUnique({ where: { key } })
        return setting?.value ?? DEFAULTS[key] ?? ""
    } catch {
        // Fallback if table doesn't exist yet or DB error
        return DEFAULTS[key] ?? ""
    }
}

export async function setSetting(key: string, value: string): Promise<void> {
    await prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
    })
}

// ─── Subscription Price Helpers ──────────────────────────────

export interface SubscriptionPricing {
    basePrice: number      // e.g. 499
    gstPercentage: number  // e.g. 18
    gstAmount: number      // e.g. 89.82
    totalPrice: number     // e.g. 588.82
    totalPaise: number     // e.g. 58882 (for Razorpay)
}

export async function getSubscriptionPricing(): Promise<SubscriptionPricing> {
    const basePriceStr = await getSetting(SETTING_KEYS.SUBSCRIPTION_PRICE)
    const gstStr = await getSetting(SETTING_KEYS.GST_PERCENTAGE)

    const basePrice = parseFloat(basePriceStr) || 499
    const gstPercentage = parseFloat(gstStr) || 18

    const gstAmount = parseFloat(((basePrice * gstPercentage) / 100).toFixed(2))
    const totalPrice = parseFloat((basePrice + gstAmount).toFixed(2))
    const totalPaise = Math.round(totalPrice * 100)

    return { basePrice, gstPercentage, gstAmount, totalPrice, totalPaise }
}

export async function updateSubscriptionPrice(basePrice: number): Promise<SubscriptionPricing> {
    if (basePrice <= 0 || basePrice > 99999) {
        throw new Error("Price must be between ₹1 and ₹99,999")
    }
    await setSetting(SETTING_KEYS.SUBSCRIPTION_PRICE, basePrice.toString())
    return getSubscriptionPricing()
}

export async function updateGstPercentage(gst: number): Promise<SubscriptionPricing> {
    if (gst < 0 || gst > 100) {
        throw new Error("GST percentage must be between 0 and 100")
    }
    await setSetting(SETTING_KEYS.GST_PERCENTAGE, gst.toString())
    return getSubscriptionPricing()
}
