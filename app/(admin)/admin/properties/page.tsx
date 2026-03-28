"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { PlusCircle, Search, Pencil, Trash2, Loader2, MapPin, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { useProperties } from "@/lib/property-context"
import { formatPrice, PROPERTY_TYPES } from "@/lib/data"
import { toast } from "sonner"

export default function AdminPropertiesPage() {
  const { properties, loading, deleteProperty } = useProperties()
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [cityFilter, setCityFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("all")

  // Compute available cities from properties in DB
  const availableCities = useMemo(() => {
    const cities = properties.map(p => p.city)
    return Array.from(new Set(cities)).sort()
  }, [properties])

  // Compute available locations based on selected city
  const availableLocations = useMemo(() => {
    const relevantProperties = cityFilter === "all"
      ? properties
      : properties.filter(p => p.city === cityFilter)

    const locs = relevantProperties
      .filter(p => p.location)
      .map(p => p.location!)
    return Array.from(new Set(locs)).sort()
  }, [properties, cityFilter])

  const filtered = useMemo(() => {
    let result = [...properties]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.fullAddress.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          (p.location && p.location.toLowerCase().includes(q))
      )
    }
    if (typeFilter !== "all") {
      result = result.filter((p) => p.type === typeFilter)
    }
    if (cityFilter !== "all") {
      result = result.filter((p) => p.city === cityFilter)
    }
    if (locationFilter !== "all") {
      result = result.filter((p) => p.location === locationFilter)
    }
    return result.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [properties, search, typeFilter, cityFilter, locationFilter])

  const handleDelete = async (id: string, title: string) => {
    try {
      await deleteProperty(id)
      toast.success(`"${title}" deleted successfully`)
    } catch {
      toast.error("Failed to delete property")
    }
  }

  const activeFilterCount = [typeFilter, cityFilter, locationFilter].filter(f => f !== "all").length

  const clearFilters = () => {
    setSearch("")
    setTypeFilter("all")
    setCityFilter("all")
    setLocationFilter("all")
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading properties...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground md:text-3xl">
            Properties
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage all your property listings.
          </p>
        </div>
        <Button className="gap-2" asChild>
          <Link href="/admin/properties/new">
            <PlusCircle className="h-4 w-4" />
            Add Property
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6 border-border">
        <CardContent className="flex flex-col gap-3 p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search properties..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by type" />
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
            <Select value={cityFilter} onValueChange={(v) => {
              setCityFilter(v)
              setLocationFilter("all")
            }}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {availableCities.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location filter - always visible if any locations exist */}
          {availableLocations.length > 0 && (
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary shrink-0">
                <MapPin className="h-4 w-4" />
              </div>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {availableLocations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Active filter indicator */}
          {activeFilterCount > 0 && (
            <div className="flex items-center justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
                Clear filters
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {activeFilterCount}
                </Badge>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No properties found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((property) => (
                  <TableRow key={property.id} className="group transition-colors hover:bg-muted/30">
                    <TableCell>
                      <div className="relative h-10 w-14 overflow-hidden rounded-md">
                        <Image
                          src={
                            property.images[0] || "/images/plot-category.jpg"
                          }
                          alt={property.title}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] font-medium">
                      <span className="line-clamp-1">{property.title}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="text-xs capitalize"
                      >
                        {property.type.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {"Rs. "}{formatPrice(property.price)}
                    </TableCell>
                    <TableCell className="max-w-[120px]">
                      <span className="line-clamp-1 text-muted-foreground">
                        {property.city}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[140px]">
                      {property.location ? (
                        <span className="line-clamp-1 text-sm">
                          {property.location}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/50">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge
                          className={`text-xs w-fit ${property.status === "available"
                            ? "bg-emerald-100 text-emerald-800"
                            : property.status === "sold"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                            }`}
                        >
                          {property.status}
                        </Badge>
                        {property.isActive === false && (
                          <Badge variant="destructive" className="text-[9px] px-1 py-0 uppercase bg-slate-500 text-white border-none">
                            Manual Deactivated
                          </Badge>
                        )}
                        {(() => {
                           const now = new Date()
                           const owner = (property as any).postedBy
                           if (owner && owner.role !== "ADMIN") {
                             const isPremium = owner.subscriptionActive === true
                             const trialExpired = owner.trialEndsAt && new Date(owner.trialEndsAt) <= now
                             if (trialExpired && !isPremium) {
                               return (
                                 <Badge variant="outline" className="text-[9px] border-rose-200 text-rose-600 bg-rose-50 px-1 py-0 uppercase">
                                   Inactive (Trial Exp)
                                 </Badge>
                               )
                             }
                           }
                           return null
                        })()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          asChild
                        >
                          <Link
                            href={`/admin/properties/${property.id}/edit`}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Property
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete &ldquo;
                                {property.title}&rdquo;? This action cannot
                                be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleDelete(property.id, property.title)
                                }
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="mt-4 text-sm text-muted-foreground">
        Showing {filtered.length} of {properties.length} properties
      </p>
    </div>
  )
}
