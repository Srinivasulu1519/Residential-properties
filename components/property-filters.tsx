"use client"

import { Search, X, MapPin, SlidersHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  PROPERTY_TYPES,
  PROPERTY_STATUSES,
  BHK_OPTIONS,
  FURNISHING_OPTIONS,
  CONSTRUCTION_STATUS_OPTIONS,
  PROPERTY_AGE_OPTIONS,
  FACING_OPTIONS,
  SOIL_TYPE_OPTIONS,
  ROAD_WIDTH_OPTIONS,
  PARKING_OPTIONS,
  LISTING_PURPOSE_OPTIONS,
  TENANT_TYPE_OPTIONS,
  TYPE_FILTER_CONFIG,
} from "@/lib/data"

interface PropertyFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  type: string
  onTypeChange: (value: string) => void
  status: string
  onStatusChange: (value: string) => void
  city: string
  onCityChange: (value: string) => void
  sortBy: string
  onSortChange: (value: string) => void
  totalResults: number
  showTypeFilter?: boolean
  metadataFilters?: Record<string, any>
  onMetadataFilterChange?: (key: string, value: any) => void
  location?: string
  onLocationChange?: (value: string) => void
  locations?: string[]
  cities?: string[]
  onClearFilters?: () => void
}

export function PropertyFilters({
  search,
  onSearchChange,
  type,
  onTypeChange,
  status,
  onStatusChange,
  city,
  onCityChange,
  sortBy,
  onSortChange,
  totalResults,
  showTypeFilter = true,
  metadataFilters = {},
  onMetadataFilterChange,
  location = "all",
  onLocationChange,
  locations = [],
  cities = [],
  onClearFilters,
}: PropertyFiltersProps) {
  const activeFilters = [
    ...(showTypeFilter ? [type] : []),
    status,
    city,
    location,
  ].filter((f) => f !== "all").length

  const activeMetadataCount = Object.values(metadataFilters).filter(v => v && v !== "all").length
  const totalActiveFilters = activeFilters + activeMetadataCount

  const clearFilters = () => {
    if (onClearFilters) {
      onClearFilters()
      return
    }
    onSearchChange("")
    if (showTypeFilter) onTypeChange("all")
    onStatusChange("all")
    onCityChange("all")
    if (onLocationChange) onLocationChange("all")
    onSortChange("newest")
  }

  // Active filter pills
  const activeFilterPills: { label: string; onRemove: () => void }[] = []
  if (type !== "all" && showTypeFilter) {
    const label = PROPERTY_TYPES.find(t => t.value === type)?.label || type
    activeFilterPills.push({ label: `Type: ${label}`, onRemove: () => onTypeChange("all") })
  }
  if (status !== "all") {
    const label = PROPERTY_STATUSES.find(s => s.value === status)?.label || status
    activeFilterPills.push({ label: `Status: ${label}`, onRemove: () => onStatusChange("all") })
  }
  if (city !== "all") {
    activeFilterPills.push({ label: `City: ${city}`, onRemove: () => { onCityChange("all"); if (onLocationChange) onLocationChange("all") } })
  }
  if (location !== "all") {
    activeFilterPills.push({ label: `Location: ${location}`, onRemove: () => onLocationChange?.("all") })
  }
  // Metadata pills
  if (onMetadataFilterChange) {
    Object.entries(metadataFilters).forEach(([key, value]) => {
      if (value && value !== "all") {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())
        activeFilterPills.push({
          label: `${label}: ${value}`,
          onRemove: () => onMetadataFilterChange(key, "all")
        })
      }
    })
  }

  // Get type-specific filter config
  const typeConfig = type !== "all" ? TYPE_FILTER_CONFIG[type] || {} : {}

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-border/50 bg-card p-5 lg:p-6">
      {/* Search + Sort row */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
          <Input
            placeholder="Search properties..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-11 pl-11 bg-secondary/30 border-border/40 text-sm placeholder:text-muted-foreground/50 focus:bg-background focus:border-border transition-colors"
          />
        </div>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-full sm:w-[180px] h-11 border-border/40 text-sm">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="area-high">Area: Largest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Filters row */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60 mr-0.5">
          <SlidersHorizontal className="h-3.5 w-3.5" />
        </div>

        {showTypeFilter && (
          <Select value={type} onValueChange={onTypeChange}>
            <SelectTrigger className="h-9 w-auto min-w-[130px] text-xs border-border/40">
              <SelectValue placeholder="Property Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {PROPERTY_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="h-9 w-auto min-w-[120px] text-xs border-border/40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {PROPERTY_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={city} onValueChange={(v) => {
          onCityChange(v)
          if (onLocationChange) onLocationChange("all")
        }}>
          <SelectTrigger className="h-9 w-auto min-w-[130px] text-xs border-border/40">
            <SelectValue placeholder="City" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Location */}
        {locations.length > 0 && onLocationChange && (
          <div className="animate-in fade-in slide-in-from-left-2 duration-300">
            <Select value={location} onValueChange={onLocationChange}>
              <SelectTrigger className="h-9 w-auto min-w-[150px] text-xs border-border/40">
                <MapPin className="h-3 w-3 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Listing Purpose filter */}
        {onMetadataFilterChange && (
          <Select
            value={metadataFilters.listingPurpose || "all"}
            onValueChange={(v) => onMetadataFilterChange("listingPurpose", v)}
          >
            <SelectTrigger className="h-9 w-auto min-w-[120px] text-xs border-border/40">
              <SelectValue placeholder="Purpose" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Purpose</SelectItem>
              {LISTING_PURPOSE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Type-Specific Filters */}
      {type !== "all" && onMetadataFilterChange && Object.keys(typeConfig).length > 0 && (
        <div className="flex items-center gap-2.5 flex-wrap border-t border-border/40 pt-4 animate-in fade-in slide-in-from-top-1 duration-300">
          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50 mr-1">
            {PROPERTY_TYPES.find(t => t.value === type)?.label}
          </span>

          {typeConfig.bhk && (
            <Select value={metadataFilters.bhk || "all"} onValueChange={(v) => onMetadataFilterChange("bhk", v)}>
              <SelectTrigger className="h-8 w-auto min-w-[100px] text-xs border-border/40"><SelectValue placeholder="BHK" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All BHK</SelectItem>{BHK_OPTIONS.map(b => (<SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>))}</SelectContent>
            </Select>
          )}

          {typeConfig.furnishing && (
            <Select value={metadataFilters.furnishing || "all"} onValueChange={(v) => onMetadataFilterChange("furnishing", v)}>
              <SelectTrigger className="h-8 w-auto min-w-[130px] text-xs border-border/40"><SelectValue placeholder="Furnishing" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Furnishing</SelectItem>{FURNISHING_OPTIONS.map(f => (<SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>))}</SelectContent>
            </Select>
          )}

          {typeConfig.tenantType && (
            <Select value={metadataFilters.tenantType || "all"} onValueChange={(v) => onMetadataFilterChange("tenantType", v)}>
              <SelectTrigger className="h-8 w-auto min-w-[120px] text-xs border-border/40"><SelectValue placeholder="Tenant Type" /></SelectTrigger>
              <SelectContent><SelectItem value="all">Any Tenant</SelectItem>{TENANT_TYPE_OPTIONS.map(t => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}</SelectContent>
            </Select>
          )}

          {typeConfig.constructionStatus && (
            <Select value={metadataFilters.constructionStatus || "all"} onValueChange={(v) => onMetadataFilterChange("constructionStatus", v)}>
              <SelectTrigger className="h-8 w-auto min-w-[150px] text-xs border-border/40"><SelectValue placeholder="Construction" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Status</SelectItem>{CONSTRUCTION_STATUS_OPTIONS.map(c => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}</SelectContent>
            </Select>
          )}

          {typeConfig.propertyAge && (
            <Select value={metadataFilters.propertyAge || "all"} onValueChange={(v) => onMetadataFilterChange("propertyAge", v)}>
              <SelectTrigger className="h-8 w-auto min-w-[120px] text-xs border-border/40"><SelectValue placeholder="Age" /></SelectTrigger>
              <SelectContent><SelectItem value="all">Any Age</SelectItem>{PROPERTY_AGE_OPTIONS.map(a => (<SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>))}</SelectContent>
            </Select>
          )}

          {typeConfig.facing && (
            <Select value={metadataFilters.facing || "all"} onValueChange={(v) => onMetadataFilterChange("facing", v)}>
              <SelectTrigger className="h-8 w-auto min-w-[110px] text-xs border-border/40"><SelectValue placeholder="Facing" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Facings</SelectItem>{FACING_OPTIONS.map(f => (<SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>))}</SelectContent>
            </Select>
          )}

          {typeConfig.parking && (
            <Select value={metadataFilters.parking || "all"} onValueChange={(v) => onMetadataFilterChange("parking", v)}>
              <SelectTrigger className="h-8 w-auto min-w-[110px] text-xs border-border/40"><SelectValue placeholder="Parking" /></SelectTrigger>
              <SelectContent><SelectItem value="all">Any Parking</SelectItem>{PARKING_OPTIONS.map(p => (<SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>))}</SelectContent>
            </Select>
          )}

          {typeConfig.soilType && (
            <Select value={metadataFilters.soilType || "all"} onValueChange={(v) => onMetadataFilterChange("soilType", v)}>
              <SelectTrigger className="h-8 w-auto min-w-[110px] text-xs border-border/40"><SelectValue placeholder="Soil Type" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Soils</SelectItem>{SOIL_TYPE_OPTIONS.map(s => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}</SelectContent>
            </Select>
          )}

          {typeConfig.roadWidth && (
            <Select value={metadataFilters.roadWidth || "all"} onValueChange={(v) => onMetadataFilterChange("roadWidth", v)}>
              <SelectTrigger className="h-8 w-auto min-w-[110px] text-xs border-border/40"><SelectValue placeholder="Road Width" /></SelectTrigger>
              <SelectContent><SelectItem value="all">Any Width</SelectItem>{ROAD_WIDTH_OPTIONS.map(r => (<SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>))}</SelectContent>
            </Select>
          )}

          {typeConfig.gatedCommunity && (
            <Button
              variant={metadataFilters.gatedCommunity === "true" ? "default" : "outline"}
              size="sm"
              className="h-8 text-xs gap-1.5 border-border/40"
              onClick={() => onMetadataFilterChange("gatedCommunity", metadataFilters.gatedCommunity === "true" ? "all" : "true")}
            >
              Gated Community
            </Button>
          )}

          {typeConfig.waterSource && (
            <Button
              variant={metadataFilters.waterSource === "true" ? "default" : "outline"}
              size="sm"
              className="h-8 text-xs gap-1.5 border-border/40"
              onClick={() => onMetadataFilterChange("waterSource", metadataFilters.waterSource === "true" ? "all" : "true")}
            >
              Water Source
            </Button>
          )}

          {typeConfig.electricityStatus && (
            <Button
              variant={metadataFilters.electricityStatus === "true" ? "default" : "outline"}
              size="sm"
              className="h-8 text-xs gap-1.5 border-border/40"
              onClick={() => onMetadataFilterChange("electricityStatus", metadataFilters.electricityStatus === "true" ? "all" : "true")}
            >
              Electricity
            </Button>
          )}
        </div>
      )}

      {/* Price/Area Range Inputs */}
      {type !== "all" && onMetadataFilterChange && (typeConfig.priceRange || typeConfig.areaRange) && (
        <div className="flex items-center gap-2.5 flex-wrap border-t border-border/40 pt-4 animate-in fade-in slide-in-from-top-1 duration-200">
          {typeConfig.priceRange && (
            <>
              <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50">Budget</span>
              <Input type="number" placeholder="Min" value={metadataFilters.minPrice || ""} onChange={(e) => onMetadataFilterChange("minPrice", e.target.value || "all")} className="h-8 w-[110px] text-xs border-border/40" />
              <span className="text-xs text-muted-foreground/40">—</span>
              <Input type="number" placeholder="Max" value={metadataFilters.maxPrice || ""} onChange={(e) => onMetadataFilterChange("maxPrice", e.target.value || "all")} className="h-8 w-[110px] text-xs border-border/40" />
            </>
          )}
          {typeConfig.areaRange && (
            <>
              <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50 ml-3">Area</span>
              <Input type="number" placeholder="Min" value={metadataFilters.minArea || ""} onChange={(e) => onMetadataFilterChange("minArea", e.target.value || "all")} className="h-8 w-[100px] text-xs border-border/40" />
              <span className="text-xs text-muted-foreground/40">—</span>
              <Input type="number" placeholder="Max" value={metadataFilters.maxArea || ""} onChange={(e) => onMetadataFilterChange("maxArea", e.target.value || "all")} className="h-8 w-[100px] text-xs border-border/40" />
              <span className="text-[10px] text-muted-foreground/40">sq ft</span>
            </>
          )}
        </div>
      )}

      {/* Active Filter Pills + Result Count */}
      {(activeFilterPills.length > 0 || totalResults >= 0) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-4">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{totalResults}</span>{" "}
              {totalResults === 1 ? "property" : "properties"}
            </p>

            {activeFilterPills.map((pill) => (
              <Badge
                key={pill.label}
                variant="secondary"
                className="gap-1 pl-2.5 pr-1.5 py-0.5 text-[11px] font-medium cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
                onClick={pill.onRemove}
              >
                {pill.label}
                <X className="h-3 w-3" />
              </Badge>
            ))}
          </div>

          {totalActiveFilters > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-destructive"
            >
              <X className="h-3 w-3" />
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
