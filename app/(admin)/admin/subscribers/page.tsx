"use client"

import { useEffect, useState } from "react"
import {
    Crown,
    Clock,
    Users,
    AlertTriangle,
    Loader2,
    Phone,
    Mail,
    Eye,
    CalendarDays,
    CheckCircle2,
    XCircle,
    Settings,
    IndianRupee,
    Save,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

interface Subscriber {
    id: string
    name: string
    email: string
    phone: string | null
    subscriptionActive: boolean
    contactViewsUsed: number
    contactViewsLimit: number
    createdAt: string
}

interface FreeUser {
    id: string
    name: string
    email: string
    phone: string | null
    subscriptionActive: boolean
    contactViewsUsed: number
    contactViewsLimit: number
    trialEndsAt: string | null
    createdAt: string
    isTrialExpired: boolean
    daysRemaining: number | null
}

import { useAdminAuth } from "@/lib/admin-auth"
import { AdminSubscriptionToggle } from "@/components/admin-subscription-toggle"

export default function SubscribersPage() {
    const { authenticatedFetch } = useAdminAuth()
    const [subscribers, setSubscribers] = useState<Subscriber[]>([])
    const [freeUsers, setFreeUsers] = useState<FreeUser[]>([])
    const [stats, setStats] = useState({ totalPremium: 0, totalFree: 0, totalExpired: 0 })
    const [isLoading, setIsLoading] = useState(true)

    // Pricing settings state
    const [basePrice, setBasePrice] = useState("")
    const [gstPercentage, setGstPercentage] = useState("")
    const [pricingPreview, setPricingPreview] = useState({ gstAmount: 0, totalPrice: 0 })
    const [isSavingPrice, setIsSavingPrice] = useState(false)

    useEffect(() => {
        fetchSubscribers()
        fetchPricing()
    }, [])

    // Recompute preview when inputs change
    useEffect(() => {
        const base = parseFloat(basePrice) || 0
        const gst = parseFloat(gstPercentage) || 0
        const gstAmt = parseFloat(((base * gst) / 100).toFixed(2))
        const total = parseFloat((base + gstAmt).toFixed(2))
        setPricingPreview({ gstAmount: gstAmt, totalPrice: total })
    }, [basePrice, gstPercentage])

    const fetchPricing = async () => {
        try {
            const res = await authenticatedFetch("/api/admin/settings")
            const data = await res.json()
            if (data.success && data.pricing) {
                setBasePrice(data.pricing.basePrice.toString())
                setGstPercentage(data.pricing.gstPercentage.toString())
            }
        } catch {}
    }

    const handleSavePricing = async () => {
        const price = parseFloat(basePrice)
        const gst = parseFloat(gstPercentage)
        if (isNaN(price) || price <= 0 || price > 99999) {
            toast.error("Price must be between ₹1 and ₹99,999")
            return
        }
        if (isNaN(gst) || gst < 0 || gst > 100) {
            toast.error("GST must be between 0% and 100%")
            return
        }
        setIsSavingPrice(true)
        try {
            const res = await authenticatedFetch("/api/admin/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ basePrice: price, gstPercentage: gst }),
            })
            const data = await res.json()
            if (data.success) {
                toast.success("Subscription pricing updated successfully")
            } else {
                toast.error(data.message || "Failed to update pricing")
            }
        } catch {
            toast.error("Failed to update pricing")
        } finally {
            setIsSavingPrice(false)
        }
    }

    const fetchSubscribers = async () => {
        try {
            const res = await authenticatedFetch("/api/admin/subscribers")
            const data = await res.json()
            if (data.success) {
                setSubscribers(data.subscribers)
                setFreeUsers(data.freeUsers)
                setStats({
                    totalPremium: data.totalPremium,
                    totalFree: data.totalFree,
                    totalExpired: data.totalExpired,
                })
            }
        } catch (err) {
            console.error("Error fetching subscribers:", err)
        } finally {
            setIsLoading(false)
        }
    }

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString("en-IN", {
            day: "numeric", month: "short", year: "numeric",
        })

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="flex-1 overflow-auto">
            <div className="p-8 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-serif font-bold tracking-tight">
                        Subscriptions & Plans
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Track premium subscribers and user trial statuses
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-6 sm:grid-cols-3 mb-8">
                    <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                                    <Crown className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-emerald-900">{stats.totalPremium}</p>
                                    <p className="text-sm text-emerald-600">Premium Subscribers</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-sky-600 flex items-center justify-center shadow-lg">
                                    <Users className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-blue-900">{stats.totalFree}</p>
                                    <p className="text-sm text-blue-600">Free Trial Users</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-red-200 bg-gradient-to-br from-red-50 to-rose-50">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
                                    <AlertTriangle className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-red-900">{stats.totalExpired}</p>
                                    <p className="text-sm text-red-600">Expired Trials</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Subscription Enforcement Toggle */}
                <AdminSubscriptionToggle />

                {/* Subscription Pricing Settings */}
                <Card className="mb-8 border-border">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg font-serif flex items-center gap-2">
                            <Settings className="h-5 w-5 text-primary" />
                            Subscription Pricing
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Set the subscription amount that users will be charged. Changes apply immediately to new payments.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 items-end">
                            <div className="space-y-2">
                                <Label htmlFor="base-price" className="text-sm font-medium">
                                    Base Price (₹/month)
                                </Label>
                                <div className="relative">
                                    <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="base-price"
                                        type="number"
                                        min="1"
                                        max="99999"
                                        step="1"
                                        value={basePrice}
                                        onChange={(e) => setBasePrice(e.target.value)}
                                        className="pl-9"
                                        placeholder="499"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gst-percentage" className="text-sm font-medium">
                                    GST (%)
                                </Label>
                                <Input
                                    id="gst-percentage"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={gstPercentage}
                                    onChange={(e) => setGstPercentage(e.target.value)}
                                    placeholder="18"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-muted-foreground">
                                    Total (incl. GST)
                                </Label>
                                <div className="h-9 flex items-center px-3 rounded-md border border-border bg-muted/50 text-sm font-semibold">
                                    ₹{pricingPreview.totalPrice.toFixed(2)}
                                    <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                                        (GST: ₹{pricingPreview.gstAmount.toFixed(2)})
                                    </span>
                                </div>
                            </div>
                            <Button
                                onClick={handleSavePricing}
                                disabled={isSavingPrice}
                                className="gap-2"
                            >
                                {isSavingPrice ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                Save Price
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs */}
                <Tabs defaultValue="premium">
                    <TabsList className="mb-6">
                        <TabsTrigger value="premium" className="gap-2">
                            <Crown className="h-4 w-4" /> Premium ({stats.totalPremium})
                        </TabsTrigger>
                        <TabsTrigger value="free" className="gap-2">
                            <Clock className="h-4 w-4" /> Free Trial ({stats.totalFree})
                        </TabsTrigger>
                    </TabsList>

                    {/* Premium Subscribers Table */}
                    <TabsContent value="premium">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-serif flex items-center gap-2">
                                    <Crown className="h-5 w-5 text-emerald-600" />
                                    Premium Subscribers
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {subscribers.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>User</TableHead>
                                                <TableHead>Contact</TableHead>
                                                <TableHead>Contacts Viewed</TableHead>
                                                <TableHead>Joined</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {subscribers.map((sub) => (
                                                <TableRow key={sub.id}>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">{sub.name}</p>
                                                            <p className="text-xs text-muted-foreground">{sub.email}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {sub.phone ? (
                                                            <div className="flex items-center gap-1 text-sm">
                                                                <Phone className="h-3 w-3 text-muted-foreground" />
                                                                {sub.phone}
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground">—</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1.5 text-sm">
                                                            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                                                            {sub.contactViewsUsed}
                                                            <span className="text-muted-foreground">/ ∞</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                            <CalendarDays className="h-3.5 w-3.5" />
                                                            {formatDate(sub.createdAt)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 gap-1">
                                                            <CheckCircle2 className="h-3 w-3" /> Premium
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="py-12 text-center">
                                        <Crown className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                                        <p className="text-muted-foreground">No premium subscribers yet</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Free Trial Users Table */}
                    <TabsContent value="free">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-serif flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-blue-600" />
                                    Free Trial Users
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {freeUsers.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>User</TableHead>
                                                <TableHead>Contact</TableHead>
                                                <TableHead>Contacts Used</TableHead>
                                                <TableHead>Trial Status</TableHead>
                                                <TableHead>Joined</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {freeUsers.map((u) => (
                                                <TableRow key={u.id}>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium">{u.name}</p>
                                                            <p className="text-xs text-muted-foreground">{u.email}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {u.phone ? (
                                                            <div className="flex items-center gap-1 text-sm">
                                                                <Phone className="h-3 w-3 text-muted-foreground" />
                                                                {u.phone}
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground">—</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1.5 text-sm">
                                                            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                                                            {u.contactViewsUsed}
                                                            <span className="text-muted-foreground">/ {u.contactViewsLimit}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {u.isTrialExpired ? (
                                                            <Badge variant="destructive" className="gap-1">
                                                                <XCircle className="h-3 w-3" /> Expired
                                                            </Badge>
                                                        ) : u.daysRemaining !== null ? (
                                                            <Badge className={`gap-1 ${
                                                                u.daysRemaining <= 7
                                                                    ? "bg-amber-100 text-amber-700 border-amber-200"
                                                                    : "bg-blue-100 text-blue-700 border-blue-200"
                                                            }`}>
                                                                <Clock className="h-3 w-3" />
                                                                {u.daysRemaining} days left
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline">Active</Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                            <CalendarDays className="h-3.5 w-3.5" />
                                                            {formatDate(u.createdAt)}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="py-12 text-center">
                                        <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                                        <p className="text-muted-foreground">No free trial users</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
