"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Building2, LandPlot, Home, MapPin, Users, TrendingUp, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PropertyCard } from "@/components/property-card"
import { TiltCard } from "@/components/ui/tilt-card"
import { useProperties } from "@/lib/property-context"
import { useAdminAuth } from "@/lib/admin-auth"
import { PROPERTY_TYPES } from "@/lib/data"

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
  const [searchQuery, setSearchQuery] = useState("")
  const [showWelcome, setShowWelcome] = useState(false)
  const [suggestions, setSuggestions] = useState<{ label: string; value: string; type: 'type' | 'location' }[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  useEffect(() => {
    const welcome = sessionStorage.getItem("show_welcome")
    if (welcome === "true") {
      setShowWelcome(true)
      sessionStorage.removeItem("show_welcome")
      const timer = setTimeout(() => setShowWelcome(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([])
      return
    }

    const query = searchQuery.toLowerCase()
    const newSuggestions: { label: string; value: string; type: 'type' | 'location' }[] = []

    // Match property types
    PROPERTY_TYPES.forEach(t => {
      if (t.label.toLowerCase().includes(query) || t.value.toLowerCase().includes(query)) {
        newSuggestions.push({ label: t.label, value: t.value, type: 'type' })
      }
    })

    // Match cities (dynamic from properties)
    const uniqueCities = Array.from(new Set(properties.map(p => p.city)))
    uniqueCities.forEach(c => {
      if (c.toLowerCase().includes(query)) {
        newSuggestions.push({ label: c, value: c, type: 'location' })
      }
    })

    // Match specific locations/areas from properties
    const uniqueLocations = Array.from(new Set(properties.filter(p => p.location).map(p => p.location!)))
    uniqueLocations.forEach(l => {
      if (l.toLowerCase().includes(query) && !uniqueCities.some(c => l.includes(c))) {
        newSuggestions.push({ label: l, value: l, type: 'location' })
      }
    })

    // Match full addresses
    const uniqueFullAddresses = Array.from(new Set(properties.map(p => p.fullAddress)))
    uniqueFullAddresses.forEach(fa => {
      if (fa.toLowerCase().includes(query) && !newSuggestions.some(s => s.label === fa)) {
        newSuggestions.push({ label: fa, value: fa, type: 'location' })
      }
    })

    setSuggestions(newSuggestions.slice(0, 8))
  }, [searchQuery, properties])

  const performSearch = (query: string, type?: 'type' | 'location') => {
    const trimmed = query.trim()
    if (!trimmed) {
      router.push("/properties")
      return
    }

    // Check if query matches a property type if type is not provided
    const matchedType = PROPERTY_TYPES.find(t =>
      t.label.toLowerCase() === trimmed.toLowerCase() ||
      t.value.toLowerCase() === trimmed.toLowerCase()
    )

    if (type === 'type' || matchedType) {
      router.push(`/properties?type=${matchedType?.value || trimmed.toLowerCase()}`)
    } else {
      router.push(`/properties?search=${encodeURIComponent(trimmed)}`)
    }
    setShowSuggestions(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      performSearch(suggestions[activeIndex].value, suggestions[activeIndex].type)
    } else {
      performSearch(searchQuery)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(prev => (prev > 0 ? prev - 1 : prev))
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  const featured = properties.filter((p) => p.status === "available").slice(0, 6)
  const plotCount = properties.filter((p) => p.type === "plot").length
  const aptCount = properties.filter((p) => p.type === "apartment").length
  const villaCount = properties.filter((p) => p.type === "villa").length
  const counts: Record<string, number> = { plot: plotCount, apartment: aptCount, villa: villaCount }

  return (
    <div className="flex min-h-screen flex-col">
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
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent drop-shadow-sm">
            Elevate Your Standard of Living
          </p>
          <h1 className="mb-6 font-serif text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl text-balance drop-shadow-xl" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
            {isAuthenticated && user ? `Welcome back, ${user.name.split(' ')[0]}!` : "Discover Properties That Define You"}
          </h1>
          <form onSubmit={handleSearch} className="relative group mx-auto mb-8 w-full max-w-2xl">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Search by city, location or property name..."
                className="h-14 w-full rounded-full border-none bg-white/10 px-6 py-4 text-white placeholder-white/50 backdrop-blur-md focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-accent/50"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowSuggestions(true)
                  setActiveIndex(-1)
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={handleKeyDown}
              />
              <Button
                type="submit"
                className="absolute right-1.5 h-11 rounded-full px-6"
              >
                Search
              </Button>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 overflow-hidden rounded-2xl bg-white border border-border shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="py-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={`${suggestion.type}-${suggestion.value}`}
                      type="button"
                      className={`flex w-full items-center gap-3 px-6 py-3 text-left transition-colors ${index === activeIndex ? 'bg-primary/5 text-primary' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      onClick={() => {
                        setSearchQuery(suggestion.label)
                        performSearch(suggestion.value, suggestion.type)
                      }}
                    >
                      {suggestion.type === 'type' ? (
                        <Building2 className="h-4 w-4 text-primary" />
                      ) : (
                        <MapPin className="h-4 w-4 text-primary" />
                      )}
                      <div className="flex flex-col">
                        <span className="font-medium">{suggestion.label}</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold text-balance">
                          {suggestion.type === 'type' ? 'Property Category' : 'Location'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </form>
          <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-teal-50 drop-shadow-md">
            Step into a world of exclusive real estate. From luxury villas to strategic plots, PropVista brings the finest properties designed for modern living directly to you.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" className="gap-2" asChild>
              <Link href="/properties">
                Browse Properties
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            {!isAuthenticated ? (
              <Button
                size="lg"
                variant="outline"
                className="border-background/30 bg-transparent text-background hover:bg-background/10 hover:text-background"
                asChild
              >
                <Link href="/auth/login">Login / Register</Link>
              </Button>
            ) : (
              <Button
                size="lg"
                variant="outline"
                className="border-background/30 bg-transparent text-background hover:bg-background/10 hover:text-background"
                asChild
              >
                <Link href={user?.role === "admin" ? "/admin/dashboard" : "/dashboard"}>
                  My Dashboard
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
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
                <Card className="h-full overflow-hidden border-border bg-card/50 backdrop-blur-sm transition-all duration-300 shadow-xl group-hover:shadow-emerald-500/20">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                      src={cat.image}
                      alt={cat.label}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-black/40 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 transform transition-transform duration-500 translate-y-2 group-hover:translate-y-0">
                      <div className="flex items-center gap-2 text-white">
                        <cat.icon className="h-6 w-6 text-emerald-400 drop-shadow-md" />
                        <h3 className="font-serif text-2xl font-bold drop-shadow-md">{cat.label}</h3>
                      </div>
                      <p className="mt-2 text-sm text-teal-100 opacity-90 transition-opacity duration-300">{cat.description}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs font-semibold text-accent bg-accent/20 px-2 py-1 rounded-full backdrop-blur-md">
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

      {/* Featured */}
      <section className="bg-secondary/50 py-16 lg:py-24">
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
      <section className="mx-auto w-full max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
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
              <div className="relative h-full overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/50 p-8 shadow-xl transition-all duration-300 hover:shadow-emerald-500/20">
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald-100/50 blur-2xl" />
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
      <section className="mx-auto w-full max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
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
              <Card className="h-full border-border bg-gradient-to-b from-card to-secondary/20 hover:from-card hover:to-emerald-50 transition-colors shadow-lg shadow-emerald-500/5 duration-500 overflow-hidden relative group">
                {/* Decorative background element */}
                <div className="absolute -inset-x-0 -top-20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 h-32 bg-gradient-to-b from-emerald-500/10 to-transparent blur-2xl" />
                <CardContent className="flex flex-col items-center gap-3 p-8 relative z-10">
                  <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 shadow-inner group-hover:scale-110 transition-transform duration-500">
                    <stat.icon className="h-7 w-7 text-emerald-600 drop-shadow-sm" />
                  </div>
                  <p className="font-serif text-4xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-500">
                    {stat.value}
                  </p>
                  <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">{stat.label}</p>
                </CardContent>
              </Card>
            </TiltCard>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
