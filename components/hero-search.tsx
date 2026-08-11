"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Building2, SlidersHorizontal, Search, ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { PROPERTY_TYPES } from "@/lib/data"

interface HeroSearchProps {
  properties: any[]
  className?: string
}

const PRICE_OPTIONS = [
  { label: "Any", value: "all" },
  { label: "₹5 Lakhs", value: "500000" },
  { label: "₹10 Lakhs", value: "1000000" },
  { label: "₹25 Lakhs", value: "2500000" },
  { label: "₹50 Lakhs", value: "5000000" },
  { label: "₹1 Crore", value: "10000000" },
  { label: "₹2 Crores", value: "20000000" },
  { label: "₹5 Crores", value: "50000000" },
  { label: "₹10 Crores", value: "100000000" },
]

export function HeroSearch({ properties, className }: HeroSearchProps) {
  const router = useRouter()
  const [searchTab, setSearchTab] = useState<"all" | "buy" | "rent">("all")
  const [selectedCity, setSelectedCity] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [minPrice, setMinPrice] = useState("all")
  const [maxPrice, setMaxPrice] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<{ label: string; value: string; type: 'type' | 'location' }[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Dynamic Cities
  const uniqueCities = useMemo(() => {
    const cities = properties.map(p => p.city).filter(Boolean)
    return Array.from(new Set(cities)).sort()
  }, [properties])

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveDropdown(null)
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Suggestion Logic
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
    uniqueCities.forEach(c => {
      if (c.toLowerCase().includes(query)) {
        newSuggestions.push({ label: c, value: c, type: 'location' })
      }
    })

    // Match specific locations/areas from properties
    const uniqueLocations = Array.from(new Set(properties.filter(p => !!p.location).map(p => p.location!)))
    uniqueLocations.forEach(l => {
      if (l.toLowerCase().includes(query) && !uniqueCities.some(c => l.includes(c))) {
        newSuggestions.push({ label: l, value: l, type: 'location' })
      }
    })

    setSuggestions(newSuggestions.slice(0, 6))
  }, [searchQuery, properties, uniqueCities])

  const performSearch = (query?: string, type?: 'type' | 'location') => {
    const params = new URLSearchParams()
    
    if (searchTab !== "all") {
      if (searchTab === "rent") {
        params.set("type", "rent")
      } else {
        params.set("status", "available")
      }
    }

    // Default to existing selections
    if (selectedType !== "all") params.set("type", selectedType)
    if (selectedCity !== "all") params.set("city", selectedCity)
    if (minPrice !== "all") params.set("minPrice", minPrice)
    if (maxPrice !== "all") params.set("maxPrice", maxPrice)
    
    const trimmed = (query || searchQuery).trim()
    if (trimmed) {
      if (type === 'type') {
        params.set("type", query || trimmed.toLowerCase())
      } else if (type === 'location') {
        params.set("city", query || trimmed)
      } else {
        params.set("search", trimmed)
      }
    }

    router.push(`/properties?${params.toString()}`)
    setShowSuggestions(false)
    setActiveIndex(-1)
  }

  const handleTabChange = (tab: "all" | "buy" | "rent") => {
    setSearchTab(tab)
    // Perform immediate search when switching modes
    const params = new URLSearchParams()
    if (tab !== "all") {
      if (tab === "rent") {
        params.set("type", "rent")
      } else {
        params.set("status", "available")
      }
    }
    // Carry over other selections
    if (selectedType !== "all") params.set("type", selectedType)
    if (selectedCity !== "all") params.set("city", selectedCity)
    if (minPrice !== "all") params.set("minPrice", minPrice)
    if (maxPrice !== "all") params.set("maxPrice", maxPrice)
    router.push(`/properties?${params.toString()}`)
  }

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      performSearch(suggestions[activeIndex].value, suggestions[activeIndex].type)
    } else {
      performSearch()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev))
      setShowSuggestions(true)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(prev => (prev > 0 ? prev - 1 : prev))
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name)
    setShowSuggestions(false)
  }

  return (
    <div className={cn("mx-auto w-full max-w-5xl space-y-5", className)} ref={containerRef}>
      {/* Premium Tabs */}
      <div className="flex items-center justify-center gap-8 sm:justify-start sm:px-10">
        {(["all", "buy", "rent"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={cn(
              "group relative pb-2 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300",
              searchTab === tab ? "text-white" : "text-white/40 hover:text-white"
            )}
          >
            {tab === "all" ? "Explore" : tab === "buy" ? "Buy" : "Rent"}
            <span
              className={cn(
                "absolute bottom-0 left-0 h-0.5 bg-emerald-400 transition-all duration-500",
                searchTab === tab ? "w-full" : "w-0 group-hover:w-1/2 group-hover:opacity-50"
              )}
            />
          </button>
        ))}
      </div>

      {/* Main Search Pill */}
      <div className="relative group/pill flex flex-col md:flex-row items-stretch bg-white/95 backdrop-blur-xl rounded-[2rem] p-1.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] border border-white/40 transition-all duration-500 hover:shadow-[0_35px_70px_-10px_rgba(0,0,0,0.45)]">
        
        {/* Location Segment */}
        <div className="relative flex-1 group/segment">
          <button
            type="button"
            onClick={() => toggleDropdown("city")}
            className={cn(
              "flex h-full w-full items-center gap-2.5 px-5 py-2.5 text-left rounded-[1.75rem] transition-all duration-300",
              activeDropdown === "city" ? "bg-slate-50 shadow-inner" : "hover:bg-slate-50/80"
            )}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-all duration-300 group-hover/segment:scale-110 group-hover/segment:rotate-3 shadow-sm">
              <MapPin className="h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-400 mb-0.5">Location</span>
              <span className="truncate font-serif text-sm font-bold text-slate-900 leading-tight">
                {selectedCity === "all" ? "Anywhere" : selectedCity}
              </span>
            </div>
            <ChevronDown className={cn("ml-auto h-3.5 w-3.5 text-slate-300 transition-transform duration-500", activeDropdown === "city" && "rotate-180")} />
          </button>
          
          {/* Location Dropdown */}
          {activeDropdown === "city" && (
            <div className="absolute left-0 top-full z-[100] mt-4 w-72 overflow-hidden rounded-[2rem] bg-white p-2 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="max-h-80 overflow-y-auto scrollbar-hide py-1">
                <button
                  type="button"
                  onClick={() => { setSelectedCity("all"); setActiveDropdown(null) }}
                  className="flex w-full items-center justify-between px-6 py-3 text-sm font-semibold hover:bg-emerald-50 text-slate-700 hover:text-emerald-600 rounded-xl transition-colors"
                >
                  Anywhere
                  {selectedCity === "all" && <Check className="h-4 w-4" />}
                </button>
                <div className="my-1 h-px bg-slate-100 mx-4" />
                {uniqueCities.map(city => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => { setSelectedCity(city); setActiveDropdown(null) }}
                    className="flex w-full items-center justify-between px-6 py-3 text-sm font-medium hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 rounded-xl transition-colors"
                  >
                    {city}
                    {selectedCity === city && <Check className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="hidden md:block w-px bg-slate-100 my-4 opacity-50" />

        {/* Property Type Segment */}
        <div className="relative flex-1 group/segment">
          <button
            type="button"
            onClick={() => toggleDropdown("type")}
            className={cn(
              "flex h-full w-full items-center gap-2.5 px-5 py-2.5 text-left rounded-[1.75rem] transition-all duration-300",
              activeDropdown === "type" ? "bg-slate-50 shadow-inner" : "hover:bg-slate-50/80"
            )}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-all duration-300 group-hover/segment:scale-110 group-hover/segment:-rotate-3 shadow-sm">
              <Building2 className="h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-400 mb-0.5">Property Type</span>
              <span className="truncate font-serif text-sm font-bold text-slate-900 leading-tight">
                {selectedType === "all" ? "Any Type" : PROPERTY_TYPES.find(t => t.value === selectedType)?.label}
              </span>
            </div>
            <ChevronDown className={cn("ml-auto h-3.5 w-3.5 text-slate-300 transition-transform duration-500", activeDropdown === "type" && "rotate-180")} />
          </button>

          {/* Type Dropdown */}
          {activeDropdown === "type" && (
            <div className="absolute left-0 top-full z-[100] mt-4 w-72 overflow-hidden rounded-[2rem] bg-white p-2 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="max-h-80 overflow-y-auto scrollbar-hide py-1">
                <button
                  type="button"
                  onClick={() => { setSelectedType("all"); setActiveDropdown(null) }}
                  className="flex w-full items-center justify-between px-6 py-3 text-sm font-semibold hover:bg-emerald-50 text-slate-700 hover:text-emerald-600 rounded-xl transition-colors"
                >
                  Any Type
                  {selectedType === "all" && <Check className="h-4 w-4" />}
                </button>
                <div className="my-1 h-px bg-slate-100 mx-4" />
                {PROPERTY_TYPES.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => { setSelectedType(type.value); setActiveDropdown(null) }}
                    className="flex w-full items-center justify-between px-6 py-3 text-sm font-medium hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 rounded-xl transition-colors"
                  >
                    {type.label}
                    {selectedType === type.value && <Check className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="hidden md:block w-px bg-slate-100 my-4 opacity-50" />

        {/* Budget Segment */}
        <div className="relative flex-1 group/segment">
          <button
            type="button"
            onClick={() => toggleDropdown("budget")}
            className={cn(
              "flex h-full w-full items-center gap-2.5 px-5 py-2.5 text-left rounded-[1.75rem] transition-all duration-300",
              activeDropdown === "budget" ? "bg-slate-50 shadow-inner" : "hover:bg-slate-50/80"
            )}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-all duration-300 group-hover/segment:scale-110 group-hover/segment:rotate-3 shadow-sm">
              <SlidersHorizontal className="h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-400 mb-0.5">Budget Range</span>
              <span className="truncate font-serif text-sm font-bold text-slate-900 leading-tight">
                {minPrice === "all" && maxPrice === "all" 
                  ? "Any Price" 
                  : `${minPrice === "all" ? "Min" : PRICE_OPTIONS.find(p => p.value === minPrice)?.label} - ${maxPrice === "all" ? "Max" : PRICE_OPTIONS.find(p => p.value === maxPrice)?.label}`}
              </span>
            </div>
            <ChevronDown className={cn("ml-auto h-3.5 w-3.5 text-slate-300 transition-transform duration-500", activeDropdown === "budget" && "rotate-180")} />
          </button>

          {/* Budget Dropdown */}
          {activeDropdown === "budget" && (
            <div className="absolute left-0 md:left-auto md:right-0 top-full z-[100] mt-4 w-[22rem] overflow-hidden rounded-[2rem] bg-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Select Budget</h4>
                  {(minPrice !== "all" || maxPrice !== "all") && (
                    <button 
                      onClick={() => { setMinPrice("all"); setMaxPrice("all") }}
                      className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 underline"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Min Price Column */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 ml-1">Minimum</span>
                    <div className="max-h-60 overflow-y-auto scrollbar-hide space-y-1 pr-1">
                      {PRICE_OPTIONS.map(option => (
                        <button
                          key={`min-${option.value}`}
                          type="button"
                          onClick={() => setMinPrice(option.value)}
                          className={cn(
                            "flex w-full items-center justify-between px-4 py-2 text-[11px] font-semibold rounded-xl transition-all",
                            minPrice === option.value ? "bg-emerald-500 text-white shadow-md" : "hover:bg-slate-50 text-slate-600"
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Max Price Column */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 ml-1">Maximum</span>
                    <div className="max-h-60 overflow-y-auto scrollbar-hide space-y-1 pr-1">
                      {PRICE_OPTIONS.map(option => (
                        <button
                          key={`max-${option.value}`}
                          type="button"
                          disabled={option.value !== "all" && minPrice !== "all" && parseInt(option.value) < parseInt(minPrice)}
                          onClick={() => setMaxPrice(option.value)}
                          className={cn(
                            "flex w-full items-center justify-between px-4 py-2 text-[11px] font-semibold rounded-xl transition-all",
                            maxPrice === option.value ? "bg-emerald-500 text-white shadow-md" : "hover:bg-slate-50 text-slate-600",
                            option.value !== "all" && minPrice !== "all" && parseInt(option.value) < parseInt(minPrice) && "opacity-20 cursor-not-allowed"
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <Button 
                    className="w-full h-10 rounded-xl bg-slate-900 text-white font-bold text-xs"
                    onClick={() => setActiveDropdown(null)}
                  >
                    Apply Range
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search Input + Button Segment */}
        <div className="flex-[1.5] flex items-center bg-slate-50/50 md:bg-transparent rounded-full px-4 py-2 md:py-0">
          <div className="relative flex-1 group/input">
            <input
              type="text"
              placeholder={
                searchTab === "buy" ? "Search for homes for sale..." : 
                searchTab === "rent" ? "Search for properties to rent..." : 
                "Area, Property, City..."
              }
              className="w-full bg-transparent px-3 py-1.5 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition-all duration-300 focus:placeholder-slate-300"
              value={searchQuery}
              onFocus={() => { setShowSuggestions(true); setActiveDropdown(null) }}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setShowSuggestions(true)
                setActiveIndex(-1)
              }}
              onKeyDown={handleKeyDown}
            />

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-[100] mt-4 overflow-hidden rounded-[1.5rem] bg-white border border-slate-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="max-h-80 overflow-y-auto py-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={`${suggestion.type}-${suggestion.value}`}
                      type="button"
                      className={cn(
                        "flex w-full items-center gap-4 px-6 py-3 text-left transition-all",
                        index === activeIndex ? "bg-emerald-50 text-emerald-600" : "hover:bg-emerald-50 text-slate-700 hover:text-emerald-600"
                      )}
                      onClick={() => performSearch(suggestion.value, suggestion.type)}
                      onMouseEnter={() => setActiveIndex(index)}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500">
                        {suggestion.type === 'type' ? <Building2 className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold truncate">{suggestion.label}</span>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-40 leading-none mt-0.5">
                          {suggestion.type === 'type' ? "Category" : "Location"}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button 
            onClick={() => handleSearch()}
            className="h-9 w-9 md:h-10 md:w-auto md:px-6 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all duration-500 hover:scale-[1.05] hover:shadow-emerald-500/50 active:scale-[0.98] group/btn"
          >
            <Search className="h-4.5 w-4.5 md:mr-2 transition-transform duration-500 group-hover/btn:scale-110 group-hover/btn:rotate-12" />
            <span className="hidden md:inline tracking-wide font-sans">Search</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
