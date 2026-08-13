"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Building2, LandPlot, Home, MapPin, Users, TrendingUp, Loader2, Search } from "lucide-react"
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

      {/* ═══════ HERO ═══════ */}
      <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden">
        <Image
          src="/images/hero-bg.jpg"
          alt=""
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Elegant overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/35 to-black/55" />

        <div className="relative z-10 mx-auto w-full max-w-4xl px-6 py-32 text-center lg:px-8">
          {/* Tagline */}
          <p className="mb-6 text-xs font-medium uppercase tracking-[0.25em] text-white/60">
            Premium Real Estate &bull; India
          </p>

          {/* Main Heading */}
          <h1 className="mx-auto max-w-3xl font-serif text-4xl font-bold leading-[1.1] text-white md:text-5xl lg:text-6xl text-balance">
            {isAuthenticated && user ? `Welcome back, ${user.name.split(' ')[0]}!` : "Discover Spaces That Define Your Lifestyle"}
          </h1>

          {/* Subtext */}
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/60 md:text-lg">
            From luxury villas to strategic plots, PropVista brings the finest properties designed for modern living.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="relative mx-auto mt-10 w-full max-w-2xl">
            <div className="relative flex items-center">
              <Search className="absolute left-5 h-5 w-5 text-white/40 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by city, location or property type..."
                className="h-14 w-full rounded-full border border-white/15 bg-white/10 pl-13 pr-32 text-white placeholder-white/40 backdrop-blur-xl transition-all duration-300 focus:border-white/30 focus:bg-white/15 focus:outline-none"
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
                className="absolute right-1.5 h-11 rounded-full px-6 bg-white text-foreground hover:bg-white/90 font-medium"
              >
                Search
              </Button>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 overflow-hidden rounded-xl bg-white border border-border/60 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="py-1.5">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={`${suggestion.type}-${suggestion.value}`}
                      type="button"
                      className={`flex w-full items-center gap-3 px-5 py-3 text-left transition-colors ${index === activeIndex ? 'bg-secondary text-foreground' : 'hover:bg-secondary/50 text-foreground'
                        }`}
                      onClick={() => {
                        setSearchQuery(suggestion.label)
                        performSearch(suggestion.value, suggestion.type)
                      }}
                    >
                      {suggestion.type === 'type' ? (
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{suggestion.label}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          {suggestion.type === 'type' ? 'Category' : 'Location'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </form>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="h-12 gap-2 rounded-full px-8" asChild>
              <Link href="/properties">
                Browse Properties
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            {!isAuthenticated ? (
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-white/20 bg-transparent px-8 text-white hover:bg-white/10 hover:text-white"
                asChild
              >
                <Link href="/auth/login">Login / Register</Link>
              </Button>
            ) : (
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-white/20 bg-transparent px-8 text-white hover:bg-white/10 hover:text-white"
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

      {/* ═══════ TRUST STRIP ═══════ */}
      <section className="border-b border-border/40">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-8 px-6 py-8 sm:gap-14 lg:gap-20">
          {[
            "Verified Listings",
            "Transparent Pricing",
            "Premium Support",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2.5">
              <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
              <span className="text-sm font-medium text-muted-foreground">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ CATEGORIES ═══════ */}
      <section className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Browse by Category
          </p>
          <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            Explore Property Types
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.type}
              href={`/properties?type=${cat.type}`}
              className="group block"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl">
                <Image
                  src={cat.image}
                  alt={cat.label}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="font-serif text-2xl font-bold text-white">{cat.label}</h3>
                  <p className="mt-1.5 text-sm text-white/60">{cat.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs font-medium text-white/50">
                      {loading ? "..." : `${counts[cat.type]} ${counts[cat.type] === 1 ? "listing" : "listings"}`}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-medium text-white/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      Explore <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════ FEATURED ═══════ */}
      <section className="border-y border-border/40 bg-secondary/30 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-14 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Featured Collection
              </p>
              <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
                Properties Worth Discovering
              </h2>
            </div>
            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground" asChild>
              <Link href="/properties">
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading properties...</p>
              </div>
            </div>
          ) : featured.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                <Building2 className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground">No properties available yet</h3>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                We&apos;re currently adding verified properties. Please check back soon.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ═══════ WHY PROPVISTA ═══════ */}
      <section className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left — Image */}
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl lg:aspect-[3/4]">
            <Image
              src="/images/villa-category.jpg"
              alt="Premium property"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Right — Content */}
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Why PropVista
            </p>
            <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
              The PropVista Advantage
            </h2>
            <div className="mt-10 space-y-8">
              {[
                {
                  number: "01",
                  title: "Verified Listings",
                  description: "Every property goes through rigorous physical and legal verification for complete peace of mind.",
                },
                {
                  number: "02",
                  title: "Transparent Pricing",
                  description: "No hidden fees or surprise commissions. 100% transparency between buyers, sellers, and tenants.",
                },
                {
                  number: "03",
                  title: "Premium Support",
                  description: "Dedicated relationship managers guide you through visits, paperwork, and loans.",
                },
              ].map((adv) => (
                <div key={adv.number} className="flex gap-5">
                  <span className="mt-0.5 text-sm font-medium text-primary/50">{adv.number}</span>
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-foreground">{adv.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{adv.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ STATS ═══════ */}
      <section className="border-t border-border/40">
        <div className="mx-auto max-w-5xl px-6 py-20 lg:px-8 lg:py-24">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { value: loading ? "—" : properties.length, label: "Properties" },
              { value: loading ? "—" : new Set(properties.map((p) => p.city)).size, label: "Cities" },
              { value: "500+", label: "Happy Clients" },
              { value: loading ? "—" : properties.filter((p) => p.status === "available").length, label: "Available Now" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-serif text-4xl font-bold text-foreground md:text-5xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FINAL CTA ═══════ */}
      <section className="bg-[#1a2e2a] py-20 lg:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
          <h2 className="font-serif text-3xl font-bold text-white md:text-4xl text-balance">
            Your next address is waiting
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-white/50">
            Whether you&apos;re looking for your dream home or a strategic investment, we&apos;re here to help you find it.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" className="h-12 rounded-full px-8 bg-white text-foreground hover:bg-white/90" asChild>
              <Link href="/properties">
                Explore Properties
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 rounded-full border-white/20 px-8 text-white hover:bg-white/10 hover:text-white bg-transparent" asChild>
              <Link href={isAuthenticated ? "/post-property" : "/auth/register"}>
                List Your Property
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
