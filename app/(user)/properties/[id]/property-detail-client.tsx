"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  MapPin,
  Maximize,
  Maximize2,
  BedDouble,
  Bath,
  Download,
  CheckCircle2,
  Calendar,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Calculator,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EMICalculator } from "@/components/emi-calculator"
import { Separator } from "@/components/ui/separator"
import { useProperties } from "@/lib/property-context"
import { formatPrice } from "@/lib/data"
import { cn } from "@/lib/utils"
import { ImageLightbox } from "@/components/image-lightbox"
import { RentalContactGate } from "@/components/rental-contact-gate"
import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useEffect } from "react"
import { toast } from "sonner"

const statusColors: Record<string, string> = {
  available: "bg-primary text-white",
  sold: "bg-red-500 text-white",
  upcoming: "bg-primary text-white",
}

const typeColors: Record<string, string> = {
  plot: "bg-sky-100 text-sky-800",
  apartment: "bg-violet-100 text-violet-800",
  villa: "bg-rose-100 text-rose-800",
  farmhouse: "bg-primary/10 text-primary",
  agriculture_land: "bg-lime-100 text-lime-800",
  rent: "bg-slate-100 text-slate-700",
  commercial: "bg-primary/10 text-primary",
  independent_house: "bg-orange-100 text-orange-800",
}

import { useAdminAuth } from "@/lib/admin-auth"

export function PropertyDetailClient({ propertyId }: { propertyId: string }) {
  const { getProperty } = useProperties()
  const property = getProperty(propertyId)
  const { user, authenticatedFetch } = useAdminAuth()
  const isAdmin = user?.role === "admin"
  const [selectedImage, setSelectedImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [adminContact, setAdminContact] = useState<{ ownerName?: string; ownerPhone?: string; ownerEmail?: string } | null>(null)
  const [isLoadingAdminContact, setIsLoadingAdminContact] = useState(false)
  
  const [isInterested, setIsInterested] = useState(false)
  const [isSubmittingInterest, setIsSubmittingInterest] = useState(false)
  const [showInterestSuccess, setShowInterestSuccess] = useState(false)

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedImage(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
  }, [emblaApi, onSelect])

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index)
  }, [emblaApi])

  // Fetch contact details automatically if admin
  useEffect(() => {
    if (isAdmin && propertyId) {
      const fetchAdminContact = async () => {
        setIsLoadingAdminContact(true)
        try {
          const res = await authenticatedFetch(`/api/properties/${propertyId}/contact`)
          const data = await res.json()
          if (data.success) {
            setAdminContact(data.contact)
          }
        } catch (error) {
          console.error("Admin contact fetch error:", error)
        } finally {
          setIsLoadingAdminContact(false)
        }
      }
      fetchAdminContact()
    }
  }, [isAdmin, propertyId, authenticatedFetch])

  const handleExpressInterest = async () => {
    if (!property) return
    setIsSubmittingInterest(true)
    try {
      const res = await authenticatedFetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: property.id }),
      })

      const data = await res.json()
      if (data.success) {
        setIsInterested(true)
        setShowInterestSuccess(true)
        toast.success("Interest expressed successfully!")
      } else {
        toast.error(data.message || "Failed to express interest")
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsSubmittingInterest(false)
    }
  }

  if (!property) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 py-20">
        <h2 className="font-serif text-2xl font-bold text-foreground">
          Property Not Found
        </h2>
        <p className="text-muted-foreground">
          The property you are looking for does not exist.
        </p>
        <Button asChild>
          <Link href="/properties">Browse Properties</Link>
        </Button>
      </main>
    )
  }

  const images = property.images.length > 0 ? property.images : ["/images/plot-category.jpg"]

  return (
    <main className="flex-1">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-secondary/30 px-4 py-4 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Button variant="ghost" size="sm" className="gap-2" asChild>
            <Link href="/properties">
              <ArrowLeft className="h-4 w-4" />
              Back to Properties
            </Link>
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2">
            {/* Image Gallery Slider */}
            <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm relative group">
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                  {images.map((img, i) => (
                    <div
                      key={i}
                      className="relative aspect-[16/10] min-w-0 flex-[0_0_100%] cursor-pointer"
                      onClick={() => { setLightboxIndex(i); setLightboxOpen(true); }}
                    >
                      <Image
                        src={img}
                        alt={`${property.title} - Image ${i + 1}`}
                        fill
                        className="object-cover"
                        priority={i === 0}
                        sizes="(max-width: 1024px) 100vw, 66vw"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Expand / Zoom button */}
              <Button
                variant="outline"
                size="icon"
                className="absolute top-4 right-4 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm border-white/20 z-10"
                onClick={() => { setLightboxIndex(selectedImage); setLightboxOpen(true); }}
                title="Open fullscreen viewer (zoom, rotate, pan)"
              >
                <Maximize2 className="h-5 w-5" />
              </Button>

              {/* Navigation Controls */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm border-white/20"
                    onClick={scrollPrev}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm border-white/20"
                    onClick={scrollNext}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>

                  {/* Indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-md">
                    {images.map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1.5 rounded-full transition-all duration-300",
                          selectedImage === i ? "w-6 bg-white" : "w-1.5 bg-white/50"
                        )}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-4 mb-4 scrollbar-hide">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => scrollTo(i)}
                    className={cn(
                      "relative h-20 w-32 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200",
                      selectedImage === i
                        ? "border-primary scale-105 shadow-md"
                        : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <Image
                      src={img}
                      alt={`${property.title} - Thumbnail ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Title & Badges */}
            <div className="mb-6">
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge className={cn("text-xs", typeColors[property.type])}>
                  {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
                </Badge>
                <Badge className={cn("text-xs", statusColors[property.status])}>
                  {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                </Badge>
              </div>
              <h1 className="mb-2 font-serif text-2xl font-bold text-foreground md:text-3xl text-balance">
                {property.title}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>
                  {property.location
                    ? `${property.location} · ${property.city}`
                    : property.fullAddress}
                </span>
              </div>
            </div>

            {/* Key Specs */}
            <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Card className="border-border">
                <CardContent className="flex flex-col items-center gap-1 p-4">
                  <Maximize className="h-5 w-5 text-primary" />
                  <p className="text-lg font-bold text-foreground">
                    {property.area.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">{property.areaUnit}</p>
                </CardContent>
              </Card>
              {property.bedrooms !== undefined && (
                <Card className="border-border">
                  <CardContent className="flex flex-col items-center gap-1 p-4">
                    <BedDouble className="h-5 w-5 text-primary" />
                    <p className="text-lg font-bold text-foreground">
                      {property.bedrooms}
                    </p>
                    <p className="text-xs text-muted-foreground">Bedrooms</p>
                  </CardContent>
                </Card>
              )}
              {property.bathrooms !== undefined && (
                <Card className="border-border">
                  <CardContent className="flex flex-col items-center gap-1 p-4">
                    <Bath className="h-5 w-5 text-primary" />
                    <p className="text-lg font-bold text-foreground">
                      {property.bathrooms}
                    </p>
                    <p className="text-xs text-muted-foreground">Bathrooms</p>
                  </CardContent>
                </Card>
              )}
              <Card className="border-border">
                <CardContent className="flex flex-col items-center gap-1 p-4">
                  <Calendar className="h-5 w-5 text-primary" />
                  <p className="text-sm font-bold text-foreground">
                    {new Date(property.createdAt).toLocaleDateString("en-IN", {
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">Listed</p>
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            <Card className="mb-8 border-border">
              <CardHeader>
                <CardTitle className="font-serif text-xl">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-muted-foreground">
                  {property.description}
                </p>
              </CardContent>
            </Card>

            {/* Features */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-serif text-xl">
                  Features & Amenities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {property.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2.5">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Additional Details (Metadata) */}
            {property.metadata && Object.keys(property.metadata as object).length > 0 && (
              <Card className="mt-8 border-border">
                <CardHeader>
                  <CardTitle className="font-serif text-xl">
                    Additional Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {Object.entries(property.metadata as Record<string, any>).map(([key, value]) => {
                      if (value === null || value === undefined || value === "") return null;
                      // Convert camelCase to Title Case
                      const label = key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase());

                      return (
                        <div key={key} className="flex justify-between border-b border-border/50 pb-2">
                          <span className="text-sm text-muted-foreground">{label}</span>
                          <span className="text-sm font-medium text-foreground">{String(value)}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Price & Actions */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 flex flex-col gap-6">
              {/* Price Card */}
              <Card className="border-border">
                <CardContent className="p-6">
                  {/* Admin Controls */}
                  {isAdmin && (
                    <div className="mb-6 space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-primary">Admin Access</span>
                        </div>
                        <Badge variant="outline" className="text-[9px] font-bold h-5 border-primary/20 bg-white shadow-sm">Superuser</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <Button variant="default" size="sm" className="h-8 text-[11px] font-bold gap-1.5 shadow-sm" asChild>
                          <Link href={`/admin/properties`}>
                            <LayoutDashboard className="h-3.5 w-3.5" />
                            Manage
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 text-[11px] font-bold gap-1.5 border-primary/20 hover:bg-white" disabled>
                           <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                           Verified
                        </Button>
                      </div>
                    </div>
                  )}

                  <p className="mb-1 text-sm text-muted-foreground">
                    {property.type === "rent" ? "Monthly Rent" : "Price"}
                  </p>
                  <p className="mb-1 font-serif text-3xl font-bold text-primary">
                    {"Rs. "}{formatPrice(
                      property.type === "rent" && property.monthlyRent ? property.monthlyRent : property.price,
                      property.maxPrice
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {property.priceUnit === "total" ? "Total Price" : `Per ${property.priceUnit}`}
                  </p>
                  {/* Rental-specific pricing */}
                  {property.type === "rent" && (
                    <div className="mt-3 space-y-1.5">
                      {property.securityDeposit && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Security Deposit</span>
                          <span className="font-medium">₹{property.securityDeposit.toLocaleString("en-IN")}</span>
                        </div>
                      )}
                      {property.maintenanceCharge && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Maintenance</span>
                          <span className="font-medium">₹{property.maintenanceCharge.toLocaleString("en-IN")}/mo</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Admin Auto-Reveal Contact */}
                  {isAdmin && (adminContact || isLoadingAdminContact) && (
                    <div className="mt-6 space-y-3 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Phone className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Owner Information (Admin View)</span>
                      </div>
                      {isLoadingAdminContact ? (
                        <div className="h-4 w-32 bg-emerald-100 animate-pulse rounded" />
                      ) : (
                        <div className="space-y-2">
                          <p className="text-sm font-bold text-slate-900">{adminContact?.ownerName || "No Name Provided"}</p>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground flex items-center gap-2">
                               <Phone className="h-3 w-3" />
                               {adminContact?.ownerPhone || "No Phone"}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-2">
                               <Mail className="h-3 w-3" />
                               {adminContact?.ownerEmail || "No Email"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <Separator className="my-4" />
                  {property.brochureUrl && (
                    <Button className="w-full gap-2" size="lg" asChild>
                      <a
                        href={property.brochureUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="h-4 w-4" />
                        Download Brochure
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Type-Specific Details Card */}
            {(property.furnishing || property.constructionStatus || property.facing || property.floor || property.parking || property.gatedCommunity || property.soilType || property.tenantType) && (
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="font-serif text-lg">
                      Property Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2.5">
                    {property.tenantType && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tenant Type</span>
                        <span className="font-medium capitalize">{property.tenantType}</span>
                      </div>
                    )}
                    {property.furnishing && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Furnishing</span>
                        <span className="font-medium capitalize">{property.furnishing.replace(/-/g, " ")}</span>
                      </div>
                    )}
                    {property.constructionStatus && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Construction</span>
                        <span className="font-medium capitalize">{property.constructionStatus.replace(/-/g, " ")}</span>
                      </div>
                    )}
                    {property.facing && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Facing</span>
                        <span className="font-medium capitalize">{property.facing.replace(/-/g, " ")}</span>
                      </div>
                    )}
                    {property.floor && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Floor</span>
                        <span className="font-medium">{property.floor}{property.totalFloors ? ` of ${property.totalFloors}` : ""}</span>
                      </div>
                    )}
                    {property.balconies && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Balconies</span>
                        <span className="font-medium">{property.balconies}</span>
                      </div>
                    )}
                    {property.parking && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Parking</span>
                        <span className="font-medium">{property.parking}</span>
                      </div>
                    )}
                    {property.gatedCommunity && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Gated Community</span>
                        <span className="font-medium text-primary">Yes</span>
                      </div>
                    )}
                    {property.plotDimensions && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Plot Size</span>
                        <span className="font-medium">{property.plotDimensions}</span>
                      </div>
                    )}
                    {property.roadWidth && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Road Width</span>
                        <span className="font-medium">{property.roadWidth}</span>
                      </div>
                    )}
                    {property.soilType && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Soil Type</span>
                        <span className="font-medium">{property.soilType}</span>
                      </div>
                    )}
                    {property.waterSource && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Water Source</span>
                        <span className="font-medium text-primary">Available</span>
                      </div>
                    )}
                    {property.electricityStatus && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Electricity</span>
                        <span className="font-medium text-primary">Available</span>
                      </div>
                    )}
                    {property.isVerified && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Verified</span>
                        <Badge className="bg-primary/10 text-primary text-xs">✓ Verified</Badge>
                      </div>
                    )}
                    {property.propertyAge && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Property Age</span>
                        <span className="font-medium capitalize">{property.propertyAge.replace(/-/g, " ")}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Rental Owner Contact (Paywall) */}
              {(property.type === "rent" || property.ownerName) && (
                <RentalContactGate
                  propertyId={property.id}
                  hasOwnerContact={!!property.ownerName}
                />
              )}

              {/* Generic Contact Card / Interested Button */}
              {property.type !== "rent" && (
                <Card className="border-border overflow-hidden">
                  <CardHeader className="bg-muted/30">
                    <CardTitle className="font-serif text-lg">
                      Interested in this property?
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 transition-all">
                    {showInterestSuccess ? (
                      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-3 p-3 bg-primary/5 text-primary rounded-xl border border-primary/10">
                          <CheckCircle2 className="h-5 w-5 shrink-0" />
                          <p className="text-sm font-medium">Your interest has been notified!</p>
                        </div>
                        {property.ownerName && (
                          <div className="space-y-3 pt-2">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Direct Contact Information</p>
                            <div className="space-y-2">
                              {property.ownerName && <div className="flex items-center gap-3 text-sm font-medium"><div className="h-8 w-8 flex items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">{property.ownerName[0]}</div>{property.ownerName}</div>}
                              {property.ownerPhone && <Button variant="ghost" className="w-full justify-start gap-3 h-11 px-3 hover:bg-primary/5 text-primary" asChild><a href={`tel:${property.ownerPhone}`}><Phone className="h-4 w-4" />{property.ownerPhone}</a></Button>}
                              {property.ownerEmail && <Button variant="ghost" className="w-full justify-start gap-3 h-11 px-3 hover:bg-primary/5 text-primary" asChild><a href={`mailto:${property.ownerEmail}`}><Mail className="h-4 w-4" />{property.ownerEmail}</a></Button>}
                            </div>
                          </div>
                        )}
                        {!property.ownerName && (
                          <div className="space-y-3 pt-2">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">PropVista Support</p>
                            <Button variant="outline" className="w-full justify-start gap-3 h-11 px-3" asChild><a href="tel:+919876543210"><Phone className="h-4 w-4" />+91 98765 43210</a></Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Click below to express your interest. The property owner and our team will be notified immediately.
                        </p>
                        <Button 
                          className="w-full h-12 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90" 
                          onClick={handleExpressInterest}
                          disabled={isSubmittingInterest}
                        >
                          {isSubmittingInterest ? "Expressing..." : "I'm Interested"}
                        </Button>
                        <p className="text-[10px] text-center text-muted-foreground italic">
                          By clicking, you agree to share your profile with the owner.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* EMI Calculator Card */}
              {property.type !== "rent" && (
                <Card className="border-border overflow-hidden">
                  <CardHeader className="bg-secondary/30 pb-4">
                    <CardTitle className="font-serif text-lg flex items-center gap-2">
                      <Calculator className="h-4 w-4 text-primary" />
                      Home Loan EMI
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <EMICalculator compact initialAmount={Math.round(property.price * 0.8)} />
                    <div className="mt-4 text-center">
                       <Button variant="link" size="sm" className="text-xs text-primary font-bold" asChild>
                          <Link href="/tools/emi">Full Calculator & Charts →</Link>
                       </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Lightbox */}
      <ImageLightbox
        images={images}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        title={property.title}
      />
    </main >
  )
}
