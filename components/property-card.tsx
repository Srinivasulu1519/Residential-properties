"use client"

import Image from "next/image"
import Link from "next/link"
import { MapPin, Maximize, BedDouble, Bath, Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { type Property, formatPrice } from "@/lib/data"
import { cn } from "@/lib/utils"
import { useAdminAuth } from "@/lib/admin-auth"
import { toast } from "sonner"
import { useState } from "react"

const statusColors: Record<string, string> = {
  available: "bg-primary text-white hover:bg-primary/90",
  sold: "bg-red-500 text-white hover:bg-red-600",
  upcoming: "bg-primary text-white hover:bg-primary",
}

const typeColors: Record<string, string> = {
  plot: "bg-sky-100 text-sky-800 hover:bg-sky-200",
  apartment: "bg-violet-100 text-violet-800 hover:bg-violet-200",
  villa: "bg-rose-100 text-rose-800 hover:bg-rose-200",
  farmhouse: "bg-primary/10 text-primary hover:bg-primary/20",
  agriculture_land: "bg-lime-100 text-lime-800 hover:bg-lime-200",
  rent: "bg-slate-100 text-slate-700 hover:bg-slate-200",
  commercial: "bg-primary/10 text-primary hover:bg-primary/20",
  independent_house: "bg-orange-100 text-orange-800 hover:bg-orange-200",
}

export function PropertyCard({ property }: { property: Property }) {
  const { user, token, isAuthenticated, refreshUser, authenticatedFetch } = useAdminAuth()
  const isSaved = user?.savedProperties?.includes(property.id)
  const [isToggling, setIsToggling] = useState(false)

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      toast.error("Please login to save properties")
      return
    }

    setIsToggling(true)
    try {
      const res = await authenticatedFetch("/api/user/saved-properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ propertyId: property.id })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(isSaved ? "Removed from favorites" : "Added to favorites")
        refreshUser()
      }
    } catch (err) {
      toast.error("Something went wrong")
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <Link href={`/properties/${property.id}`} className="group block">
      <Card className="overflow-hidden border-border transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={property.images[0] || "/images/plot-category.jpg"}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute right-3 top-3 z-20">
            <Button
              variant="secondary"
              size="icon"
              className={cn(
                "h-8 w-8 rounded-full bg-white/90 shadow-sm transition-all hover:bg-white",
                isSaved ? "text-rose-500" : "text-slate-400"
              )}
              onClick={handleToggleSave}
              disabled={isToggling}
            >
              <Heart className={cn("h-4 w-4", isSaved && "fill-current")} />
            </Button>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="mb-2 flex flex-wrap gap-1.5">
            <Badge className={cn("text-[10px] px-2 py-0.5", typeColors[property.type])} variant="secondary">
              {property.type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
            <Badge className={cn("text-[10px] px-2 py-0.5", statusColors[property.status])} variant="secondary">
              {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
            </Badge>
            {property.type === "rent" && property.tenantType && property.tenantType !== "any" && (
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 text-[10px] px-2 py-0.5" variant="secondary">
                {property.tenantType.charAt(0).toUpperCase() + property.tenantType.slice(1)} Only
              </Badge>
            )}
          </div>
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="font-serif text-lg font-semibold leading-snug text-card-foreground line-clamp-1">
              {property.title}
            </h3>
          </div>
          <div className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1">
              {property.location ? `${property.location}, ${property.city}` : property.fullAddress}
            </span>
          </div>
          <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Maximize className="h-3.5 w-3.5" />
              {property.area.toLocaleString()} {property.areaUnit}
            </span>
            {property.bedrooms !== undefined && (
              <span className="flex items-center gap-1">
                <BedDouble className="h-3.5 w-3.5" />
                {property.bedrooms} Beds
              </span>
            )}
            {property.bathrooms !== undefined && (
              <span className="flex items-center gap-1">
                <Bath className="h-3.5 w-3.5" />
                {property.bathrooms} Baths
              </span>
            )}
          </div>
          <div className="border-t border-border pt-3 flex items-center justify-between">
            <p className="font-serif text-xl font-bold text-primary">
              {"Rs. "}{formatPrice(
                property.type === "rent" && property.monthlyRent ? property.monthlyRent : property.price,
                property.maxPrice
              )}
              {property.type === "rent" && <span className="text-sm font-normal text-muted-foreground">/mo</span>}
            </p>
            {property.type === "rent" && property.securityDeposit && (
              <span className="text-xs text-muted-foreground">
                Dep: {formatPrice(property.securityDeposit)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
