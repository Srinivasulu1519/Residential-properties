"use client"

import { useState } from "react"
import { useAdminAuth } from "@/lib/admin-auth"
import { Shield, Clock, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PaymentModal } from "@/components/payment-modal"

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

    const handleUpgrade = () => {
        setIsPaymentModalOpen(true)
    }

    const onPaymentSuccess = () => {
        refreshUser()
    }

    if (!isExpired) {
        return (
            <>
                {daysLeft <= 7 && daysLeft > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-amber-600" />
                            <div>
                                <p className="text-sm font-medium text-amber-900">
                                    Trial expires in {daysLeft} day{daysLeft !== 1 ? "s" : ""}
                                </p>
                                <p className="text-xs text-amber-600">Subscribe to continue accessing all features</p>
                            </div>
                        </div>
                        <Button 
                            size="sm" 
                            onClick={handleUpgrade}
                            className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
                        >
                            <CreditCard className="h-3.5 w-3.5" />
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
                <div className="bg-white rounded-2xl shadow-2xl border border-border p-8 max-w-md w-full text-center animate-in zoom-in-95 duration-300">
                    <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center mb-5 shadow-lg">
                        <Shield className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
                        Free Trial Expired
                    </h2>
                    <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                        Your 30-day free trial has ended. Subscribe to continue searching, viewing property details, and posting listings.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Button 
                            size="lg" 
                            onClick={handleUpgrade}
                            className="w-full gap-2 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 shadow-md h-12"
                        >
                            <CreditCard className="h-4 w-4" />
                            Subscribe — ₹499/month
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
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
