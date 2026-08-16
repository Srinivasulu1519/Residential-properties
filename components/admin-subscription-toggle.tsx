"use client"

import { useEffect, useState } from "react"
import { Shield, ShieldOff, Loader2, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useAdminAuth } from "@/lib/admin-auth"
import { toast } from "sonner"

export function AdminSubscriptionToggle() {
    const { authenticatedFetch } = useAdminAuth()
    const [enabled, setEnabled] = useState(true)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        fetchStatus()
    }, [])

    const fetchStatus = async () => {
        try {
            const res = await authenticatedFetch("/api/admin/subscription-toggle")
            const data = await res.json()
            if (data.success) {
                setEnabled(data.subscriptionEnabled)
            }
        } catch {
            console.error("Failed to fetch subscription toggle status")
        } finally {
            setIsLoading(false)
        }
    }

    const handleToggle = async (newValue: boolean) => {
        setIsSaving(true)
        try {
            const res = await authenticatedFetch("/api/admin/subscription-toggle", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ enabled: newValue }),
            })
            const data = await res.json()
            if (data.success) {
                setEnabled(newValue)
                toast.success(data.message)
            } else {
                toast.error(data.message || "Failed to update")
            }
        } catch {
            toast.error("Failed to update subscription setting")
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <Card className="mb-8 border-border">
                <CardContent className="p-6 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className={`mb-8 border-border transition-colors ${enabled ? "border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-teal-50/30" : "border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/30"}`}>
            <CardHeader className="pb-4">
                <CardTitle className="text-lg font-serif flex items-center gap-2">
                    {enabled ? (
                        <Shield className="h-5 w-5 text-emerald-600" />
                    ) : (
                        <ShieldOff className="h-5 w-5 text-amber-600" />
                    )}
                    Subscription Enforcement
                    <Badge className={`ml-2 ${enabled ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-amber-100 text-amber-700 border-amber-200"}`}>
                        {enabled ? "Active" : "Disabled"}
                    </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Control whether users need a subscription to access premium features like viewing property contacts and posting beyond trial limits.
                </p>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <Label htmlFor="subscription-toggle" className="text-sm font-medium cursor-pointer">
                            {enabled ? "Subscription is required" : "Free access for all users"}
                        </Label>
                        <p className="text-xs text-muted-foreground max-w-md">
                            {enabled
                                ? "Users must subscribe after trial expires or contact view limit is reached."
                                : "All users can access properties and owner contacts without any restrictions."
                            }
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {isSaving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                        <Switch
                            id="subscription-toggle"
                            checked={enabled}
                            onCheckedChange={handleToggle}
                            disabled={isSaving}
                            className="data-[state=checked]:bg-emerald-600"
                        />
                    </div>
                </div>

                {!enabled && (
                    <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-100/60 border border-amber-200/60 px-3 py-2.5">
                        <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                        <p className="text-xs text-amber-700 leading-relaxed">
                            Subscription enforcement is currently disabled. All users can view owner contacts and access all properties without upgrading. Enable this toggle to start requiring subscriptions again.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
