"use client"

import Image from "next/image"
import Link from "next/link"
import { MapPin, Maximize, BedDouble, Bath, Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { type Property, formatPrice } from "@/lib/data"
import { cn } from "@/lib/utils"
import { useAdminAuth } from "@/lib/admin-auth"
import { toast } from "sonner"
import { useState } from "react"

const statusStyles: Record<string, string> = {
  available: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  sold: "bg-red-50 text-red-700 border-red-200/60",
  upcoming: "bg-amber-50 text-amber-700 border-amber-200/60",
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
      <article className="overflow-hidden rounded-lg border border-border/50 bg-card transition-all duration-300 hover:shadow-md hover:shadow-black/[0.04] hover:-translate-y-0.5">
        {/* Image */}
        <div className="relative aspect-[16/11] overflow-hidden">
          <Image
            src={property.images[0] || "/images/plot-category.jpg"}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Save button */}
          <div className="absolute right-3 top-3 z-20">
            <Button
              variant="secondary"
              size="icon"
              className={cn(
                "h-9 w-9 rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:scale-105",
                isSaved ? "text-rose-500" : "text-foreground/30 hover:text-foreground/60"
              )}
              onClick={handleToggleSave}
              disabled={isToggling}
            >
              <Heart className={cn("h-4 w-4", isSaved && "fill-current")} />
            </Button>
          </div>
          {/* Status badge */}
          <div className="absolute left-3 top-3 z-20">
            <span className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
              statusStyles[property.status] || "bg-white/90 text-foreground border-border"
            )}>
              {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Type label */}
          <div className="mb-2.5 flex items-center gap-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {property.type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
            </span>
            {property.type === "rent" && property.tenantType && property.tenantType !== "any" && (
              <>
                <span className="text-border">·</span>
                <span className="text-[11px] font-medium text-muted-foreground">
                  {property.tenantType.charAt(0).toUpperCase() + property.tenantType.slice(1)} Only
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="font-serif text-lg font-semibold leading-snug text-foreground line-clamp-1 group-hover:text-primary transition-colors duration-200">
            {property.title}
          </h3>

          {/* Location */}
          <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1">
              {property.location ? `${property.location}, ${property.city}` : property.fullAddress}
            </span>
          </div>

          {/* Specs */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Maximize className="h-3.5 w-3.5" />
              {property.area.toLocaleString()} {property.areaUnit}
            </span>
            {property.bedrooms !== undefined && (
              <span className="flex items-center gap-1.5">
                <BedDouble className="h-3.5 w-3.5" />
                {property.bedrooms} Beds
              </span>
            )}
            {property.bathrooms !== undefined && (
              <span className="flex items-center gap-1.5">
                <Bath className="h-3.5 w-3.5" />
                {property.bathrooms} Baths
              </span>
            )}
          </div>

          {/* Price */}
          <div className="mt-4 border-t border-border/40 pt-4 flex items-baseline justify-between">
            <p className="font-serif text-xl font-bold text-foreground">
              <span className="text-sm font-normal text-muted-foreground">Rs. </span>
              {formatPrice(property.type === "rent" && property.monthlyRent ? property.monthlyRent : property.price)}
              {property.type === "rent" && <span className="text-sm font-normal text-muted-foreground">/mo</span>}
            </p>
            {property.type === "rent" && property.securityDeposit && (
              <span className="text-xs text-muted-foreground">
                Deposit: {formatPrice(property.securityDeposit)}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
