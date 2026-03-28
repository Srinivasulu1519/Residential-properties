import nodemailer from "nodemailer"

const isDummyEmail = !process.env.SMTP_USER || process.env.SMTP_USER.includes("your-email")

const transporter = !isDummyEmail ? nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
}) : null

const FROM = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@propvista.com"
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@propvista.com"
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

async function sendMail(options: any) {
    if (isDummyEmail) {
        console.log(`[EMAIL-DUMMY] To: ${options.to} | Subject: ${options.subject}`)
        // Optional: log first 100 chars of HTML
        return { messageId: "dummy-id" }
    }
    return transporter!.sendMail(options)
}

/**
 * Send a welcome email to a newly registered user.
 */
export async function sendWelcomeEmail(name: string, email: string) {
    try {
        await sendMail({
            from: FROM,
            to: email,
            subject: "Welcome to PropVista!",
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #fafafa; border-radius: 12px;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <h1 style="color: #1a1a1a; font-size: 24px; margin: 0;">Welcome to PropVista</h1>
                    </div>
                    <p style="color: #333; font-size: 15px; line-height: 1.6;">
                        Hi <strong>${name}</strong>,
                    </p>
                    <p style="color: #333; font-size: 15px; line-height: 1.6;">
                        Thank you for creating an account with PropVista! You can now browse premium properties, explore plots, apartments, and villas across India.
                    </p>
                    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 20px 0;">
                        <p style="color: #166534; font-size: 14px; margin: 0;">
                            🎉 <strong>Free Trial Activated!</strong> You get 30 days of free property posting and 7 free rental contact views.
                        </p>
                    </div>
                    <div style="text-align: center; margin: 28px 0;">
                        <a href="${APP_URL}/properties"
                           style="background: #16a34a; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                            Browse Properties
                        </a>
                    </div>
                    <p style="color: #999; font-size: 12px; text-align: center; margin-top: 32px;">
                        &copy; ${new Date().getFullYear()} PropVista. All rights reserved.
                    </p>
                </div>
            `,
        })
        console.log(`Welcome email sent to ${email}`)
    } catch (error) {
        console.error(`Failed to send welcome email to ${email}:`, error)
    }
}

/**
 * Notify admins about a new user registration.
 */
export async function sendAdminNewUserNotification(
    name: string,
    email: string,
    role: string
) {
    try {
        await sendMail({
            from: FROM,
            to: ADMIN_EMAIL,
            subject: `New User Registration: ${name}`,
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #fafafa; border-radius: 12px;">
                    <h2 style="color: #1a1a1a; font-size: 20px; margin: 0 0 16px;">New User Registered</h2>
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                        <tr>
                            <td style="padding: 10px 12px; color: #666; border-bottom: 1px solid #eee; width: 100px;"><strong>Name</strong></td>
                            <td style="padding: 10px 12px; color: #333; border-bottom: 1px solid #eee;">${name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 12px; color: #666; border-bottom: 1px solid #eee;"><strong>Email</strong></td>
                            <td style="padding: 10px 12px; color: #333; border-bottom: 1px solid #eee;">${email}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 12px; color: #666;"><strong>Role</strong></td>
                            <td style="padding: 10px 12px; color: #333; text-transform: capitalize;">${role}</td>
                        </tr>
                    </table>
                    <div style="text-align: center; margin-top: 24px;">
                        <a href="${APP_URL}/admin/users"
                           style="background: #1a1a1a; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 13px;">
                            View All Users
                        </a>
                    </div>
                    <p style="color: #999; font-size: 12px; text-align: center; margin-top: 24px;">
                        &copy; ${new Date().getFullYear()} PropVista Admin
                    </p>
                </div>
            `,
        })
        console.log(`Admin notified about new registration: ${email}`)
    } catch (error) {
        console.error(`Failed to send admin notification:`, error)
    }
}

/**
 * Send login notification email.
 */
export async function sendLoginNotificationEmail(
    name: string,
    email: string,
    loginTime: string
) {
    try {
        await sendMail({
            from: FROM,
            to: email,
            subject: "New Login to Your PropVista Account",
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #fafafa; border-radius: 12px;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <h1 style="color: #1a1a1a; font-size: 24px; margin: 0;">Login Alert 🔐</h1>
                    </div>
                    <p style="color: #333; font-size: 15px; line-height: 1.6;">
                        Hi <strong>${name}</strong>,
                    </p>
                    <p style="color: #333; font-size: 15px; line-height: 1.6;">
                        A login to your PropVista account was detected.
                    </p>
                    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; margin: 20px 0;">
                        <table style="width: 100%; font-size: 14px;">
                            <tr>
                                <td style="padding: 4px 0; color: #666;"><strong>Time:</strong></td>
                                <td style="padding: 4px 0; color: #333;">${loginTime}</td>
                            </tr>
                        </table>
                    </div>
                    <p style="color: #666; font-size: 13px; line-height: 1.6;">
                        If this was you, no action is needed. If you did not login, please change your password immediately and contact support.
                    </p>
                    <p style="color: #999; font-size: 12px; text-align: center; margin-top: 32px;">
                        &copy; ${new Date().getFullYear()} PropVista. All rights reserved.
                    </p>
                </div>
            `,
        })
        console.log(`Login notification email sent to ${email}`)
    } catch (error) {
        console.error(`Failed to send login notification to ${email}:`, error)
    }
}

/**
 * Send new property notification email matching user preferences.
 */
export async function sendNewPropertyEmail(
    name: string,
    email: string,
    property: { title: string; type: string; city: string; price: number; id: string }
) {
    const formattedPrice = property.price >= 10000000
        ? `₹${(property.price / 10000000).toFixed(2)} Cr`
        : property.price >= 100000
            ? `₹${(property.price / 100000).toFixed(2)} L`
            : `₹${property.price.toLocaleString("en-IN")}`

    try {
        await sendMail({
            from: FROM,
            to: email,
            subject: `New ${property.type} in ${property.city} — ${property.title}`,
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #fafafa; border-radius: 12px;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <h1 style="color: #1a1a1a; font-size: 22px; margin: 0;">New Property Alert 🏠</h1>
                    </div>
                    <p style="color: #333; font-size: 15px; line-height: 1.6;">
                        Hi <strong>${name}</strong>,
                    </p>
                    <p style="color: #333; font-size: 15px; line-height: 1.6;">
                        A new listing matching your preferences is now available on PropVista!
                    </p>
                    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; margin: 20px 0;">
                        <h3 style="color: #1a1a1a; font-size: 18px; margin: 0 0 8px;">${property.title}</h3>
                        <p style="color: #666; font-size: 14px; margin: 0 0 4px;">📍 ${property.city} · ${property.type}</p>
                        <p style="color: #16a34a; font-size: 20px; font-weight: 700; margin: 8px 0 0;">${formattedPrice}</p>
                    </div>
                    <div style="text-align: center; margin: 28px 0;">
                        <a href="${APP_URL}/properties/${property.id}"
                           style="background: #16a34a; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                            View Property
                        </a>
                    </div>
                    <p style="color: #999; font-size: 12px; text-align: center; margin-top: 32px;">
                        &copy; ${new Date().getFullYear()} PropVista. All rights reserved.
                    </p>
                </div>
            `,
        })
        console.log(`New property email sent to ${email} for: ${property.title}`)
    } catch (error) {
        console.error(`Failed to send new property email to ${email}:`, error)
    }
}
