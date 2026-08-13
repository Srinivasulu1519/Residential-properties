"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

import { PropertyCard } from "@/components/property-card"
import { PropertyFilters } from "@/components/property-filters"
import { useProperties } from "@/lib/property-context"
import { useAdminAuth } from "@/lib/admin-auth"
import { TrialGate } from "@/components/trial-gate"
import { PROPERTY_TYPES } from "@/lib/data"
import { Building2, Loader2 } from "lucide-react"

export default function PropertiesPage() {
  const searchParams = useSearchParams()
  const { properties, loading } = useProperties()
  const { token, isAuthenticated, authenticatedFetch } = useAdminAuth()

  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [type, setType] = useState(searchParams.get("type") || "all")
  const [status, setStatus] = useState(searchParams.get("status") || "all")
  const [city, setCity] = useState("all")
  const [location, setLocation] = useState("all")
  const [metadataFilters, setMetadataFilters] = useState<Record<string, any>>({})

  const updateMetadataFilter = (key: string, value: any) => {
    setMetadataFilters(prev => ({
      ...prev,
      [key]: value === "all" ? undefined : value
    }))
  }

  // Compute available cities from properties in DB
  const availableCities = useMemo(() => {
    const cities = properties.map(p => p.city)
    return Array.from(new Set(cities)).sort()
  }, [properties])

  // Compute available locations based on selected city
  const availableLocations = useMemo(() => {
    const relevantProperties = city === "all"
      ? properties
      : properties.filter(p => p.city === city)

    const locs = relevantProperties
      .filter(p => p.location)
      .map(p => p.location!)
    return Array.from(new Set(locs)).sort()
  }, [properties, city])

  // Sync filter state with URL search params when navigating between links
  useEffect(() => {
    const typeParam = searchParams.get("type") || "all"
    setType(typeParam)
  }, [searchParams])

  useEffect(() => {
    const statusParam = searchParams.get("status") || "all"
    setStatus(statusParam)
  }, [searchParams])

  useEffect(() => {
    const searchParam = searchParams.get("search") || ""
    setSearch(searchParam)
  }, [searchParams])

  // Track search history with debounce
  useEffect(() => {
    if (!search || !isAuthenticated) return

    const timeoutId = setTimeout(async () => {
      try {
        await authenticatedFetch("/api/user/search-history", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ query: search })
        })
      } catch (err) {
        console.error("Failed to log search history:", err)
      }
    }, 2000) // 2 second debounce

    return () => clearTimeout(timeoutId)
  }, [search, isAuthenticated, token])

  const [sortBy, setSortBy] = useState("newest")

  const clearFilters = () => {
    setSearch("")
    setType("all")
    setStatus("all")
    setCity("all")
    setLocation("all")
    setSortBy("newest")
    setMetadataFilters({})
  }

  const filtered = useMemo(() => {
    let result = [...properties]

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.fullAddress.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.location && p.location.toLowerCase().includes(q))
      )
    }

    if (type !== "all") {
      result = result.filter((p) => p.type === type)
    }
    if (status !== "all") {
      result = result.filter((p) => p.status === status)
    }
    if (city !== "all") {
      result = result.filter((p) => p.city === city)
    }
    if (location !== "all") {
      result = result.filter((p) => p.location === location)
    }

    // Metadata Filters
    Object.entries(metadataFilters).forEach(([key, value]) => {
      if (value) {
        result = result.filter((p) => {
          const meta = p.metadata as any
          if (!meta) return false
          return meta[key] === value
        })
      }
    })

    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        result.sort((a, b) => b.price - a.price)
        break
      case "area-high":
        result.sort((a, b) => b.area - a.area)
        break
      case "newest":
      default:
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
    }

    return result
  }, [properties, search, type, status, city, location, sortBy, metadataFilters])

  const pageTitle = type === "all"
    ? "All Properties"
    : (PROPERTY_TYPES.find(t => t.value === type)?.label || "Properties")

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Page Header */}
        <div className="border-b border-border/40 px-6 py-14 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Browse
            </p>
            <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
              {pageTitle}
            </h1>
          </div>
        </div>

        <TrialGate>
          <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-12">
            {/* Filters */}
            <PropertyFilters
              search={search}
              onSearchChange={setSearch}
              type={type}
              onTypeChange={setType}
              status={status}
              onStatusChange={setStatus}
              city={city}
              onCityChange={setCity}
              location={location}
              onLocationChange={setLocation}
              locations={availableLocations}
              cities={availableCities}
              sortBy={sortBy}
              onSortChange={setSortBy}
              totalResults={filtered.length}
              showTypeFilter={!searchParams.get("type")}
              metadataFilters={metadataFilters}
              onMetadataFilterChange={updateMetadataFilter}
              onClearFilters={clearFilters}
            />

            {/* Results */}
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-4 py-28">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading properties...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-28 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                  <Building2 className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground">
                  No properties found
                </h3>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Try adjusting your filters or search criteria to find what you&apos;re looking for.
                </p>
              </div>
            ) : (
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </div>
        </TrialGate>
      </main>

      <SiteFooter />
    </div>
  )
}
