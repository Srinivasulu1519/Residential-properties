"use client"

import { useState, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { X, Plus, Upload, Loader2, MapPin, Sparkles, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  type Property,
  type PropertyType,
  type PropertyStatus,
  type ListingPurpose,
  type FurnishingStatus,
  type FacingDirection,
  type ConstructionStatus,
  type TenantType,
  PROPERTY_TYPES,
  PROPERTY_STATUSES,
  CITIES,
  CITY_LOCATIONS,
  COMMON_FEATURES,
  formatPrice,
} from "@/lib/data"
import { useProperties } from "@/lib/property-context"
import { useAdminAuth } from "@/lib/admin-auth"
import { toast } from "sonner"

const AREA_UNITS = [
  { value: "sq ft", label: "Sq. Ft." },
  { value: "sq yard", label: "Sq. Yard" },
  { value: "sq m", label: "Sq. Meters" },
  { value: "acre", label: "Acres" },
]

interface PropertyFormProps {
  property?: Property
  mode: "create" | "edit"
}

export function PropertyForm({ property, mode }: PropertyFormProps) {
  const router = useRouter()
  const { addProperty, updateProperty } = useProperties()
  const { token, user, authenticatedFetch } = useAdminAuth()
  const imageInputRef = useRef<HTMLInputElement>(null)
  const brochureInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState(property?.title || "")
  const [type, setType] = useState<PropertyType>((property?.type?.toLowerCase() as PropertyType) || "plot")
  const [price, setPrice] = useState(property?.price?.toString() || "")
  const [maxPrice, setMaxPrice] = useState((property as any)?.maxPrice?.toString() || "")
  const [priceUnit, setPriceUnit] = useState(property?.priceUnit || "total")
  const [fullAddress, setFullAddress] = useState(property?.fullAddress || "")
  const [location, setLocation] = useState(property?.location || "")
  const [city, setCity] = useState(property?.city || "")
  const [area, setArea] = useState(property?.area?.toString() || "")
  const [areaUnit, setAreaUnit] = useState(property?.areaUnit || "sq ft")
  const [bedrooms, setBedrooms] = useState(property?.bedrooms?.toString() || "")
  const [bathrooms, setBathrooms] = useState(property?.bathrooms?.toString() || "")
  const [description, setDescription] = useState(property?.description || "")
  const [status, setStatus] = useState<PropertyStatus>((property?.status?.toLowerCase() as PropertyStatus) || "available")
  const [tenantType, setTenantType] = useState<string>((property as any)?.tenantType || "ANY")
  const [brochureUrl, setBrochureUrl] = useState(
    property?.brochureUrl || ""
  )
  const [ownerName, setOwnerName] = useState((property as any)?.ownerName || "")
  const [ownerPhone, setOwnerPhone] = useState((property as any)?.ownerPhone || "")
  const [ownerEmail, setOwnerEmail] = useState((property as any)?.ownerEmail || "")
  const [imageUrls, setImageUrls] = useState<string[]>(
    property?.images || []
  )
  const [features, setFeatures] = useState<string[]>(property?.features || [])
  const [newFeature, setNewFeature] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Initialize custom city state based on existing city
  const initialCity = property?.city || ""
  const isInitialCityCustom = initialCity !== "" && !CITIES.includes(initialCity)
  const [isCustomCity, setIsCustomCity] = useState(isInitialCityCustom)
  const [customCity, setCustomCity] = useState(isInitialCityCustom ? initialCity : "")

  // Type-specific metadata
  const existingMeta = (property as any)?.metadata || {}
  const [metadata, setMetadata] = useState<Record<string, any>>(existingMeta)
  const updateMeta = (key: string, value: any) => setMetadata(prev => ({ ...prev, [key]: value }))

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!title.trim()) errs.title = "Title is required"
    if (!price || isNaN(Number(price)) || Number(price) <= 0)
      errs.price = "Valid price is required"
    if (!fullAddress.trim()) errs.fullAddress = "Address info is required"
    if (!city.trim()) errs.city = "City is required"
    if (!area || isNaN(Number(area)) || Number(area) <= 0)
      errs.area = "Valid area is required"
    if (!description.trim()) errs.description = "Description is required"
    if (maxPrice && !isNaN(Number(maxPrice)) && Number(maxPrice) <= Number(price)) {
      errs.maxPrice = "Max price must be greater than min price"
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleImageUpload = async (files: FileList) => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i])
      }
      const res = await authenticatedFetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Upload failed")
      }
      const data = await res.json()
      setImageUrls((prev) => [...prev, ...data.urls])
      toast.success(`${data.urls.length} image(s) uploaded`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  const handleBrochureUpload = async (files: FileList) => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("files", files[0])
      const res = await authenticatedFetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Upload failed")
      }
      const data = await res.json()
      setBrochureUrl(data.urls[0])
      toast.success("Brochure uploaded")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const propertyData: Omit<Property, "id" | "createdAt" | "updatedAt"> = {
        title: title.trim(),
        type,
        price: Number(price),
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        priceUnit,
        fullAddress: fullAddress.trim(),
        location: location.trim() || undefined,
        city: isCustomCity ? customCity.trim() : city,
        area: Number(area),
        areaUnit,
        bedrooms: bedrooms ? Number(bedrooms) : undefined,
        bathrooms: bathrooms ? Number(bathrooms) : undefined,
        description: description.trim(),
        features,
        images: imageUrls.filter((url) => url.trim()),
        brochureUrl: brochureUrl.trim(),
        status,
        metadata,
        tenantType: type === "rent" ? (tenantType as any) : undefined,
        // Map dynamic form fields directly to the top level for backend processing
        listingPurpose: (type === "rent" ? "rent" : undefined) as ListingPurpose | undefined,
        furnishing: (metadata.furnishing as string)?.toLowerCase().replace(/ /g, "-") as FurnishingStatus | undefined,
        constructionStatus: (metadata.constructionStatus as string)?.toLowerCase().replace(/ /g, "-") as ConstructionStatus | undefined,
        floor: metadata.floor ? Number(metadata.floor) : undefined,
        facing: (metadata.facing as string)?.toLowerCase() as FacingDirection | undefined,
        plotDimensions: metadata.plotDimensions || undefined,
        soilType: metadata.soilType || undefined,
        securityDeposit: metadata.securityDeposit ? Number(metadata.securityDeposit) : undefined,
        maintenanceCharge: metadata.maintenanceCharge ? Number(metadata.maintenanceCharge) : undefined,
        waterSource: metadata.waterSource === "true" || metadata.waterSource === true,
        electricityStatus: metadata.electricityStatus === "true" || metadata.electricityStatus === true,
        gatedCommunity: metadata.gatedCommunity === "true" || metadata.gatedCommunity === true,
        propertyAge: metadata.propertyAge || undefined,
        totalFloors: metadata.totalFloors ? Number(metadata.totalFloors) : undefined,
        balconies: metadata.balconies ? Number(metadata.balconies) : undefined,
        parking: metadata.parking ? Number(metadata.parking) : undefined,
        roadWidth: metadata.roadWidth || undefined,
        ownerName: ownerName.trim() || undefined,
        ownerPhone: ownerPhone.trim() || undefined,
        ownerEmail: ownerEmail.trim() || undefined,
      }

      if (mode === "create") {
        if (user?.role === "admin") {
          await addProperty(propertyData)
        } else {
          // Standard user post
          const postRes = await authenticatedFetch("/api/user/post-property", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(propertyData)
          })
          if (!postRes.ok) {
            const data = await postRes.json()
            throw new Error(data.message || "Failed to create property")
          }
        }
        toast.success("Property created successfully")
      } else if (property) {
        if (user?.role === "admin") {
          await updateProperty(property.id, propertyData)
        } else {
          // Standard user edit
          const putRes = await authenticatedFetch(`/api/user/my-properties/${property.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(propertyData)
          })
          if (!putRes.ok) {
            const data = await putRes.json()
            throw new Error(data.message || "Failed to update property")
          }
        }
        toast.success("Property updated successfully")
      }

      if (user?.role === "admin") {
        router.push("/admin/properties")
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save property")
    } finally {
      setIsSubmitting(false)
    }
  }

  const addFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      setFeatures([...features, newFeature.trim()])
      setNewFeature("")
    }
  }

  const removeFeature = (feature: string) => {
    setFeatures(features.filter((f) => f !== feature))
  }

  const removeImageUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index))
  }

  const showBedroomsBathrooms = ["apartment", "villa", "farmhouse", "rent", "independent_house"].includes(type)

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-5xl space-y-12 pb-8">
      <div className="grid gap-10 lg:grid-cols-3">
        {/* Left Column: Primary Details */}
        <div className="lg:col-span-2 space-y-10">
          {/* Section 1: Basic Information */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-border/60 pb-3">
              <div className="h-6 w-1 rounded-full bg-primary" />
              <h2 className="text-lg font-bold tracking-tight text-foreground/80">Basic Information</h2>
            </div>
            <Card className="border-none bg-card shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)]">
              <CardContent className="grid gap-6 pt-8">
                <div className="space-y-2.5">
                  <Label htmlFor="title" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                    Property Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    className="h-12 bg-muted/30 text-lg transition-all focus:bg-background focus:ring-2 focus:ring-primary/10"
                    placeholder="e.g., Emerald Heights Villa"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  {errors.title && <p className="text-xs font-medium text-destructive">{errors.title}</p>}
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2.5">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Type <span className="text-destructive">*</span></Label>
                    <Select value={type} onValueChange={(v) => {
                      setType(v as PropertyType)
                      if (features.length === 0) setFeatures((COMMON_FEATURES[v] || []).slice(0, 3))
                    }}>
                      <SelectTrigger className="h-12 bg-muted/30 focus:bg-background"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PROPERTY_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2.5">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Status <span className="text-destructive">*</span></Label>
                    <Select value={status} onValueChange={(v) => setStatus(v as PropertyStatus)}>
                      <SelectTrigger className="h-12 bg-muted/30 focus:bg-background"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PROPERTY_STATUSES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {type === "rent" && s.value === "sold" ? "Occupied / Rented" : s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Label htmlFor="description" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Description <span className="text-destructive">*</span></Label>
                  <Textarea
                    id="description"
                    className="min-h-[160px] bg-muted/30 leading-relaxed transition-all focus:bg-background"
                    placeholder="Describe the property's unique features..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  {errors.description && <p className="text-xs font-medium text-destructive">{errors.description}</p>}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Section 2: Pricing & Area */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-border/60 pb-3">
              <div className="h-6 w-1 rounded-full bg-primary" />
              <h2 className="text-lg font-bold tracking-tight text-foreground/80">Pricing & Dimensions</h2>
            </div>
            <Card className="border-none bg-card shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)]">
              <CardContent className="grid gap-6 pt-8">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2.5">
                    <Label htmlFor="price" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Min Price (Rs.) <span className="text-destructive">*</span></Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                      <Input
                        id="price"
                        type="number"
                        className="h-12 bg-muted/30 pl-8 font-mono text-lg transition-all focus:bg-background"
                        placeholder="25000000"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </div>
                    {price && !isNaN(Number(price)) && (
                      <p className="mt-1.5 text-[11px] font-bold text-primary/70 uppercase tracking-widest pl-1">≈ {formatPrice(Number(price))}</p>
                    )}
                    {errors.price && <p className="text-xs font-medium text-destructive mt-1">{errors.price}</p>}
                  </div>
                  <div className="space-y-2.5">
                    <Label htmlFor="maxPrice" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Max Price (Optional)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                      <Input
                        id="maxPrice"
                        type="number"
                        className="h-12 bg-muted/30 pl-8 font-mono text-lg transition-all focus:bg-background"
                        placeholder="30000000"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                      />
                    </div>
                    {maxPrice && !isNaN(Number(maxPrice)) && (
                      <p className="mt-1.5 text-[11px] font-bold text-primary/70 uppercase tracking-widest pl-1">≈ {formatPrice(Number(maxPrice))}</p>
                    )}
                    {errors.maxPrice && <p className="text-xs font-medium text-destructive mt-1">{errors.maxPrice}</p>}
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2.5">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Price Unit</Label>
                    <Select value={priceUnit} onValueChange={setPriceUnit}>
                      <SelectTrigger className="h-12 bg-muted/30 focus:bg-background"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="total">Total Price</SelectItem>
                        <SelectItem value="per sq ft">Per Sq. Ft.</SelectItem>
                        <SelectItem value="per sq yard">Per Sq. Yard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2.5">
                    <Label htmlFor="area" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Total Area <span className="text-destructive">*</span></Label>
                    <Input
                      id="area"
                      type="number"
                      className="h-12 bg-muted/30 font-mono text-lg transition-all focus:bg-background"
                      placeholder="4500"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                    />
                    {errors.area && <p className="text-xs font-medium text-destructive">{errors.area}</p>}
                  </div>
                  <div className="space-y-2.5">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Area Unit</Label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {AREA_UNITS.map((unit) => (
                        <button
                          key={unit.value}
                          type="button"
                          onClick={() => setAreaUnit(unit.value)}
                          className={cn(
                            "px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all border",
                            areaUnit === unit.value
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/50"
                          )}
                        >
                          {unit.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {showBedroomsBathrooms && (
                  <div className="grid gap-6 sm:grid-cols-2 pt-2">
                    <div className="space-y-2.5">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Bedrooms</Label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5, "6+"].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setBedrooms(num.toString().replace("+", ""))}
                            className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-semibold transition-all",
                              bedrooms === num.toString().replace("+", "")
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-muted/30 hover:bg-muted/50 border-transparent text-muted-foreground"
                            )}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Bathrooms</Label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setBathrooms(num.toString())}
                            className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-semibold transition-all",
                              bathrooms === num.toString()
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-muted/30 hover:bg-muted/50 border-transparent text-muted-foreground"
                            )}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Section 3: Location Details (Moved here for better width) */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-border/60 pb-3">
              <div className="h-6 w-1 rounded-full bg-primary" />
              <h2 className="text-lg font-bold tracking-tight text-foreground/80">Location Details</h2>
            </div>
            <Card className="border-none bg-card shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)]">
              <CardContent className="grid gap-6 pt-8">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2.5">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 pl-1">City <span className="text-destructive">*</span></Label>
                    <Select value={isCustomCity ? "other" : city} onValueChange={v => {
                      if (v === "other") {
                        setIsCustomCity(true)
                        setCity("")
                      } else {
                        setIsCustomCity(false)
                        setCity(v)
                        setCustomCity("")
                      }
                      setLocation("")
                    }}>
                      <SelectTrigger className="h-12 bg-muted/30 focus:bg-background"><SelectValue placeholder="Select City" /></SelectTrigger>
                      <SelectContent>
                        {CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        <SelectItem value="other">Other (Type below)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2.5">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 pl-1">
                      {isCustomCity ? "Enter City Name" : "Location / Area"}
                    </Label>
                    {isCustomCity ? (
                      <Input
                        className="h-12 bg-muted/30 focus:bg-background border-primary/20"
                        placeholder="e.g., Mysore"
                        value={customCity}
                        onChange={(e) => setCustomCity(e.target.value)}
                      />
                    ) : (
                      <Input
                        className="h-12 bg-muted/30 focus:bg-background"
                        placeholder="e.g., Whitefield"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    )}
                  </div>
                </div>

                {isCustomCity && (
                  <div className="space-y-2.5">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 pl-1">Location / Area</Label>
                    <Input
                      className="h-12 bg-muted/30 focus:bg-background"
                      placeholder="e.g., Jayalakshmipuram"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                )}

                {/* Quick Area Select */}
                {city && CITY_LOCATIONS[city] && (
                  <div className="space-y-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Popular in {city}:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {CITY_LOCATIONS[city].map(loc => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => setLocation(loc)}
                          className={cn(
                            "text-[10px] px-2.5 py-1.5 rounded-md transition-all border border-dashed",
                            location === loc
                              ? "bg-primary text-primary-foreground border-primary font-bold shadow-sm"
                              : "bg-muted/20 text-muted-foreground border-border/50 hover:bg-muted/40"
                          )}
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2.5">
                  <Label htmlFor="fullAddress" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 pl-1">
                    {["plot", "agriculture_land"].includes(type) ? "Landmark / Precise Location" : "Full Address / Unit Details"} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fullAddress"
                    className="h-12 bg-muted/30 transition-all focus:bg-background"
                    placeholder={["plot", "agriculture_land"].includes(type) ? "e.g., Near Apollo Pharma, Plot 42" : "e.g., Unit 502, Wing B, Near Park"}
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                  />
                  {errors.fullAddress && (
                    <p className="text-xs font-medium text-destructive mt-1">{errors.fullAddress}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Section 4: Type-Specific Details */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
              <div className="h-6 w-1 rounded-full bg-primary" />
              <h2 className="text-lg font-bold tracking-tight text-foreground/80">{PROPERTY_TYPES.find(t => t.value === type)?.label || type} Details</h2>
              <span className="text-xs text-primary bg-slate-50 px-2 py-0.5 rounded-full font-medium">Extra context</span>
            </div>
            <Card className="border-slate-100 bg-gradient-to-br from-yellow-50/10 to-white shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)]">
              <CardContent className="grid gap-6 pt-8">
                {type === "plot" && (
                  <div className="grid gap-6 sm:grid-cols-3">
                    <div className="space-y-2.5">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Plot Dimensions (L×W ft)</Label>
                      <Input className="h-11 bg-white" placeholder="e.g., 40×60" value={metadata.plotDimensions || ""} onChange={e => updateMeta("plotDimensions", e.target.value)} />
                    </div>
                    <div className="space-y-2.5">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Gated Community</Label>
                      <Select value={String(metadata.gatedCommunity) || ""} onValueChange={v => updateMeta("gatedCommunity", v)}>
                        <SelectTrigger className="h-11 bg-white"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Yes</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2.5">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Facing</Label>
                      <Select value={metadata.facing || ""} onValueChange={v => updateMeta("facing", v)}>
                        <SelectTrigger className="h-11 bg-white"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{["North", "South", "East", "West"].map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                {type === "apartment" && (
                  <div className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-4">
                      <div className="space-y-2.5">
                        <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Floor</Label>
                        <Input className="h-11 bg-white" type="number" value={metadata.floor || ""} onChange={e => updateMeta("floor", e.target.value)} />
                      </div>
                      <div className="space-y-2.5">
                        <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Total Floors</Label>
                        <Input className="h-11 bg-white" type="number" value={metadata.totalFloors || ""} onChange={e => updateMeta("totalFloors", e.target.value)} />
                      </div>
                      <div className="space-y-2.5">
                        <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Balconies</Label>
                        <Input className="h-11 bg-white" type="number" value={metadata.balconies || ""} onChange={e => updateMeta("balconies", e.target.value)} />
                      </div>
                      <div className="space-y-2.5">
                        <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Parking</Label>
                        <Input className="h-11 bg-white" type="number" value={metadata.parking || ""} onChange={e => updateMeta("parking", e.target.value)} />
                      </div>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-3">
                      <div className="space-y-2.5">
                        <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Furnishing</Label>
                        <Select value={metadata.furnishing || ""} onValueChange={v => updateMeta("furnishing", v)}>
                          <SelectTrigger className="h-11 bg-white"><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>{["Unfurnished", "Semi-Furnished", "Fully Furnished"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2.5">
                        <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Construction Status</Label>
                        <Select value={metadata.constructionStatus || ""} onValueChange={v => updateMeta("constructionStatus", v)}>
                          <SelectTrigger className="h-11 bg-white"><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>{["Ready to Move", "Under Construction", "New Launch"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2.5">
                        <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Property Age</Label>
                        <Input className="h-11 bg-white" placeholder="e.g. 2 years" value={metadata.propertyAge || ""} onChange={e => updateMeta("propertyAge", e.target.value)} />
                      </div>
                    </div>
                  </div>
                )}
                {["villa", "independent_house"].includes(type) && (
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2.5">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Plot Area (sq ft)</Label>
                      <Input className="h-11 bg-white" type="number" value={metadata.plotArea || ""} onChange={e => updateMeta("plotArea", e.target.value)} />
                    </div>
                    <div className="space-y-2.5">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Facing</Label>
                      <Select value={metadata.facing || ""} onValueChange={v => updateMeta("facing", v)}>
                        <SelectTrigger className="h-11 bg-white"><SelectValue /></SelectTrigger>
                        <SelectContent>{["North", "South", "East", "West"].map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {type === "farmhouse" && (
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2.5">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Land Area (acres)</Label>
                      <Input className="h-11 bg-white" type="number" placeholder="e.g. 2.5" value={metadata.farmLandArea || ""} onChange={e => updateMeta("farmLandArea", e.target.value)} />
                    </div>
                    <div className="space-y-2.5">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Water Source</Label>
                      <Select value={String(metadata.waterSource) || ""} onValueChange={v => updateMeta("waterSource", v)}>
                        <SelectTrigger className="h-11 bg-white"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Available</SelectItem>
                          <SelectItem value="false">Not Available</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {type === "agriculture_land" && (
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2.5">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Soil Type</Label>
                      <Select value={metadata.soilType || ""} onValueChange={v => updateMeta("soilType", v)}>
                        <SelectTrigger className="h-11 bg-white"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{["Red Soil", "Black Soil", "Alluvial", "Clay"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2.5">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Crop History</Label>
                      <Input className="h-11 bg-white" placeholder="e.g. Rice, Wheat" value={metadata.cropType || ""} onChange={e => updateMeta("cropType", e.target.value)} />
                    </div>
                  </div>
                )}

                {type === "rent" && (
                  <div className="grid gap-6 sm:grid-cols-3">
                    <div className="space-y-2.5">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">BHK</Label>
                      <Select value={metadata.bhk || ""} onValueChange={v => updateMeta("bhk", v)}>
                        <SelectTrigger className="h-11 bg-white"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{["1 RK", "1 BHK", "2 BHK", "3 BHK", "4+ BHK"].map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2.5">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Furnishing</Label>
                      <Select value={metadata.furnishing || ""} onValueChange={v => updateMeta("furnishing", v)}>
                        <SelectTrigger className="h-11 bg-white"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{["Unfurnished", "Semi-Furnished", "Fully Furnished"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2.5">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Deposit (₹)</Label>
                      <Input className="h-11 bg-white" type="number" placeholder="e.g. 50000" value={metadata.securityDeposit || ""} onChange={e => updateMeta("securityDeposit", e.target.value)} />
                    </div>
                  </div>
                )}
                
                {type === "rent" && (
                  <div className="grid gap-6 sm:grid-cols-2 mt-4">
                    <div className="space-y-2.5">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Maintenance Charge (₹)</Label>
                      <Input className="h-11 bg-white" type="number" placeholder="e.g. 2000" value={metadata.maintenanceCharge || ""} onChange={e => updateMeta("maintenanceCharge", e.target.value)} />
                    </div>
                    <div className="space-y-2.5">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Tenant Preference</Label>
                      <Select value={tenantType} onValueChange={setTenantType}>
                        <SelectTrigger className="h-11 bg-white"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ANY">Any (Family & Bachelors)</SelectItem>
                          <SelectItem value="FAMILY">Family Only</SelectItem>
                          <SelectItem value="BACHELORS">Bachelors Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {type === "commercial" && (
                  <div className="grid gap-6 sm:grid-cols-3">
                    <div className="space-y-2.5">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Sub-Type</Label>
                      <Select value={metadata.subType || ""} onValueChange={v => updateMeta("subType", v)}>
                        <SelectTrigger className="h-11 bg-white"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{["Office", "Shop", "Warehouse", "Showroom", "Other"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2.5">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Parking</Label>
                      <Select value={metadata.parking || ""} onValueChange={v => updateMeta("parking", v)}>
                        <SelectTrigger className="h-11 bg-white"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{["Reserved", "Public", "None"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2.5">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Carpet Area</Label>
                      <Input className="h-11 bg-white" type="number" placeholder="800" value={metadata.carpetArea || ""} onChange={e => updateMeta("carpetArea", e.target.value)} />
                    </div>
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground italic">Detailed specs can be added after saving.</p>
              </CardContent>
            </Card>
          </section>

          {/* Section 5: Features */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-border/60 pb-3">
              <div className="h-6 w-1 rounded-full bg-primary" />
              <h2 className="text-lg font-bold tracking-tight text-foreground/80">Amenities & Features</h2>
            </div>
            <Card className="border-none bg-card shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)]">
              <CardContent className="space-y-6 pt-8">
                <div className="flex flex-wrap gap-2">
                  {features.map((f) => (
                    <Badge key={f} variant="secondary" className="group flex items-center gap-2 bg-muted/40 px-3 py-1.5 text-xs font-semibold">
                      {f}
                      <button type="button" onClick={() => removeFeature(f)} className="rounded-full p-0.5 hover:bg-destructive/10 hover:text-destructive"><X className="h-3 w-3" /></button>
                    </Badge>
                  ))}
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 border-l-2 border-primary/30 pl-2">Quick Add Suggestions</p>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_FEATURES[type as string]?.filter(f => !features.includes(f)).slice(0, 10).map(f => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFeatures([...features, f])}
                        className="flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-full bg-primary/5 text-primary/80 hover:bg-primary hover:text-white transition-all duration-200 border border-primary/10 shadow-sm"
                      >
                        <Plus className="h-3 w-3" />
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input className="h-11 bg-muted/30" placeholder="Add custom feature..." value={newFeature} onChange={(e) => setNewFeature(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())} />
                  <Button type="button" variant="secondary" onClick={addFeature} className="px-6 h-11">Add</Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Section 6: Contact Information */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-border/60 pb-3">
              <div className="h-6 w-1 rounded-full bg-primary" />
              <h2 className="text-lg font-bold tracking-tight text-foreground/80">Owner / Contact Details</h2>
            </div>
            <Card className="border-none bg-card shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)]">
              <CardContent className="grid gap-6 pt-8">
                <div className="grid gap-6 sm:grid-cols-3">
                  <div className="space-y-2.5">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Contact Name</Label>
                    <Input className="h-11 bg-muted/30" placeholder="e.g. John Doe" value={ownerName} onChange={e => setOwnerName(e.target.value)} />
                  </div>
                  <div className="space-y-2.5">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Phone Number</Label>
                    <Input className="h-11 bg-muted/30" placeholder="e.g. +91 98765 43210" value={ownerPhone} onChange={e => setOwnerPhone(e.target.value)} />
                  </div>
                  <div className="space-y-2.5">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Email Address</Label>
                    <Input className="h-11 bg-muted/30" placeholder="e.g. john@example.com" value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Right Column: Media */}
        <div className="space-y-10">
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-border/60 pb-3">
              <div className="h-6 w-1 rounded-full bg-primary" />
              <h2 className="text-lg font-bold tracking-tight text-foreground/80">Media Gallery</h2>
            </div>
            <Card className="border-none bg-card shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)]">
              <CardContent className="grid gap-6 pt-8">
                <div
                  className={cn("flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 bg-muted/20 p-8 transition-all hover:border-primary/40", isUploading && "animate-pulse")}
                  onClick={() => imageInputRef.current?.click()}
                >
                  {isUploading ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : <Upload className="h-5 w-5 text-muted-foreground/60" />}
                  <p className="text-[10px] font-bold uppercase tracking-widest">Add Photos</p>
                  <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && handleImageUpload(e.target.files)} />
                </div>
                {imageUrls.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {imageUrls.map((url, i) => (
                      <div key={i} className="group relative aspect-video overflow-hidden rounded-lg border bg-muted/40">
                        <Image src={url} alt="" fill className="object-cover" />
                        <button type="button" onClick={() => removeImageUrl(i)} className="absolute right-1.5 top-1.5 h-6 w-6 flex items-center justify-center rounded-full bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-3 w-3" /></button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 pl-1">Brochure</Label>
                  <Button type="button" variant="outline" className="h-10 w-full justify-start gap-2 bg-muted/30 text-[10px] font-bold" onClick={() => brochureInputRef.current?.click()} disabled={isUploading}>
                    <Upload className="h-3.5 w-3.5" />
                    {brochureUrl ? "Brochure Uploaded" : "Upload PDF"}
                  </Button>
                  <input ref={brochureInputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files && handleBrochureUpload(e.target.files)} />
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>

      {/* Static Form Actions */}
      <div className="flex justify-between items-center bg-card border border-border/60 p-6 rounded-2xl mt-12">
        <div className="hidden sm:block min-w-[200px]">
          <p className="text-sm font-bold text-foreground/80">{mode === "create" ? "New Property" : "Edit Property"}</p>
          <p className="text-[11px] text-muted-foreground truncate">{title ? title : "Draft"}</p>
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <Button 
            type="button" 
            variant="ghost" 
            className="flex-1 sm:px-8 font-bold text-muted-foreground" 
            onClick={() => {
              if (user?.role === "admin") {
                router.push("/admin/properties")
              } else {
                router.push("/dashboard")
              }
            }}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || isUploading} className="flex-1 sm:px-12 font-bold shadow-md shadow-primary/20">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : mode === "create" ? "Publish Online" : "Save Changes"}
          </Button>
        </div>
      </div>
    </form>
  )
}
