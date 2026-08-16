/**
 * Token Blacklist — In-Memory Implementation
 * 
 * This module provides JWT revocation capabilities using JTI (JWT ID):
 * 
 * 1. Token-Level Revocation (Logout):
 *    - Stores blacklisted JTIs with auto-expiring TTL
 *    - When a user logs out, their token's JTI is added to the blacklist
 *    - The entry auto-removes after the token's natural expiry time
 * 
 * 2. User-Level Revocation (Password Change):
 *    - Stores a "revoked at" timestamp per user
 *    - Any token issued before this timestamp is rejected
 *    - Used when a user changes their password to invalidate ALL sessions
 * 
 * Note: This is an in-memory implementation suitable for single-server deployments.
 * For multi-server/clustered deployments, replace with Redis.
 */

// ─── JTI Blacklist (Token-Level Revocation) ──────────────────

interface BlacklistEntry {
    jti: string
    expiresAt: number // Unix timestamp in ms
}

const jtiBlacklist = new Map<string, BlacklistEntry>()

/**
 * Add a JTI to the blacklist with a TTL matching the token's remaining lifespan.
 * @param jti - The JWT ID to blacklist
 * @param tokenExpiresAt - Unix timestamp (seconds) when the token naturally expires
 */
export function blacklistToken(jti: string, tokenExpiresAt: number): void {
    const expiresAtMs = tokenExpiresAt * 1000 // Convert to milliseconds
    jtiBlacklist.set(jti, { jti, expiresAt: expiresAtMs })
    console.log(`[TokenBlacklist] Token blacklisted | JTI: ${jti} | Expires: ${new Date(expiresAtMs).toISOString()}`)
}

/**
 * Check if a JTI has been blacklisted.
 * @param jti - The JWT ID to check
 * @returns true if the token is revoked
 */
export function isTokenBlacklisted(jti: string): boolean {
    const result = jtiBlacklist.has(jti)
    if (result) {
        console.log(`[TokenBlacklist] Blocked request | JTI: ${jti} is blacklisted`)
    }
    return result
}

// ─── User-Level Revocation (Password Change) ────────────────

// Map of userId → timestamp (ms) when all tokens were revoked
const userRevocationMap = new Map<string, number>()

/**
 * Revoke all tokens for a user issued before the current time.
 * Used on password change to invalidate all existing sessions.
 * @param userId - The user whose tokens should be revoked
 */
export function revokeAllUserTokens(userId: string): void {
    userRevocationMap.set(userId, Date.now())
    console.log(`[TokenBlacklist] All tokens revoked | User: ${userId} | At: ${new Date().toISOString()}`)
}

/**
 * Check if a token's "issued at" time is before the user's revocation timestamp.
 * @param userId - The user who owns the token
 * @param issuedAt - The token's `iat` claim (Unix timestamp in seconds)
 * @returns true if the token was issued before revocation (i.e., is revoked)
 */
export function isUserTokenRevoked(userId: string, issuedAt: number): boolean {
    const revokedAt = userRevocationMap.get(userId)
    if (!revokedAt) return false
    
    // Convert iat (seconds) to milliseconds for comparison
    const issuedAtMs = issuedAt * 1000
    const revoked = issuedAtMs < revokedAt
    if (revoked) {
        console.log(`[TokenBlacklist] User token revoked | User: ${userId} | Issued: ${new Date(issuedAtMs).toISOString()} | Revoked at: ${new Date(revokedAt).toISOString()}`)
    }
    return revoked
}

// ─── Cleanup (Garbage Collection) ───────────────────────────

/**
 * Remove expired entries from the blacklist.
 * Called periodically to prevent memory leaks.
 */
function cleanupExpiredEntries(): void {
    const now = Date.now()
    let jtiRemoved = 0
    let userRemoved = 0

    for (const [jti, entry] of jtiBlacklist.entries()) {
        if (entry.expiresAt <= now) {
            jtiBlacklist.delete(jti)
            jtiRemoved++
        }
    }
    
    // Clean up user revocation entries older than 7 days
    // (refresh tokens expire in 7 days, so older entries are unnecessary)
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
    for (const [userId, revokedAt] of userRevocationMap.entries()) {
        if (now - revokedAt > sevenDaysMs) {
            userRevocationMap.delete(userId)
            userRemoved++
        }
    }

    if (jtiRemoved > 0 || userRemoved > 0) {
        console.log(`[TokenBlacklist] Cleanup complete | JTIs removed: ${jtiRemoved} | User entries removed: ${userRemoved} | Remaining: ${jtiBlacklist.size} JTIs, ${userRevocationMap.size} users`)
    }
}

// Run cleanup every 10 minutes
if (typeof setInterval !== "undefined") {
    setInterval(cleanupExpiredEntries, 10 * 60 * 1000)
}
