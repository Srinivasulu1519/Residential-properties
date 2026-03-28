"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "../../../../../components/ui/button"
import { PropertyForm } from "../../../../../components/property-form"
import { type Property } from "../../../../../lib/data"
import { useAdminAuth } from "../../../../../lib/admin-auth"

export function EditPropertyForm({ propertyId }: { propertyId: string }) {
  // Client component for editing a property
  const { isAuthenticated, user, authenticatedFetch } = useAdminAuth()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProperty() {
      try {
        const res = await authenticatedFetch(`/api/properties/${propertyId}`)
        if (res.ok) {
          const data = await res.json()
          setProperty(data)
        }
      } catch (err) {
        console.error("Failed to fetch property", err)
      } finally {
        setLoading(false)
      }
    }
    fetchProperty()
  }, [propertyId])

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-20 min-h-[50vh]">
        <h2 className="font-serif text-2xl font-bold text-slate-900">
          Property Not Found
        </h2>
        <p className="text-slate-500">
          The property you are trying to edit does not exist or you do not have access.
        </p>
        <Button asChild>
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="mb-8">
        <Button variant="ghost" size="sm" className="mb-4 gap-2" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 mb-2">
          Edit Property
        </h1>
        <p className="text-slate-500">
          Update the details of "{property.title}".
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:p-8">
        <PropertyForm property={property} mode="edit" />
      </div>
    </div>
  )
}
