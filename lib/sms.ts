/**
 * Twilio SMS helper — uses dummy credentials by default.
 * Replace TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER
 * in your .env with real keys for production.
 */

const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID || "AC_DUMMY_SID_REPLACE_ME"
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN || "DUMMY_AUTH_TOKEN_REPLACE_ME"
const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER || "+10000000000"

async function sendSMS(to: string, body: string): Promise<boolean> {
    // Skip if dummy credentials
    if (TWILIO_SID.includes("DUMMY") || TWILIO_TOKEN.includes("DUMMY")) {
        console.log(`[SMS-DUMMY] To: ${to} | Message: ${body}`)
        return true
    }

    try {
        const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString("base64")}`,
            },
            body: new URLSearchParams({
                To: to,
                From: TWILIO_PHONE,
                Body: body,
            }),
        })

        if (!response.ok) {
            const err = await response.text()
            console.error(`[SMS] Failed to send to ${to}:`, err)
            return false
        }

        console.log(`[SMS] Sent to ${to}`)
        return true
    } catch (error) {
        console.error(`[SMS] Error sending to ${to}:`, error)
        return false
    }
}

export async function sendWelcomeSMS(phone: string, name: string) {
    const body = `Welcome to PropVista, ${name}! 🏠 Your account is ready. Browse premium properties, plots, apartments & more. Visit: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}`
    return sendSMS(phone, body)
}

export async function sendLoginAlertSMS(phone: string, name: string) {
    const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
    const body = `Hi ${name}, a login to your PropVista account was detected at ${now}. If this wasn't you, please secure your account immediately.`
    return sendSMS(phone, body)
}

export async function sendNewPropertySMS(
    phone: string,
    name: string,
    propertyTitle: string,
    propertyType: string,
    city: string
) {
    const body = `Hi ${name}, a new ${propertyType} listing "${propertyTitle}" is available in ${city} on PropVista! Check it out: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/properties`
    return sendSMS(phone, body)
}

export async function sendPropertyExpirySMS(phone: string, name: string, propertyTitle: string, daysLeft: number) {
    const body = `Hi ${name}, your listing "${propertyTitle}" on PropVista will expire in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}. Renew your subscription to keep it active.`
    return sendSMS(phone, body)
}
