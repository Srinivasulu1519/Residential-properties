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
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

export default function SubscribersPage() {
    const { authenticatedFetch } = useAdminAuth()
    const [subscribers, setSubscribers] = useState<Subscriber[]>([])
    const [freeUsers, setFreeUsers] = useState<FreeUser[]>([])
    const [stats, setStats] = useState({ totalPremium: 0, totalFree: 0, totalExpired: 0 })
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchSubscribers()
    }, [])

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
                    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-slate-50">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-yellow-600 flex items-center justify-center shadow-lg">
                                    <Crown className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-900">{stats.totalPremium}</p>
                                    <p className="text-sm text-primary">Premium Subscribers</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 bg-gradient-to-br from-blue-50 to-sky-50">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-sky-600 flex items-center justify-center shadow-lg">
                                    <Users className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-blue-900">{stats.totalFree}</p>
                                    <p className="text-sm text-primary">Free Trial Users</p>
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
                                    <Crown className="h-5 w-5 text-primary" />
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
                                                        <Badge className="bg-primary/10 text-primary border-primary/20 gap-1">
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
                                    <Clock className="h-5 w-5 text-primary" />
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
                                                                    ? "bg-primary/10 text-primary border-primary/20"
                                                                    : "bg-slate-100 text-slate-600 border-slate-200"
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
