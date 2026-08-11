"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Building2, LandPlot, Home, MapPin, Users, TrendingUp, Loader2, Search, ChevronDown, X, SlidersHorizontal, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PropertyCard } from "@/components/property-card"
import { TiltCard } from "@/components/ui/tilt-card"
import { useProperties } from "@/lib/property-context"
import { useAdminAuth } from "@/lib/admin-auth"
import { PROPERTY_TYPES } from "@/lib/data"
import { HeroSearch } from "@/components/hero-search"

const CATEGORIES = [
  {
    label: "Plots",
    type: "plot" as const,
    icon: LandPlot,
    image: "/images/plot-category.jpg",
    description: "Premium residential and commercial plots",
  },
  {
    label: "Apartments",
    type: "apartment" as const,
    icon: Building2,
    image: "/images/apartment-category.jpg",
    description: "Modern apartments in prime locations",
  },
  {
    label: "Villas",
    type: "villa" as const,
    icon: Home,
    image: "/images/villa-category.jpg",
    description: "Luxury villas with premium amenities",
  },
]

export default function HomePage() {
  const router = useRouter()
  const { properties, loading } = useProperties()
  const { isAuthenticated, user } = useAdminAuth()
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    const welcome = sessionStorage.getItem("show_welcome")
    if (welcome === "true") {
      setShowWelcome(true)
      sessionStorage.removeItem("show_welcome")
      const timer = setTimeout(() => setShowWelcome(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [])

  const featured = properties.filter((p) => p.status === "available").slice(0, 6)
  const plotCount = properties.filter((p) => p.type === "plot").length
  const aptCount = properties.filter((p) => p.type === "apartment").length
  const villaCount = properties.filter((p) => p.type === "villa").length
  const counts: Record<string, number> = { plot: plotCount, apartment: aptCount, villa: villaCount }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />

      {/* Hero */}
      <section className="relative flex items-center justify-center bg-foreground py-24 lg:py-36">
        <Image
          src="/images/hero-bg.jpg"
          alt=""
          fill
          className="object-cover opacity-30"
          priority
          sizes="100vw"
        />
        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
          <div className="transition-all duration-1000 opacity-100">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-emerald-400 drop-shadow-sm">
              Elevate Your Standard of Living
            </p>
            <h1 className="mb-8 font-serif text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl text-balance drop-shadow-2xl">
              {isAuthenticated && user ? `Welcome back, ${user.name.split(' ')[0]}!` : "Discover Properties That Define You"}
            </h1>
          </div>

          {/* Luxury Segmented Search */}
          <HeroSearch properties={properties} className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300" />
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 lg:px-8 lg:py-20">
        <div className="mb-10 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
            Browse by Category
          </p>
          <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl text-balance">
            Explore Property Types
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.type}
              href={`/properties?type=${cat.type}`}
              className="group block"
            >
              <TiltCard className="h-full">
                <Card className="h-full overflow-hidden border-border bg-card/50 backdrop-blur-sm transition-all duration-300 shadow-xl group-hover:shadow-primary/20">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                      src={cat.image}
                      alt={cat.label}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-black/40 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 transform transition-transform duration-500 translate-y-2 group-hover:translate-y-0">
                      <div className="flex items-center gap-2 text-white">
                        <cat.icon className="h-6 w-6 text-white drop-shadow-md" />
                        <h3 className="font-serif text-2xl font-bold drop-shadow-md">{cat.label}</h3>
                      </div>
                      <p className="mt-2 text-sm text-slate-200 opacity-90 transition-opacity duration-300">{cat.description}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs font-semibold text-white bg-white/20 border border-white/20 px-3 py-1 rounded-full backdrop-blur-md shadow-sm">
                          {loading ? "..." : `${counts[cat.type]} ${counts[cat.type] === 1 ? "Listing" : "Listings"}`}
                        </span>
                        <ArrowRight className="h-4 w-4 text-white opacity-0 -translate-x-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0" />
                      </div>
                    </div>
                  </div>
                </Card>
              </TiltCard>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Listing Section */}
      <section className="bg-white py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
                Featured Listings
              </p>
              <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl text-balance">
                Available Properties
              </h2>
            </div>
            <Button variant="outline" className="gap-2" asChild>
              <Link href="/properties">
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading properties...</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* PropVista Advantage */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 lg:px-8 lg:py-20">
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary drop-shadow-sm">
            Why Choose Us
          </p>
          <h2 className="font-serif text-3xl font-bold text-foreground md:text-5xl text-balance">
            The PropVista Advantage
          </h2>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              title: "Verified Listings",
              description: "Every property on our platform goes through a rigorous physical and legal verification process to ensure complete peace of mind for buyers.",
              icon: "🛡️"
            },
            {
              title: "Transparent Pricing",
              description: "No hidden fees or surprise commissions. We believe in 100% transparency between buyers, sellers, and tenants.",
              icon: "💎"
            },
            {
              title: "Premium Support",
              description: "Our dedicated relationship managers are available 24/7 to guide you through property visits, paperwork, and loans.",
              icon: "🤝"
            }
          ].map((adv, i) => (
            <TiltCard key={adv.title} className="h-full">
              <div className="relative h-full overflow-hidden rounded-2xl border border-slate-100 bg-white p-8 shadow-xl transition-all duration-300 hover:shadow-primary/10">
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />
                <div className="relative z-10">
                  <span className="mb-6 inline-block text-5xl filter drop-shadow-md">{adv.icon}</span>
                  <h3 className="mb-4 font-serif text-2xl font-bold text-slate-800">{adv.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{adv.description}</p>
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white mx-auto w-full px-4 py-14 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Building2,
                value: loading ? "..." : properties.length,
                label: "Total Properties",
              },
              {
                icon: MapPin,
                value: loading ? "..." : new Set(properties.map((p) => p.city)).size,
                label: "Cities Covered",
              },
              {
                icon: Users,
                value: "500+",
                label: "Happy Customers",
              },
              {
                icon: TrendingUp,
                value: loading ? "..." : properties.filter((p) => p.status === "available").length,
                label: "Available Now",
              },
            ].map((stat, i) => (
              <TiltCard key={stat.label}>
                <Card className="h-full border-slate-100 bg-white hover:bg-slate-50 transition-colors shadow-lg shadow-primary/5 duration-500 overflow-hidden relative group">
                  <div className="absolute -inset-x-0 -top-20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 h-32 bg-gradient-to-b from-primary/10 to-transparent blur-2xl" />
                  <CardContent className="flex flex-col items-center gap-3 p-8 relative z-10">
                    <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
                      <stat.icon className="h-7 w-7 text-primary drop-shadow-sm" />
                    </div>
                    <p className="font-serif text-4xl font-bold bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-500">
                      {stat.value}
                    </p>
                    <p className="text-sm font-medium tracking-wide text-slate-500 uppercase">{stat.label}</p>
                  </CardContent>
                </Card>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
