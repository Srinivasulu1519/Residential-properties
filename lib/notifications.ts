import { prisma } from "@/lib/prisma"
import { sendWelcomeEmail, sendLoginNotificationEmail, sendNewPropertyEmail } from "@/lib/email"
import { sendWelcomeSMS, sendLoginAlertSMS, sendNewPropertySMS } from "@/lib/sms"

/**
 * Central notification dispatcher.
 * Handles in-app, email, and SMS notifications for all events.
 */

// ─── In-App Notification ─────────────────────────────────────

export async function createInAppNotification(
    userId: string,
    type: "REGISTRATION" | "LOGIN" | "NEW_PROPERTY" | "PRICE_DROP" | "PROPERTY_EXPIRY" | "CONTACT_VIEWED" | "SYSTEM" | "LEAD",
    title: string,
    body: string,
    propertyId?: string
) {
    try {
        await prisma.notification.create({
            data: {
                userId,
                // @ts-ignore - Prisma client needs regeneration/IDE sync to see 'LEAD' type
                type,
                channel: "IN_APP",
                title,
                body,
                propertyId,
            },
        })
    } catch (error) {
        console.error("[Notification] Failed to create in-app notification:", error)
    }
}

// ─── Registration Notification ───────────────────────────────

export async function notifyOnRegistration(user: { id: string; name: string; email: string; phone?: string }) {
    // In-app
    await createInAppNotification(
        user.id,
        "REGISTRATION",
        "Welcome to PropVista! 🏠",
        "Your account has been created successfully. Start browsing premium properties now."
    )

    // Email (fire-and-forget)
    sendWelcomeEmail(user.name, user.email)

    // SMS (fire-and-forget)
    if (user.phone) {
        sendWelcomeSMS(user.phone, user.name)
    }
}

// ─── Login Notification ──────────────────────────────────────

export async function notifyOnLogin(user: { id: string; name: string; email: string; phone?: string }) {
    const loginTime = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })

    // In-app
    await createInAppNotification(
        user.id,
        "LOGIN",
        "Login Detected",
        `A login to your account was detected at ${loginTime}.`
    )

    // Email (fire-and-forget)
    sendLoginNotificationEmail(user.name, user.email, loginTime)

    // SMS (fire-and-forget)
    if (user.phone) {
        sendLoginAlertSMS(user.phone, user.name)
    }
}

// ─── New Property Notification (notify matching users) ───────

export async function notifyMatchingUsers(property: {
    id: string
    title: string
    type: string
    price: number
    city: string
}) {
    try {
        // Find users whose notification preferences match this property
        const matchingPrefs = await prisma.notificationPreference.findMany({
            where: {
                OR: [
                    {
                        preferredTypes: {
                            has: property.type.toUpperCase() as any,
                        },
                    },
                    {
                        preferredCities: {
                            has: property.city,
                        },
                    },
                ],
            },
            include: {
                user: true,
            },
        })

        // Also find users who have searched for this property type or city
        const usersWithMatchingHistory = await prisma.user.findMany({
            where: {
                searchHistory: {
                    hasSome: [
                        property.type.toLowerCase(),
                        property.city.toLowerCase(),
                        property.city,
                    ],
                },
            },
        })

        // Combine and deduplicate users
        const notifiedUserIds = new Set<string>()

        for (const pref of matchingPrefs) {
            if (notifiedUserIds.has(pref.userId)) continue

            // Check price range
            if (pref.minPrice && property.price < pref.minPrice) continue
            if (pref.maxPrice && property.price > pref.maxPrice) continue

            notifiedUserIds.add(pref.userId)

            // In-app notification
            await createInAppNotification(
                pref.userId,
                "NEW_PROPERTY",
                `New ${property.type} in ${property.city}`,
                `A new listing "${property.title}" matching your preferences is now available!`,
                property.id
            )

            // Email
            if (pref.emailEnabled) {
                sendNewPropertyEmail(pref.user.name, pref.user.email, {
                    title: property.title,
                    type: property.type,
                    city: property.city,
                    price: property.price,
                    id: property.id,
                })
            }

            // SMS
            if (pref.smsEnabled && pref.user.phone) {
                sendNewPropertySMS(
                    pref.user.phone,
                    pref.user.name,
                    property.title,
                    property.type,
                    property.city
                )
            }
        }

        // Notify users from search history (who don't already have preferences)
        for (const user of usersWithMatchingHistory) {
            if (notifiedUserIds.has(user.id)) continue
            notifiedUserIds.add(user.id)

            await createInAppNotification(
                user.id,
                "NEW_PROPERTY",
                `New ${property.type} in ${property.city}`,
                `A new listing "${property.title}" matches your recent searches!`,
                property.id
            )

            sendNewPropertyEmail(user.name, user.email, {
                title: property.title,
                type: property.type,
                city: property.city,
                price: property.price,
                id: property.id,
            })

            if (user.phone) {
                sendNewPropertySMS(user.phone, user.name, property.title, property.type, property.city)
            }
        }

        console.log(`[Notification] Notified ${notifiedUserIds.size} users about new property: ${property.title}`)
    } catch (error) {
        console.error("[Notification] Failed to notify matching users:", error)
    }
}
