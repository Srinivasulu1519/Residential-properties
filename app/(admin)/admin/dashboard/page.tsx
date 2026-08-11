"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import {
  Building2,
  LandPlot,
  Home,
  ArrowRight,
  PlusCircle,
  Loader2,
  TrendingUp,
  Users,
  MapPin,
  Eye,
  ChevronRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useProperties } from "@/lib/property-context"
import { useAdminAuth } from "@/lib/admin-auth"
import { formatPrice } from "@/lib/data"

// Animated counter
function useCounter(target: number, duration = 1000) {
  const [count, setCount] = useState(0)
  const hasRun = useRef(false)

  useEffect(() => {
    if (target <= 0 || hasRun.current) return
    hasRun.current = true
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setCount(Math.round(eased * target))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration])

  return count
}

export default function AdminDashboardPage() {
  const { properties, loading } = useProperties()
  const { user } = useAdminAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(t)
  }, [])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const stats = {
    total: properties.length,
    plots: properties.filter((p) => p.type === "plot").length,
    apartments: properties.filter((p) => p.type === "apartment").length,
    villas: properties.filter((p) => p.type === "villa").length,
    farmhouse: properties.filter((p) => p.type === "farmhouse").length,
    agricultureLand: properties.filter((p) => p.type === "agriculture_land").length,
    rent: properties.filter((p) => p.type === "rent").length,
    commercial: properties.filter((p) => p.type === "commercial").length,
    independentHouse: properties.filter((p) => p.type === "independent_house").length,
    available: properties.filter((p) => p.status === "available").length,
    sold: properties.filter((p) => p.status === "sold").length,
    upcoming: properties.filter((p) => p.status === "upcoming").length,
  }

  const recentProperties = [...properties]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5)

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  return (
    <div className="space-y-8">
      {/* ========== HERO WELCOME ========== */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-primary/80 p-8 lg:p-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-primary/10 blur-2xl" />
        <div className="absolute top-4 right-8 w-24 h-24 rounded-xl bg-white/5 rotate-12" />
        <div className="absolute bottom-4 right-24 w-16 h-16 rounded-xl bg-white/5 -rotate-6" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-serif font-bold text-white tracking-tight">
              {getGreeting()}, {user?.name?.split(' ')[0] || "Admin"} 👋
            </h1>
            <p className="mt-2 text-white/50 text-sm max-w-lg leading-relaxed">
              You have <span className="text-primary/80 font-semibold">{stats.total} properties</span> listed,
              with <span className="text-primary/80 font-semibold">{stats.available} available</span> and{" "}
              <span className="text-primary/80 font-semibold">{stats.upcoming} upcoming</span>.
            </p>
          </div>
          <Button className="gap-2 bg-white text-slate-900 hover:bg-white/90 shadow-lg shadow-black/20 shrink-0" asChild>
            <Link href="/admin/properties/new">
              <PlusCircle className="h-4 w-4" />
              Add Property
            </Link>
          </Button>
        </div>
      </div>

      {/* ========== PROPERTY TYPE STATS ========== */}
      <div className={`transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Property Types</h2>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard
            label="Total"
            value={stats.total}
            icon={Building2}
            gradient="from-primary to-primary"
            bg="from-primary/10 to-primary/5"
            border="border-primary/10"
            delay={0}
          />
          <StatCard
            label="Plots"
            value={stats.plots}
            icon={LandPlot}
            gradient="from-sky-500 to-yellow-600"
            bg="from-sky-50 to-slate-50"
            border="border-sky-100"
            delay={40}
          />
          <StatCard
            label="Apartments"
            value={stats.apartments}
            icon={Building2}
            gradient="from-violet-500 to-purple-600"
            bg="from-violet-50 to-purple-50"
            border="border-violet-100"
            delay={80}
          />
          <StatCard
            label="Villas"
            value={stats.villas}
            icon={Home}
            gradient="from-rose-500 to-pink-600"
            bg="from-rose-50 to-pink-50"
            border="border-rose-100"
            delay={120}
          />
          <StatCard
            label="Farmhouse"
            value={stats.farmhouse}
            icon={Home}
            gradient="from-primary to-yellow-600"
            bg="from-primary/5 to-slate-50"
            border="border-primary/10"
            delay={160}
          />
          <StatCard
            label="Agri Land"
            value={stats.agricultureLand}
            icon={MapPin}
            gradient="from-green-500 to-primary"
            bg="from-green-50 to-primary/5"
            border="border-green-100"
            delay={200}
          />
          <StatCard
            label="Rent"
            value={stats.rent}
            icon={Users}
            gradient="from-yellow-500 to-cyan-600"
            bg="from-yellow-50 to-cyan-50"
            border="border-slate-100"
            delay={240}
          />
          <StatCard
            label="Commercial"
            value={stats.commercial}
            icon={Building2}
            gradient="from-primary to-yellow-600"
            bg="from-primary/5 to-slate-50"
            border="border-primary/10"
            delay={280}
          />
          <StatCard
            label="Ind. House"
            value={stats.independentHouse}
            icon={Home}
            gradient="from-orange-500 to-red-500"
            bg="from-orange-50 to-red-50"
            border="border-orange-100"
            delay={320}
          />
        </div>
      </div>

      {/* ========== STATUS OVERVIEW ========== */}
      <div className={`grid gap-4 sm:grid-cols-3 transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <Card className="border-primary/10 bg-gradient-to-br from-primary/5/50 to-white overflow-hidden hover:shadow-md transition-shadow group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 to-primary" />
          <CardContent className="flex items-center gap-4 p-5">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <Eye className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Available</p>
              <p className="font-serif text-2xl font-bold text-foreground">
                <AnimatedNumber value={stats.available} />
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/10 bg-gradient-to-br from-primary/5/50 to-white overflow-hidden hover:shadow-md transition-shadow group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 to-primary" />
          <CardContent className="flex items-center gap-4 p-5">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Upcoming</p>
              <p className="font-serif text-2xl font-bold text-foreground">
                <AnimatedNumber value={stats.upcoming} />
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-100 bg-gradient-to-br from-red-50/50 to-white overflow-hidden hover:shadow-md transition-shadow group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 to-red-600" />
          <CardContent className="flex items-center gap-4 p-5">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:scale-110 transition-transform">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sold</p>
              <p className="font-serif text-2xl font-bold text-foreground">
                <AnimatedNumber value={stats.sold} />
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========== RECENT LISTINGS TABLE ========== */}
      <div className={`transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <Card className="border-border overflow-hidden shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-slate-50/80 to-white border-b border-border/50">
            <div>
              <CardTitle className="font-serif text-lg">Recent Listings</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Latest properties added to the system</p>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 text-primary group" asChild>
              <Link href="/admin/properties">
                View All
                <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead>Property</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>City</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentProperties.length > 0 ? (
                  recentProperties.map((property) => (
                    <TableRow key={property.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-medium">
                        <Link
                          href={`/admin/properties/${property.id}/edit`}
                          className="transition-colors hover:text-primary"
                        >
                          {property.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs capitalize font-medium">
                          {property.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium tabular-nums">{"Rs. "}{formatPrice(property.price)}</TableCell>
                      <TableCell>
                        <Badge
                          className={`text-xs font-medium ${property.status === "available"
                            ? "bg-primary/10 text-primary border-primary/20"
                            : property.status === "sold"
                              ? "bg-red-100 text-red-800 border-red-200"
                              : "bg-primary/10 text-primary border-primary/20"
                            }`}
                        >
                          {property.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {property.city}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      <Building2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                      <p>No properties added yet</p>
                      <Button variant="link" size="sm" className="mt-1" asChild>
                        <Link href="/admin/properties/new">Add your first property</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ========== SUB-COMPONENTS ==========

function AnimatedNumber({ value }: { value: number }) {
  const count = useCounter(value)
  return <>{count}</>
}

function StatCard({
  label,
  value,
  icon: Icon,
  gradient,
  bg,
  border,
  delay,
}: {
  label: string
  value: number
  icon: any
  gradient: string
  bg: string
  border: string
  delay: number
}) {
  const count = useCounter(value)

  return (
    <Card className={`${border} bg-gradient-to-br ${bg} overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group relative`}>
      {/* Gradient accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`} />
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{label}</p>
            <p className="mt-1 font-serif text-3xl font-bold text-foreground tabular-nums">
              {count}
            </p>
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
