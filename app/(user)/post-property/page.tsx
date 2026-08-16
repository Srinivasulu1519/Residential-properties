"use client"

import { Building2, Sparkles, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAdminAuth } from "@/lib/admin-auth"
import { useTrialStatus } from "@/components/trial-gate"
import { PropertyForm } from "@/components/property-form"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PaymentModal } from "@/components/payment-modal"
import { useState } from "react"
import { useSubscriptionEnforcement } from "@/hooks/use-subscription-enforcement"

export default function PostPropertyPage() {
    const { isAuthenticated, user } = useAdminAuth()
    const { daysLeft, isExpired } = useTrialStatus()
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const { isEnforced: subscriptionEnforced } = useSubscriptionEnforcement()

    if (!isAuthenticated || !user) {
        return (
            <main className="flex-1 flex items-center justify-center p-8">
                <Card className="max-w-md text-center border-border/40">
                    <CardContent className="p-10">
                        <Building2 className="h-10 w-10 mx-auto text-muted-foreground/30 mb-5" />
                        <h2 className="font-serif text-xl font-bold mb-2">Sign in to Post</h2>
                        <p className="text-muted-foreground text-sm mb-6">You need an account to post properties</p>
                        <div className="flex gap-3 justify-center">
                            <Button asChild><Link href="/auth/login">Sign In</Link></Button>
                            <Button variant="outline" asChild><Link href="/auth/register">Register</Link></Button>
                        </div>
                    </CardContent>
                </Card>
            </main>
        )
    }

    return (
        <main className="flex-1">
            {/* Hero */}
            <div className="bg-[#1a2e2a] px-6 py-14 lg:px-8 lg:py-20">
                <div className="mx-auto max-w-3xl text-center">
                    <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-white/40">
                        Free for 30 Days
                    </p>
                    <h1 className="font-serif text-3xl lg:text-4xl font-bold text-white mb-3">
                        Post Your Property
                    </h1>
                    <p className="text-white/50 max-w-lg mx-auto text-sm leading-relaxed">
                        List your property for free during your trial period. Reach thousands of potential buyers.
                    </p>
                    {!isExpired && daysLeft <= 30 && subscriptionEnforced && (
                        <div className="mt-5 inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white/60">
                            <Clock className="h-3.5 w-3.5" />
                            {daysLeft} day{daysLeft !== 1 ? "s" : ""} left in your free trial
                        </div>
                    )}
                </div>
            </div>

            {/* Form Section */}
            <div className="mx-auto max-w-5xl px-6 py-12 lg:px-8 lg:py-16">
                {isExpired && !user.subscriptionActive && user.role !== "admin" && subscriptionEnforced ? (
                    <Card className="border border-border/40 overflow-hidden">
                        <CardContent className="p-10 text-center space-y-6">
                            <div className="h-16 w-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                                <Building2 className="h-8 w-8 text-primary" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="font-serif text-2xl font-bold text-foreground">Trial Period Ended</h2>
                                <p className="text-muted-foreground max-w-md mx-auto leading-relaxed text-sm">
                                    Your 30-day free trial for property posting has expired. 
                                    Upgrade to Premium to continue listing your properties.
                                </p>
                            </div>
                            <div className="pt-2">
                                <Button 
                                    size="lg" 
                                    onClick={() => setIsPaymentModalOpen(true)}
                                    className="h-12 px-8 rounded-full"
                                >
                                    Upgrade to Premium
                                    <Sparkles className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Unlimited postings · Lead tracking · Premium badge
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <PropertyForm mode="create" />
                )}
            </div>

            <PaymentModal 
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onSuccess={() => {}} // State will be handled via refreshUser internally
            />
        </main>
    )
}
