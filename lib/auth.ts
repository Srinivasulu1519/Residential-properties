import jwt from "jsonwebtoken"
import { type NextRequest } from "next/server"
import crypto from "crypto"
import { isTokenBlacklisted, isUserTokenRevoked } from "@/lib/token-blacklist"

const JWT_SECRET = process.env.JWT_SECRET || "propvista_secret_key_change_in_production"
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "propvista_refresh_secret_change_in_production"
const TOKEN_EXPIRY = "24h"
const REFRESH_TOKEN_EXPIRY = "7d"

// ─── AES Encryption Config ──────────────────────────────────
const ALGORITHM = "aes-256-gcm"
const ENCRYPTION_KEY = crypto.createHash('sha256').update(String(JWT_SECRET)).digest()
const IV_LENGTH = 16

function encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv)
    let encrypted = cipher.update(text, "utf8", "hex")
    encrypted += cipher.final("hex")
    const authTag = cipher.getAuthTag().toString("hex")
    return `${iv.toString("hex")}:${authTag}:${encrypted}`
}

function decrypt(text: string): string {
    const [ivHex, authTagHex, encryptedHex] = text.split(":")
    const iv = Buffer.from(ivHex, "hex")
    const authTag = Buffer.from(authTagHex, "hex")
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv)
    decipher.setAuthTag(authTag)
    let decrypted = decipher.update(encryptedHex, "hex", "utf8")
    decrypted += decipher.final("utf8")
    return decrypted
}

export type UserRole = "admin" | "user"

export interface TokenPayload {
    userId: string
    email: string
    role: UserRole
    name: string
    phone?: string
}

// ─── Access Token ────────────────────────────────────────────

/**
 * Sign an access token with a unique JTI (JWT ID) for revocation support.
 * The JTI is stored as a top-level JWT claim alongside the encrypted payload data.
 */
export function signToken(payload: TokenPayload): string {
    const jti = crypto.randomUUID()
    const encryptedData = encrypt(JSON.stringify(payload))
    return jwt.sign({ data: encryptedData, jti }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY })
}

/**
 * Verify an access token:
 * 1. Check JWT signature and expiration
 * 2. Check if the JTI is blacklisted (token-level revocation)
 * 3. Check if user's tokens were revoked after this token was issued (user-level revocation)
 * 4. Decrypt and return the payload
 */
export function verifyToken(token: string): TokenPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { data: string; jti?: string; iat?: number }
        if (!decoded.data) return null

        // JTI Blacklist Check — token-level revocation (logout)
        if (decoded.jti && isTokenBlacklisted(decoded.jti)) {
            return null
        }

        // Decrypt the payload
        const decrypted = decrypt(decoded.data)
        const payload = JSON.parse(decrypted) as TokenPayload

        // User-Level Revocation Check (password change)
        if (decoded.iat && isUserTokenRevoked(payload.userId, decoded.iat)) {
            return null
        }

        return payload
    } catch {
        return null
    }
}

/**
 * Decode a token WITHOUT full verification against blacklist.
 * Used internally by the logout route to extract JTI and expiration
 * from the token being invalidated.
 */
export function decodeTokenUnsafe(token: string): { jti?: string; exp?: number; iat?: number; data?: string } | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { jti?: string; exp?: number; iat?: number; data?: string }
        return decoded
    } catch {
        // Even if expired, try to decode for the JTI
        try {
            const decoded = jwt.decode(token) as { jti?: string; exp?: number; iat?: number; data?: string } | null
            return decoded
        } catch {
            return null
        }
    }
}

// ─── Refresh Token ───────────────────────────────────────────

/**
 * Sign a refresh token with a unique JTI.
 */
export function signRefreshToken(payload: TokenPayload): string {
    const jti = crypto.randomUUID()
    const shortPayload = { userId: payload.userId, email: payload.email, role: payload.role }
    const encryptedData = encrypt(JSON.stringify(shortPayload))
    return jwt.sign(
        { data: encryptedData, jti },
        JWT_REFRESH_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRY }
    )
}

/**
 * Verify a refresh token with blacklist and user-level revocation checks.
 */
export function verifyRefreshToken(token: string): { userId: string; email: string; role: UserRole } | null {
    try {
        const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { data: string; jti?: string; iat?: number }
        if (!decoded.data) return null

        // JTI Blacklist Check
        if (decoded.jti && isTokenBlacklisted(decoded.jti)) {
            return null
        }

        // Decrypt the payload
        const decrypted = decrypt(decoded.data)
        const payload = JSON.parse(decrypted) as { userId: string; email: string; role: UserRole }

        // User-Level Revocation Check
        if (decoded.iat && isUserTokenRevoked(payload.userId, decoded.iat)) {
            return null
        }

        return payload
    } catch {
        return null
    }
}

// ─── Cookie Names ────────────────────────────────────────────

export const ADMIN_TOKEN_COOKIE = "admin-auth-token"
export const USER_TOKEN_COOKIE = "user-auth-token"
export const ADMIN_REFRESH_COOKIE = "admin-refresh-token"
export const USER_REFRESH_COOKIE = "user-refresh-token"

export function getCookieNamesForRole(role: UserRole) {
    return role === "admin"
        ? { token: ADMIN_TOKEN_COOKIE, refresh: ADMIN_REFRESH_COOKIE }
        : { token: USER_TOKEN_COOKIE, refresh: USER_REFRESH_COOKIE }
}

/**
 * Get a token from cookies, with smart role detection.
 * - If preferredRole is given explicitly, check that cookie first.
 * - Otherwise, auto-detect from the URL path:
 *   /api/admin/* → prefer admin cookie
 *   /api/user/* and everything else → prefer user cookie
 * This ensures each API route gets the correct session.
 */
import { decryptPayload } from "@/lib/encryption"

/**
 * Get a token from the request, prioritizing the tab-level isolation header.
 */
export function getTokenFromRequest(request: NextRequest, preferredRole?: UserRole): string | null {
    // 1. HIGHEST PRIORITY: Tab-Level Isolation Header
    // This is the key to multi-tab/multi-account support.
    const xSessionToken = request.headers.get("x-session-token")
    if (xSessionToken) {
        const decrypted = decryptPayload(xSessionToken)
        if (decrypted && typeof decrypted === "string") {
            return decrypted
        }
    }

    // 2. COOKIE FALLBACK (Domain-wide)
    let role = preferredRole

    // Auto-detect role from URL path if not explicitly provided
    if (!role) {
        const path = request.nextUrl.pathname
        if (path.startsWith("/api/admin")) {
            role = "admin"
        } else {
            role = "user"
        }
    }

    // Check the preferred role's cookie first
    const preferredCookieName = getCookieNamesForRole(role).token
    const preferredCookie = request.cookies.get(preferredCookieName)
    if (preferredCookie) return preferredCookie.value

    // Fallback: try the other role's cookie
    const otherRole: UserRole = role === "admin" ? "user" : "admin"
    const otherCookieName = getCookieNamesForRole(otherRole).token
    const otherCookie = request.cookies.get(otherCookieName)
    if (otherCookie) return otherCookie.value

    // Legacy fallback: old single cookie
    const legacyCookie = request.cookies.get("auth-token")
    if (legacyCookie) return legacyCookie.value

    // Authorization header fallback
    const authHeader = request.headers.get("authorization")
    if (authHeader?.startsWith("Bearer ")) {
        return authHeader.substring(7)
    }
    return null
}

/**
 * Get the user from the request, optionally preferring a specific role's cookie.
 */
export function getUserFromRequest(request: NextRequest, preferredRole?: UserRole): TokenPayload | null {
    const token = getTokenFromRequest(request, preferredRole)
    if (!token) return null
    return verifyToken(token)
}

/**
 * Get user and verify they match a specific role.
 */
export function getUserByRole(request: NextRequest, role: UserRole): TokenPayload | null {
    const user = getUserFromRequest(request, role)
    if (!user || user.role !== role) return null
    return user
}

export function requireAuth(
    request: NextRequest,
    requiredRole?: UserRole
): { user: TokenPayload } | { error: string; status: number } {
    const user = requiredRole 
        ? getUserByRole(request, requiredRole)
        : getUserFromRequest(request)

    if (!user) {
        return { error: "Authentication required. Please login.", status: 401 }
    }

    if (requiredRole && user.role !== requiredRole) {
        return {
            error: `Access denied. ${requiredRole} role required.`,
            status: 403,
        }
    }

    return { user }
}

/**
 * Require auth and allow both admin and regular users
 * but return the role for conditional logic.
 */
export function requireAnyAuth(
    request: NextRequest
): { user: TokenPayload } | { error: string; status: number } {
    return requireAuth(request)
}
