"use client"

import { useState, useEffect } from "react"
import { Phone, Mail, User, Eye, Lock, CreditCard, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAdminAuth } from "@/lib/admin-auth"
import { PaymentModal } from "@/components/payment-modal"

interface RentalContactGateProps {
    propertyId: string
    hasOwnerContact: boolean
}

interface ContactDetails {
    ownerName?: string
    ownerPhone?: string
    ownerEmail?: string
}

export function RentalContactGate({ propertyId, hasOwnerContact }: RentalContactGateProps) {
    const { user, isAuthenticated, token, authenticatedFetch } = useAdminAuth()
    const [contact, setContact] = useState<ContactDetails | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [viewsInfo, setViewsInfo] = useState<{ used: number; limit: number } | null>(null)
    const [requiresSubscription, setRequiresSubscription] = useState(false)
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const [subscriptionPrice, setSubscriptionPrice] = useState(499)

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

    if (!hasOwnerContact) return null

    const handleViewContact = async () => {
        if (!isAuthenticated || !token) {
            setError("Please login to view owner contact details")
            return
        }

        setLoading(true)
        setError("")

        try {
            const res = await authenticatedFetch(`/api/properties/${propertyId}/contact`)
            const data = await res.json()

            if (data.success) {
                setContact(data.contact)
                setViewsInfo({ used: data.viewsUsed, limit: data.viewsLimit })
            } else if (data.requiresSubscription) {
                setRequiresSubscription(true)
                setViewsInfo({ used: data.viewsUsed, limit: data.viewsLimit })
            } else {
                setError(data.message)
            }
        } catch {
            setError("Failed to fetch contact details")
        } finally {
            setLoading(false)
        }
    }

    const handleUpgrade = () => {
        setIsPaymentModalOpen(true)
    }

    const onPaymentSuccess = () => {
        setRequiresSubscription(false)
        handleViewContact()
    }

    // Show paywall
    if (requiresSubscription) {
        return (
            <div className="rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 text-center">
                <div className="h-14 w-14 mx-auto rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-4 shadow-lg">
                    <Lock className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-amber-900 mb-2">
                    Free Contact Views Exhausted
                </h3>
                <p className="text-sm text-amber-700 mb-1">
                    You&apos;ve used all {viewsInfo?.limit || 7} free contact views.
                </p>
                <p className="text-xs text-amber-600 mb-5">
                    Subscribe to get unlimited access to owner contact details.
                </p>
                <Button 
                    size="lg" 
                    onClick={handleUpgrade}
                    className="w-full gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-md"
                >
                    <CreditCard className="h-4 w-4" />
                    Subscribe — ₹{subscriptionPrice}/month
                </Button>
            </div>
        )
    }

    // Show unlocked contact
    if (contact) {
        return (
            <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5">
                <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <h3 className="font-semibold text-emerald-900">Owner Contact Details</h3>
                </div>
                <div className="space-y-3">
                    {contact.ownerName && (
                        <div className="flex items-center gap-3 text-sm">
                            <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                                <User className="h-4 w-4 text-emerald-700" />
                            </div>
                            <div>
                                <p className="text-xs text-emerald-600">Owner Name</p>
                                <p className="font-medium text-emerald-900">{contact.ownerName}</p>
                            </div>
                        </div>
                    )}
                    {contact.ownerPhone && (
                        <div className="flex items-center gap-3 text-sm">
                            <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                                <Phone className="h-4 w-4 text-emerald-700" />
                            </div>
                            <div>
                                <p className="text-xs text-emerald-600">Phone</p>
                                <a href={`tel:${contact.ownerPhone}`} className="font-medium text-emerald-900 hover:underline">
                                    {contact.ownerPhone}
                                </a>
                            </div>
                        </div>
                    )}
                    {contact.ownerEmail && (
                        <div className="flex items-center gap-3 text-sm">
                            <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                                <Mail className="h-4 w-4 text-emerald-700" />
                            </div>
                            <div>
                                <p className="text-xs text-emerald-600">Email</p>
                                <a href={`mailto:${contact.ownerEmail}`} className="font-medium text-emerald-900 hover:underline">
                                    {contact.ownerEmail}
                                </a>
                            </div>
                        </div>
                    )}
                </div>
                {viewsInfo && !user?.subscriptionActive && user?.role !== "admin" && (
                    <p className="text-xs text-emerald-600 mt-4 pt-3 border-t border-emerald-200">
                        📊 {viewsInfo.used} of {viewsInfo.limit} free contact views used
                    </p>
                )}
            </div>
        )
    }

    // Show unlock button
    return (
        <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
                <Eye className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Owner Contact</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
                Contact details are hidden. Click below to reveal the owner&apos;s phone and email.
            </p>
            {error && (
                <p className="text-sm text-red-600 mb-3 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}
            <Button
                onClick={handleViewContact}
                disabled={loading}
                className="w-full gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-600/90 hover:to-teal-500/90 shadow-md"
            >
                <Phone className="h-4 w-4" />
                {loading ? "Loading..." : "View Owner Contact"}
            </Button>
            {isAuthenticated && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                    🎁 7 free contact views for new users
                </p>
            )}
            {/* Payment Modal */}
            <PaymentModal 
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onSuccess={onPaymentSuccess}
            />
        </div>
    )
}
