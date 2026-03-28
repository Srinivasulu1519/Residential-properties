"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PropertyForm } from "@/components/property-form"

export default function NewPropertyPage() {
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
          Add New Property
        </h1>
        <p className="text-sm text-muted-foreground">
          Fill in the details below to create a new property listing.
        </p>
      </div>

      <div className="mx-auto max-w-3xl">
        <PropertyForm mode="create" />
      </div>
    </div>
  )
}
