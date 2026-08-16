"use client"

import { useState, useEffect } from "react"

/**
 * Hook to check whether subscription enforcement is enabled by admin.
 * 
 * When enforcement is DISABLED:
 * - TrialGate should NOT block users (no paywall)
 * - RentalContactGate should NOT limit contact views
 * - All users get free access to everything
 * 
 * When enforcement is ENABLED (default):
 * - Normal trial + subscription gating applies
 */
export function useSubscriptionEnforcement() {
    const [isEnforced, setIsEnforced] = useState(true) // Default to enforced (safe default)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        let cancelled = false

        async function fetchStatus() {
            try {
                const res = await fetch("/api/settings/subscription-status")
                const data = await res.json()
                if (!cancelled && data.success) {
                    setIsEnforced(data.subscriptionEnabled)
                }
            } catch {
                // On error, keep enforcement enabled (safe default)
                if (!cancelled) {
                    setIsEnforced(true)
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false)
                }
            }
        }

        fetchStatus()

        return () => {
            cancelled = true
        }
    }, [])

    return { isEnforced, isLoading }
}
