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

export default function PostPropertyPage() {
    const { isAuthenticated, user } = useAdminAuth()
    const { daysLeft, isExpired } = useTrialStatus()
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

    if (!isAuthenticated || !user) {
        return (
            <main className="flex-1 flex items-center justify-center p-8">
                <Card className="max-w-md text-center">
                    <CardContent className="p-8">
                        <Building2 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                        <h2 className="font-serif text-xl font-bold mb-2">Sign in to Post</h2>
                        <p className="text-muted-foreground text-sm mb-4">You need an account to post properties</p>
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
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 px-4 py-12 lg:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 mb-4">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Free for 30 Days
                    </Badge>
                    <h1 className="font-serif text-3xl lg:text-4xl font-bold text-white mb-3">
                        Post Your Property
                    </h1>
                    <p className="text-white/50 max-w-lg mx-auto">
                        List your property for free during your trial period. Reach thousands of potential buyers.
                    </p>
                    {!isExpired && daysLeft <= 30 && (
                        <div className="mt-4 inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm text-white/70">
                            <Clock className="h-3.5 w-3.5" />
                            {daysLeft} day{daysLeft !== 1 ? "s" : ""} left in your free trial
                        </div>
                    )}
                </div>
            </div>

            {/* Form Section */}
            <div className="mx-auto max-w-5xl px-4 py-12 lg:px-8">
                {isExpired && !user.subscriptionActive && user.role !== "admin" ? (
                    <Card className="border-2 border-amber-200 bg-amber-50/50 shadow-xl overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-500" />
                        <CardContent className="p-8 text-center space-y-6">
                            <div className="h-20 w-20 mx-auto rounded-3xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-inner">
                                <Building2 className="h-10 w-10" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="font-serif text-3xl font-bold text-slate-900">Trial Period Ended</h2>
                                <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
                                    Your 30-day free trial for property posting has expired. 
                                    Upgrade to <span className="text-emerald-700 font-bold">Premium</span> to continue listing your properties.
                                </p>
                            </div>
                            <div className="pt-4">
                                <Button 
                                    size="lg" 
                                    onClick={() => setIsPaymentModalOpen(true)}
                                    className="h-14 px-10 text-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-xl shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 group"
                                >
                                    Upgrade to Premium Now
                                    <Sparkles className="ml-2 h-5 w-5 animate-pulse group-hover:scale-110" />
                                </Button>
                            </div>
                            <p className="text-xs text-slate-400">
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
