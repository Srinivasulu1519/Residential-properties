"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
    Building2,
    ArrowRight,
    Heart,
    Search,
    LogOut,
    User as UserIcon,
    Mail,
    Phone,
    Bell,
    Calendar,
    Star,
    History,
    ChevronRight,
    MapPin,
    Building,
    TrendingUp,
    Clock,
    Sparkles,
    Loader2,
    PlusCircle,
    Users
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PropertyCard } from "@/components/property-card"
import { type Property as PropertyType } from "@/lib/data"
import { useAdminAuth } from "@/lib/admin-auth"
import { PaymentModal } from "@/components/payment-modal"

// Animated counter hook
function useAnimatedCounter(target: number, duration: number = 1200) {
    const [count, setCount] = useState(0)
    const hasAnimated = useRef(false)

    useEffect(() => {
        if (target <= 0 || hasAnimated.current) return
        hasAnimated.current = true

        const startTime = performance.now()
        const animate = (now: number) => {
            const elapsed = now - startTime
            const progress = Math.min(elapsed / duration, 1)
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.round(eased * target))
            if (progress < 1) requestAnimationFrame(animate)
        }
        requestAnimationFrame(animate)
    }, [target, duration])

    return count
}

interface DashboardStats {
    savedProperties: number
    searchHistoryCount: number
    recentActivityCount: number
    memberSince: string
    totalActivities: number
}

export default function UserDashboardPage() {
    const { isAuthenticated, user, token, logout, refreshUser, authenticatedFetch } = useAdminAuth()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("overview")
    const [savedProperties, setSavedProperties] = useState<PropertyType[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [editForm, setEditForm] = useState({ name: "", phone: "" })
    const [isUpdating, setIsUpdating] = useState(false)
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [heroLoaded, setHeroLoaded] = useState(false)
    const [myProperties, setMyProperties] = useState<PropertyType[]>([])
    const [isMyPropertiesLoading, setIsMyPropertiesLoading] = useState(false)
    const [selectedPropertyLeads, setSelectedPropertyLeads] = useState<{ active: any[], passive: any[] }>({ active: [], passive: [] })
    const [isLeadsLoading, setIsLeadsLoading] = useState(false)
    const [isLeadsModalOpen, setIsLeadsModalOpen] = useState(false)
    const [activePropertyTitle, setActivePropertyTitle] = useState("")
    const [isDeleting, setIsDeleting] = useState<string | null>(null)
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const [userLeads, setUserLeads] = useState<any[]>([])
    const [isUserLeadsLoading, setIsUserLeadsLoading] = useState(false)
    const [searchHistory, setSearchHistory] = useState<string[]>([])

    useEffect(() => {
        if (user) {
            setEditForm({ name: user.name, phone: user.phone || "" })
        }
    }, [user])

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/auth/login")
        } else {
            refreshUser()
            fetchSavedProperties()
            fetchSearchHistory()
            fetchDashboardStats()
            fetchMyProperties()
        }
    }, [isAuthenticated, router, refreshUser])

    // Trigger entrance animation
    useEffect(() => {
        const timer = setTimeout(() => setHeroLoaded(true), 100)
        return () => clearTimeout(timer)
    }, [])

    const fetchSavedProperties = async () => {
        if (!isAuthenticated) return
        try {
            const res = await authenticatedFetch("/api/user/saved-properties")
            const data = await res.json()
            if (data.success) {
                setSavedProperties(data.properties)
            }
        } catch (err) {
            console.error("Error fetching saved properties:", err)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchSearchHistory = async () => {
        if (!isAuthenticated) return
        try {
            const res = await authenticatedFetch("/api/user/search-history")
            const data = await res.json()
            if (data.success) {
                setSearchHistory(data.history)
            }
        } catch (err) {
            console.error("Error fetching search history:", err)
        }
    }

    const fetchDashboardStats = async () => {
        if (!isAuthenticated) return
        try {
            const res = await authenticatedFetch("/api/user/dashboard-stats")
            const data = await res.json()
            if (data.success) {
                setStats(data.stats)
            }
        } catch (err) {
            console.error("Error fetching dashboard stats:", err)
        }
    }

    const fetchMyProperties = async () => {
        if (!isAuthenticated) return
        setIsMyPropertiesLoading(true)
        try {
            const res = await authenticatedFetch("/api/user/my-properties")
            const data = await res.json()
            if (data.success) {
                setMyProperties(data.properties)
            }
        } catch (err) {
            console.error("Error fetching my properties:", err)
        } finally {
            setIsMyPropertiesLoading(false)
        }
    }

    const fetchUserLeads = async () => {
        if (!isAuthenticated) return
        setIsUserLeadsLoading(true)
        try {
            const res = await authenticatedFetch("/api/user/leads")
            const data = await res.json()
            if (data.success) {
                setUserLeads(data.leads)
            }
        } catch (err) {
            console.error("Error fetching user leads:", err)
        } finally {
            setIsUserLeadsLoading(false)
        }
    }

    const handleViewLeads = async (propertyId: string, title: string) => {
        setActivePropertyTitle(title)
        setIsLeadsLoading(true)
        setIsLeadsModalOpen(true)
        try {
            const res = await authenticatedFetch(`/api/user/my-properties/${propertyId}/leads`)
            const data = await res.json()
            if (data.success) {
                setSelectedPropertyLeads({
                    active: data.activeLeads || [],
                    passive: data.passiveLeads || []
                })
            }
        } catch (err) {
            toast.error("Failed to fetch leads")
        } finally {
            setIsLeadsLoading(false)
        }
    }

    const handleUpgrade = () => {
        setIsPaymentModalOpen(true)
    }

    const onPaymentSuccess = () => {
        refreshUser()
        // Refresh local stats too after upgrade
        fetchDashboardStats()
    }

    const handleRenew = async (propertyId: string) => {
        try {
            const res = await authenticatedFetch(`/api/user/my-properties/${propertyId}/renew`, { method: "POST" })
            const data = await res.json()
            if (data.success) {
                toast.success("Listing renewed successfully!")
                fetchMyProperties() // Refresh the list
            } else {
                toast.error(data.message || "Failed to renew listing")
            }
        } catch (err) {
            toast.error("An error occurred during renewal")
        }
    }

    const handleDeleteProperty = async (propertyId: string) => {
        if (!confirm("Are you sure you want to delete this property? This action cannot be undone.")) return
        
        setIsDeleting(propertyId)
        try {
            const res = await authenticatedFetch("/api/user/my-properties", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ propertyId })
            })
            const data = await res.json()
            if (data.success) {
                toast.success("Property deleted successfully")
                fetchMyProperties()
            } else {
                toast.error(data.message || "Failed to delete property")
            }
        } catch (err) {
            toast.error("An error occurred while deleting")
        } finally {
            setIsDeleting(null)
        }
    }

    // Animated counters — must be before any early return
    const savedCount = useAnimatedCounter(stats?.savedProperties ?? 0)
    const searchCount = useAnimatedCounter(stats?.searchHistoryCount ?? 0)
    const activityCount = useAnimatedCounter(stats?.recentActivityCount ?? 0)

    if (!isAuthenticated || !user) {
        return null
    }

    const handleLogout = () => {
        logout()
        router.push("/")
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isAuthenticated) return
        setIsUpdating(true)
        try {
            const res = await authenticatedFetch("/api/user/profile", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(editForm)
            })
            const data = await res.json()
            if (data.success) {
                toast.success("Profile updated successfully")
                setIsEditing(false)
                refreshUser()
            } else {
                toast.error(data.message || "Failed to update profile")
            }
        } catch (err) {
            toast.error("Failed to update profile")
        } finally {
            setIsUpdating(false)
        }
    }

    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return "Good morning"
        if (hour < 18) return "Good afternoon"
        return "Good evening"
    }

    const formatMemberSince = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    }

    const statCards = [
        {
            label: "Saved Properties",
            value: savedCount,
            icon: Heart,
            gradient: "from-rose-500 to-pink-600",
            bg: "bg-gradient-to-br from-rose-50 to-pink-50",
            iconBg: "bg-gradient-to-br from-rose-500 to-pink-600",
            border: "border-rose-100"
        },
        {
            label: "Search History",
            value: searchCount,
            icon: Search,
            gradient: "from-teal-500 to-emerald-600",
            bg: "bg-gradient-to-br from-teal-50 to-emerald-50",
            iconBg: "bg-gradient-to-br from-teal-500 to-emerald-600",
            border: "border-teal-100"
        },
        {
            label: "Recent Activity",
            value: activityCount,
            icon: TrendingUp,
            gradient: "from-amber-500 to-orange-600",
            bg: "bg-gradient-to-br from-amber-50 to-orange-50",
            iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
            border: "border-amber-100"
        },
    ]

    const recentActivity = (user.activities || []).map((act: { type: string; title: string; date: string }) => {
        let Icon = UserIcon
        let color = "text-slate-500"
        let bg = "bg-slate-100"
        if (act.type === "heart") { Icon = Heart; color = "text-rose-500"; bg = "bg-rose-50" }
        if (act.type === "search") { Icon = Search; color = "text-teal-500"; bg = "bg-teal-50" }
        if (act.type === "account") { Icon = UserIcon; color = "text-emerald-500"; bg = "bg-emerald-50" }

        const date = new Date(act.date)
        const diffDays = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 3600 * 24))
        const dateStr = diffDays === 0 ? "Today" : diffDays === 1 ? "Yesterday" : `${diffDays} days ago`

        return { title: act.title, date: dateStr, icon: Icon, color, bg }
    })

    return (
        <div className="flex min-h-screen flex-col bg-slate-50/50">
            <SiteHeader />

            <main className="flex-1 pb-16">
                {/* ============ HERO SECTION ============ */}
                <div className="relative overflow-hidden">
                    {/* Background Image */}
                    <div className="absolute inset-0">
                        <Image
                            src="/images/dashboard-hero.png"
                            alt=""
                            fill
                            className="object-cover"
                            priority
                        />
                        {/* Dark gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/70 to-slate-900/90" />
                        {/* Animated subtle shimmer */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent dashboard-shimmer" />
                    </div>

                    {/* Hero Content */}
                    <div className="relative mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
                        <div className={`transition-all duration-700 ease-out ${heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start flex-1">
                                    {/* Avatar with glow */}
                                    <div className="relative group">
                                        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 opacity-60 blur-md group-hover:opacity-80 transition-opacity duration-500" />
                                        <Avatar className="relative h-28 w-28 border-[4px] border-white/20 shadow-2xl transition-transform duration-500 group-hover:scale-105">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}&backgroundColor=0d9488,059669,0891b2&textColor=ffffff&fontSize=40`} />
                                            <AvatarFallback className="bg-emerald-600 text-white text-3xl font-bold">{user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-white/20 shadow-lg">
                                            <Sparkles className="h-4 w-4 text-white" />
                                        </div>
                                    </div>

                                    {/* User Info */}
                                    <div className="space-y-3 flex-1 text-center md:text-left">
                                        <div className="space-y-2">
                                            <div className="flex flex-col md:flex-row md:items-center gap-3">
                                                <h1 className="text-3xl lg:text-4xl font-serif font-bold text-white tracking-tight">
                                                    {getGreeting()}, {user.name.split(' ')[0]}
                                                </h1>
                                                {user.role === "admin" ? (
                                                    <Badge className="w-fit bg-purple-500/20 text-purple-300 border-purple-500/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                                                        Admin
                                                    </Badge>
                                                ) : user.subscriptionActive ? (
                                                    <Badge className="w-fit bg-emerald-500/20 text-emerald-300 border-emerald-500/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                                                        Premium Member
                                                    </Badge>
                                                ) : (
                                                    <Badge className="w-fit bg-amber-500/20 text-amber-300 border-amber-500/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                                                        Free Trial
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-base text-white/60 max-w-xl leading-relaxed">
                                                Welcome to your personal dashboard. You have{" "}
                                                <span className="text-emerald-400 font-semibold">{stats?.savedProperties ?? 0} saved properties</span>
                                                {" "}and{" "}
                                                <span className="text-emerald-400 font-semibold">{stats?.searchHistoryCount ?? 0} searches</span>.
                                            </p>
                                        </div>
                                        {stats?.memberSince && (
                                            <div className="flex items-center gap-2 text-white/40 text-sm">
                                                <Clock className="h-3.5 w-3.5" />
                                                <span>Member since {formatMemberSince(stats.memberSince)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Action buttons */}
                                <div className="flex gap-3 self-center md:self-start">
                                    {user.role !== "admin" && !user.subscriptionActive && (
                                        <Button size="sm" onClick={handleUpgrade} disabled={isUpdating} className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-none hover:from-amber-600 hover:to-orange-700 shadow-lg">
                                            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1.5" />}
                                            Upgrade to Premium
                                        </Button>
                                    )}
                                    <Dialog open={isEditing} onOpenChange={setIsEditing}>
                                        <DialogTrigger asChild>
                                            <Button size="sm" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm">
                                                <UserIcon className="h-4 w-4 mr-1.5" /> Edit Profile
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader>
                                                <DialogTitle>Profile Settings</DialogTitle>
                                                <DialogDescription>
                                                    Manage your account details and preferences.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <form onSubmit={handleUpdateProfile} className="space-y-6 py-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name" className="text-sm font-semibold">Full Name</Label>
                                                    <Input
                                                        id="name"
                                                        value={editForm.name}
                                                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                                        placeholder="John Doe"
                                                        className="h-12 bg-slate-50 focus:bg-white"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="phone" className="text-sm font-semibold">Phone Number</Label>
                                                    <Input
                                                        id="phone"
                                                        value={editForm.phone}
                                                        onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                                                        className="h-12 bg-slate-50 focus:bg-white"
                                                        placeholder="e.g. +1 234 567 890"
                                                    />
                                                </div>
                                                <DialogFooter>
                                                    <Button type="submit" disabled={isUpdating} className="w-full h-12 rounded-xl">
                                                        {isUpdating ? "Saving..." : "Save Changes"}
                                                    </Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                    <Button size="sm" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm" asChild>
                                        <Link href="/properties">
                                            <Search className="h-4 w-4 mr-1.5" /> Browse Properties
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl px-4 mt-8 lg:px-8">
                    {/* ============ STATS GRID ============ */}
                    <div className={`grid gap-4 sm:grid-cols-3 mb-8 transition-all duration-700 delay-200 ${heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                        {statCards.map((stat, idx) => (
                            <Card
                                key={stat.label}
                                className={`${stat.bg} ${stat.border} border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group overflow-hidden relative`}
                                style={{ transitionDelay: `${idx * 80}ms` }}
                            >
                                {/* Subtle gradient accent bar */}
                                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient} opacity-80`} />
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className={`h-14 w-14 rounded-2xl ${stat.iconBg} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        <stat.icon className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                        <p className="text-3xl font-bold text-slate-900 tabular-nums">{stat.value}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* ============ MAIN CONTENT ============ */}
                    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 transition-all duration-700 delay-400 ${heroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                        {/* Left Col: Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
                                <TabsList className="bg-white/80 backdrop-blur-sm p-1.5 border border-slate-200 shadow-sm rounded-xl">
                                    <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-4">Overview</TabsTrigger>
                                    <TabsTrigger value="my-properties" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-4" onClick={fetchMyProperties}>My Properties</TabsTrigger>
                                    <TabsTrigger value="my-leads" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-4" onClick={fetchUserLeads}>My Leads</TabsTrigger>
                                    <TabsTrigger value="saved" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-4">Saved Properties</TabsTrigger>
                                    <TabsTrigger value="history" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg px-4">Search History</TabsTrigger>
                                </TabsList>

                                <TabsContent value="overview" className="mt-6 space-y-6">
                                    {/* Recommendations Card */}
                                    <Card className="border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                        <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <CardTitle className="text-xl font-serif">Recommended for You</CardTitle>
                                                    <CardDescription>Based on your recent searches</CardDescription>
                                                </div>
                                                <Button size="sm" variant="ghost" className="text-primary hover:bg-slate-100 group" asChild>
                                                    <Link href="/properties">
                                                        View All <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            <div className="p-8 text-center bg-white space-y-4">
                                                <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
                                                    <Star className="h-8 w-8 text-emerald-400" />
                                                </div>
                                                <div className="max-w-xs mx-auto">
                                                    <p className="font-semibold text-slate-900">Start exploring to see recommendations</p>
                                                    <p className="text-sm text-slate-500 mt-1">We&apos;ll show you properties tailored to your taste once you start browsing.</p>
                                                </div>
                                                <Button variant="outline" className="hover:bg-primary hover:text-white transition-colors" asChild>
                                                    <Link href="/properties">Start Browsing</Link>
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Quick Action Cards */}
                                    <div className="grid gap-6 sm:grid-cols-2">
                                        <Card className="border-slate-200 hover:border-sky-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer overflow-hidden relative">
                                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                                                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-sky-500 to-teal-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                    <Building2 className="h-8 w-8 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="font-serif text-lg font-bold text-slate-900">Find Plots</h3>
                                                    <p className="text-sm text-slate-500 mt-1 italic">Residential & Commercial land</p>
                                                </div>
                                                <Link href="/properties?type=plot" className="text-sky-600 text-sm font-semibold flex items-center gap-1 group-hover:underline">
                                                    Explore Plots <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                                </Link>
                                            </CardContent>
                                        </Card>

                                        <Card className="border-slate-200 hover:border-emerald-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer overflow-hidden relative">
                                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                                                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                    <Heart className="h-8 w-8 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="font-serif text-lg font-bold text-slate-900">Latest Drops</h3>
                                                    <p className="text-sm text-slate-500 mt-1 italic">New properties added today</p>
                                                </div>
                                                <Link href="/properties?status=available" className="text-emerald-600 text-sm font-semibold flex items-center gap-1 group-hover:underline">
                                                    View Newest <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                                </Link>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>

                                <TabsContent value="my-properties" className="mt-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-bold font-serif">Listed Properties</h3>
                                        <Button asChild size="sm" className="gap-2">
                                            <Link href="/post-property">
                                                <PlusCircle className="h-4 w-4" /> Post New
                                            </Link>
                                        </Button>
                                    </div>
                                    {isMyPropertiesLoading ? (
                                        <div className="py-20 text-center">
                                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                                        </div>
                                    ) : myProperties.length > 0 ? (
                                        <div className="grid gap-6">
                                            {myProperties.map((p) => (
                                                <Card key={p.id} className="overflow-hidden border-slate-200 hover:shadow-md transition-all">
                                                    <div className="flex flex-col md:flex-row h-full">
                                                        <div className="relative w-full md:w-64 h-48 md:h-auto overflow-hidden shrink-0">
                                                            <Image
                                                                src={p.images[0] || "/images/placeholder-property.png"}
                                                                alt={p.title}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                            <div className="absolute top-3 left-3 flex flex-col gap-2">
                                                                <Badge className="w-fit bg-slate-900/80 backdrop-blur-md text-white border-none text-[10px] uppercase font-bold px-2 py-0.5">
                                                                    {p.type.replace(/_/g, " ")}
                                                                </Badge>
                                                                {(p as any).isInactive ? (
                                                                    <Badge className="bg-rose-500 hover:bg-rose-600 text-white w-fit text-[10px] uppercase shadow-md animate-pulse">Inactive (Trial Expired)</Badge>
                                                                ) : !(p as any).isActive ? (
                                                                    <Badge className="bg-slate-500 text-white w-fit text-[10px] uppercase shadow-md">Deactivated</Badge>
                                                                ) : (p as any).isExpired ? (
                                                                    <Badge variant="destructive" className="w-fit text-[10px] uppercase">Expired</Badge>
                                                                ) : (
                                                                    <Badge className="w-fit bg-emerald-500 text-white text-[10px] uppercase">{(p as any).daysRemaining} Days Left</Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <CardContent className="p-6 flex-1 flex flex-col">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <h4 className="text-lg font-bold text-slate-900 line-clamp-1">{p.title}</h4>
                                                                <p className="text-primary font-bold text-lg">
                                                                    ₹{p.price.toLocaleString()}
                                                                    <span className="text-[10px] text-muted-foreground ml-1">/{p.priceUnit}</span>
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center text-muted-foreground text-xs mb-4">
                                                                <MapPin className="h-3 w-3 mr-1" />
                                                                {p.city}, {p.location}
                                                            </div>
                                                            <div className="mt-auto pt-4 border-t border-slate-100 flex flex-wrap gap-2 justify-between items-center">
                                                                <div className="flex gap-2">
                                                                    <Button variant="outline" size="sm" asChild>
                                                                        <Link href={`/properties/edit/${p.id}`}>Edit</Link>
                                                                    </Button>
                                                                    <Button 
                                                                        variant="destructive" 
                                                                        size="sm" 
                                                                        onClick={() => handleDeleteProperty(p.id)}
                                                                        disabled={isDeleting === p.id}
                                                                    >
                                                                        {isDeleting === p.id ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                                                                        Delete
                                                                    </Button>
                                                                    <Button 
                                                                        variant="secondary" 
                                                                        size="sm" 
                                                                        className="bg-sky-50 text-sky-700 hover:bg-sky-100 border-none"
                                                                        onClick={() => handleViewLeads(p.id, p.title)}
                                                                    >
                                                                        <Users className="h-4 w-4 mr-1.5" /> View Interested Users
                                                                    </Button>
                                                                </div>
                                                                {(p as any).isExpired ? (
                                                                    <Button size="sm" className="bg-amber-500 hover:bg-amber-600" onClick={() => handleRenew(p.id)}>Renew Listing</Button>
                                                                ) : (p as any).isInactive && (
                                                                    <Button size="sm" className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-none shadow-md animate-bounce-subtle" onClick={handleUpgrade}>
                                                                        <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                                                                        Upgrade to Activate
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </CardContent>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-20 text-center bg-white border border-dashed border-slate-300 rounded-xl">
                                            <Building2 className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                                            <p className="text-slate-500 font-medium">You haven&apos;t posted any properties yet.</p>
                                            <Button className="mt-4" asChild>
                                                <Link href="/post-property">Post Your First Listing</Link>
                                            </Button>
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="my-leads" className="mt-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-bold font-serif">Interested Leads</h3>
                                        <Badge className="bg-emerald-100 text-emerald-800 border-none px-3 py-1">
                                            {userLeads.length} Total Prospects
                                        </Badge>
                                    </div>
                                    
                                    {isUserLeadsLoading ? (
                                        <div className="py-20 text-center">
                                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                                        </div>
                                    ) : userLeads.length > 0 ? (
                                        <div className="grid gap-6">
                                            {userLeads.map((lead: any) => (
                                                <Card key={lead.id} className="overflow-hidden border-slate-200 hover:shadow-md transition-all group">
                                                    <CardContent className="p-0">
                                                        <div className="flex flex-col md:flex-row">
                                                            {/* User Details */}
                                                            <div className="p-6 flex-1 flex items-center gap-4 bg-slate-50/50 border-b md:border-b-0 md:border-r border-slate-100">
                                                                <Avatar className="h-14 w-14 border-2 border-white shadow-sm ring-2 ring-emerald-500/10">
                                                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${lead.user.name}`} />
                                                                    <AvatarFallback className="bg-emerald-600 text-white font-bold">{lead.user.name.charAt(0)}</AvatarFallback>
                                                                </Avatar>
                                                                <div className="space-y-1">
                                                                    <h4 className="text-lg font-bold text-slate-900 leading-none">{lead.user.name}</h4>
                                                                    <div className="flex flex-col gap-1.5 pt-1">
                                                                        <div className="flex items-center text-xs text-slate-900 font-bold gap-2 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 w-fit">
                                                                            <Phone className="h-3 w-3 text-emerald-600" />
                                                                            <span>{lead.user.phone}</span>
                                                                        </div>
                                                                        <div className="flex items-center text-xs text-slate-500 gap-2">
                                                                            <Mail className="h-3 w-3 text-emerald-500" />
                                                                            <span>{lead.user.email}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            
                                                            {/* Property Context */}
                                                            <div className="p-6 flex-[1.5] bg-white flex flex-col justify-between">
                                                                <div>
                                                                    <div className="flex justify-between items-start mb-3">
                                                                        <div>
                                                                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Interested In</p>
                                                                            <h5 className="text-lg font-serif font-bold text-slate-900 line-clamp-1">{lead.property.title}</h5>
                                                                        </div>
                                                                        <Badge className="bg-rose-50 text-rose-700 border-none text-[10px] uppercase font-bold px-2 py-0.5">
                                                                            High Interest
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="flex items-center text-xs text-slate-400 mb-4">
                                                                        <MapPin className="h-3 w-3 mr-1" />
                                                                        {lead.property.city} · {lead.property.type.replace(/_/g, " ")}
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                                                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold uppercase tracking-tight">
                                                                        <Calendar className="h-3 w-3" />
                                                                        Expressed on {new Date(lead.createdAt).toLocaleDateString()}
                                                                    </div>
                                                                    <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 gap-1.5" asChild>
                                                                        <Link href={`/properties/${lead.property.id}`}>
                                                                            View Listing <ChevronRight className="h-4 w-4" />
                                                                        </Link>
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-20 text-center bg-white border border-dashed border-slate-300 rounded-xl">
                                            <Users className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                                            <p className="text-slate-500 font-medium">No leads found yet.</p>
                                            <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">Leads will appear here when users express interest in your property listings.</p>
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="saved" className="mt-6">
                                    {isLoading ? (
                                        <div className="py-20 text-center">
                                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                                                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
                                            </div>
                                        </div>
                                    ) : savedProperties.length > 0 ? (
                                        <div className="grid gap-6 sm:grid-cols-2">
                                            {savedProperties.map((property) => (
                                                <PropertyCard key={property.id} property={property} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-20 text-center bg-white border border-dashed border-slate-300 rounded-xl">
                                            <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center mb-4">
                                                <Heart className="h-8 w-8 text-rose-300" />
                                            </div>
                                            <p className="text-slate-500 font-medium">You haven&apos;t saved any properties yet.</p>
                                            <Button variant="link" className="text-primary mt-2" asChild>
                                                <Link href="/properties">Find something you love</Link>
                                            </Button>
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="history" className="mt-6">
                                    {searchHistory.length > 0 ? (
                                        <Card className="border-slate-200 overflow-hidden">
                                            <CardContent className="p-0">
                                                <div className="divide-y divide-slate-100">
                                                    {searchHistory.map((query: string, k: number) => (
                                                        <div key={k} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center group-hover:from-teal-100 group-hover:to-emerald-100 transition-colors">
                                                                    <Search className="h-4 w-4 text-teal-500" />
                                                                </div>
                                                                <p className="font-medium text-slate-700">{query}</p>
                                                            </div>
                                                            <Button variant="ghost" size="sm" className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" asChild>
                                                                <Link href={`/properties?search=${encodeURIComponent(query)}`}>
                                                                    View Results <ArrowRight className="h-3.5 w-3.5 ml-1" />
                                                                </Link>
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        <div className="py-20 text-center bg-white border border-dashed border-slate-300 rounded-xl">
                                            <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center mb-4">
                                                <Search className="h-8 w-8 text-teal-300" />
                                            </div>
                                            <p className="text-slate-500 font-medium">No search history yet.</p>
                                            <Button variant="link" className="text-primary mt-2" asChild>
                                                <Link href="/properties">Start searching</Link>
                                            </Button>
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* ============ RIGHT SIDEBAR ============ */}
                        <div className="space-y-8">
                            {/* Account Details */}
                            <Card className="border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 font-sans">
                                        Account Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shrink-0">
                                                <UserIcon className="h-4 w-4 text-slate-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-tight">Full Name</p>
                                                <p className="text-slate-900 font-medium">{user.name}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-teal-50 to-emerald-100 flex items-center justify-center shrink-0">
                                                <Mail className="h-4 w-4 text-teal-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-tight">Email Address</p>
                                                <p className="text-slate-900 font-medium break-all">{user.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center shrink-0">
                                                <Phone className="h-4 w-4 text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-tight">Phone Number</p>
                                                <p className="text-slate-900 font-medium">
                                                    {user.phone || (
                                                        <span className="text-slate-400 italic font-normal">Not provided</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {stats?.memberSince && (
                                            <div className="flex items-start gap-3">
                                                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center shrink-0">
                                                    <Calendar className="h-4 w-4 text-amber-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-tight">Member Since</p>
                                                    <p className="text-slate-900 font-medium">{formatMemberSince(stats.memberSince)}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        variant="outline"
                                        className="w-full text-slate-600 text-xs py-1 h-9 hover:bg-primary hover:text-white transition-colors"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        Edit Profile
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Recent Activity */}
                            <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 font-sans">
                                        Recent Activity
                                    </CardTitle>
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Live</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-2">
                                    {recentActivity.length > 0 ? (
                                        <div className="space-y-5">
                                            {recentActivity.map((activity: any, i: number) => (
                                                <div key={i} className="flex gap-4 relative group">
                                                    {i !== recentActivity.length - 1 && (
                                                        <div className="absolute left-[17px] top-9 bottom-[-20px] w-px bg-slate-100" />
                                                    )}
                                                    <div className={`h-9 w-9 rounded-full ${activity.bg} border border-slate-100 flex items-center justify-center relative z-10 shrink-0 group-hover:scale-110 transition-transform`}>
                                                        <activity.icon className={`h-4 w-4 ${activity.color}`} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-medium text-slate-900 leading-none">{activity.title}</p>
                                                        <p className="text-xs text-slate-400">{activity.date}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center">
                                            <History className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                                            <p className="text-sm text-slate-400">No activity yet</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>

            {/* Leads Modal */}
            <Dialog open={isLeadsModalOpen} onOpenChange={setIsLeadsModalOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col p-0 overflow-hidden">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle className="font-serif text-xl flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            Interested Leads
                        </DialogTitle>
                        <DialogDescription className="mt-1">
                            People who viewed context details for: <span className="font-semibold text-slate-900">{activePropertyTitle}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {isLeadsLoading ? (
                            <div className="py-20 flex justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : (selectedPropertyLeads.active.length > 0 || selectedPropertyLeads.passive.length > 0) ? (
                            <div className="space-y-8">
                                {/* Active Leads Section */}
                                {selectedPropertyLeads.active.length > 0 && (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 border-b border-rose-100 pb-2">
                                            <Sparkles className="h-4 w-4 text-rose-500" />
                                            <h4 className="text-sm font-bold uppercase tracking-wider text-rose-600">Active Interest (High Intent)</h4>
                                        </div>
                                        <div className="grid gap-3">
                                            {selectedPropertyLeads.active.map((lead) => (
                                                <div key={lead.id} className="flex items-center justify-between p-4 rounded-xl border border-rose-100 bg-rose-50/30 hover:bg-white hover:shadow-sm transition-all group">
                                                    <div className="flex items-center gap-4">
                                                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${lead.name}`} />
                                                            <AvatarFallback>{lead.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-bold text-slate-900 text-sm">{lead.name}</p>
                                                            <div className="flex flex-col gap-0.5 mt-0.5">
                                                                <p className="text-[10px] text-slate-900 font-bold flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 w-fit">
                                                                    <Phone className="h-3 w-3 text-emerald-600" /> {lead.phone}
                                                                </p>
                                                                <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                                                                    <Mail className="h-3 w-3" /> {lead.email}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <Badge className="bg-rose-500 text-white border-none text-[9px] uppercase">EXPRESSED INTEREST</Badge>
                                                        <p className="text-[9px] text-slate-400 mt-1 uppercase font-semibold">
                                                            {new Date(lead.expressedAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Passive Leads Section */}
                                {selectedPropertyLeads.passive.length > 0 && (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                                            <Users className="h-4 w-4 text-slate-400" />
                                            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">Passive Views (Medium Intent)</h4>
                                        </div>
                                        <div className="grid gap-3">
                                            {selectedPropertyLeads.passive.map((lead) => (
                                                <div key={lead.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:shadow-sm transition-all group">
                                                    <div className="flex items-center gap-4">
                                                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${lead.name}`} />
                                                            <AvatarFallback>{lead.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-bold text-slate-900 text-sm">{lead.name}</p>
                                                            <div className="flex flex-col gap-0.5 mt-0.5">
                                                                <p className="text-[10px] text-slate-700 font-medium flex items-center gap-1.5">
                                                                    <Phone className="h-3 w-3 text-slate-400" /> {lead.phone}
                                                                </p>
                                                                <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                                                                    <Mail className="h-3 w-3" /> {lead.email}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <Badge variant="outline" className="text-[9px] uppercase bg-white">VIEWED CONTACT</Badge>
                                                        <p className="text-[9px] text-slate-400 mt-1 uppercase font-semibold">
                                                            {new Date(lead.viewedAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="py-12 text-center text-muted-foreground bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                <Sparkles className="h-8 w-8 mx-auto mb-3 text-slate-300" />
                                <p>No leads recorded for this property yet.</p>
                                <p className="text-xs mt-1">Leads appear when users view your contact details.</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="p-6 pt-0 mt-auto border-t border-slate-100 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                        <Button className="w-full mt-4" variant="outline" onClick={() => setIsLeadsModalOpen(false)}>
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Payment Modal */}
            <PaymentModal 
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onSuccess={onPaymentSuccess}
            />
        </div>
    )
}
