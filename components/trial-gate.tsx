"use client"

import { useState, useEffect } from "react"
import { useAdminAuth } from "@/lib/admin-auth"
import { Shield, Clock, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PaymentModal } from "@/components/payment-modal"
import { useSubscriptionEnforcement } from "@/hooks/use-subscription-enforcement"

export function useTrialStatus() {
    const { user, isAuthenticated } = useAdminAuth()

    if (!isAuthenticated || !user) return { isTrialActive: false, isExpired: false, daysLeft: 0 }
    if (user.role === "admin") return { isTrialActive: true, isExpired: false, daysLeft: 999 }
    if (user.subscriptionActive) return { isTrialActive: true, isExpired: false, daysLeft: 999 }

    if (!user.trialEndsAt) {
        // Legacy user without trial date — treat as active
        return { isTrialActive: true, isExpired: false, daysLeft: 30 }
    }

    const trialEnd = new Date(user.trialEndsAt)
    const now = new Date()
    const daysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    const isExpired = daysLeft <= 0

    return { isTrialActive: !isExpired, isExpired, daysLeft }
}

export function TrialGate({ children }: { children: React.ReactNode }) {
    const { isExpired, daysLeft } = useTrialStatus()
    const { token, refreshUser } = useAdminAuth()
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const [subscriptionPrice, setSubscriptionPrice] = useState(499)
    const { isEnforced } = useSubscriptionEnforcement()

    useEffect(() => {
        fetch("/api/settings/subscription")
            .then(res => res.json())
            .then(data => {
                if (data.success && data.pricing) {
                    setSubscriptionPrice(data.pricing.basePrice)
                }
            })
            .catch(() => {})
    }, [])

    const handleUpgrade = () => {
        setIsPaymentModalOpen(true)
    }

    const onPaymentSuccess = () => {
        refreshUser()
    }

    // If admin has disabled subscription enforcement, show content freely
    if (!isEnforced) {
        return <>{children}</>
    }

    if (!isExpired) {
        return (
            <>
                {daysLeft <= 7 && daysLeft > 0 && (
                    <div className="bg-amber-50/80 border border-amber-200/60 rounded-lg p-4 mb-6 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center gap-3">
                            <Clock className="h-4 w-4 text-amber-600" />
                            <div>
                                <p className="text-sm font-medium text-amber-900">
                                    Trial expires in {daysLeft} day{daysLeft !== 1 ? "s" : ""}
                                </p>
                                <p className="text-xs text-amber-600/80">Subscribe to continue accessing all features</p>
                            </div>
                        </div>
                        <Button 
                            size="sm" 
                            onClick={handleUpgrade}
                            className="rounded-full"
                        >
                            Subscribe Now
                        </Button>
                    </div>
                )}
                {children}
            </>
        )
    }

    // Trial expired — show paywall
    return (
        <div className="relative">
            {/* Blurred content */}
            <div className="blur-sm pointer-events-none select-none opacity-40">
                {children}
            </div>

            {/* Paywall overlay */}
            <div className="absolute inset-0 flex items-center justify-center z-10 p-4">
                <div className="bg-card rounded-xl shadow-xl border border-border/40 p-10 max-w-md w-full text-center animate-in zoom-in-95 duration-300">
                    <div className="h-14 w-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                        <Shield className="h-7 w-7 text-primary" />
                    </div>
                    <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
                        Free Trial Expired
                    </h2>
                    <p className="text-muted-foreground text-sm mb-8 leading-relaxed max-w-sm mx-auto">
                        Your 30-day free trial has ended. Subscribe to continue searching, viewing property details, and posting listings.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Button 
                            size="lg" 
                            onClick={handleUpgrade}
                            className="w-full h-12 rounded-full"
                        >
                            Subscribe — ₹{subscriptionPrice}/month
                        </Button>
                        <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
                            <Link href="/">Back to Home</Link>
                        </Button>
                    </div>
                </div>
            </div>
            {/* Payment Modal */}
            <PaymentModal 
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onSuccess={onPaymentSuccess}
            />
        </div>
    )
}
