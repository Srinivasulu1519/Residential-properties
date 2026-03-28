"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PropertyForm } from "@/components/property-form"
import { useProperties } from "@/lib/property-context"

export function EditPropertyClient({ propertyId }: { propertyId: string }) {
  const { getProperty } = useProperties()
  const property = getProperty(propertyId)

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-20">
        <h2 className="font-serif text-2xl font-bold text-foreground">
          Property Not Found
        </h2>
        <p className="text-muted-foreground">
          The property you are trying to edit does not exist.
        </p>
        <Button asChild>
          <Link href="/admin/properties">Back to Properties</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <Button variant="ghost" size="sm" className="mb-4 gap-2" asChild>
          <Link href="/admin/properties">
            <ArrowLeft className="h-4 w-4" />
            Back to Properties
          </Link>
        </Button>
        <h1 className="font-serif text-2xl font-bold text-foreground md:text-3xl">
          Edit Property
        </h1>
        <p className="text-sm text-muted-foreground">
          Update the details of &ldquo;{property.title}&rdquo;.
        </p>
      </div>

      <div className="mx-auto max-w-3xl">
        <PropertyForm property={property} mode="edit" />
      </div>
    </div>
  )
}
