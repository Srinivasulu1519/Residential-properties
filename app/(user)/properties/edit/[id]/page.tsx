"use client"

import { use } from "react"
import { EditPropertyForm } from "./edit-property-form"
import { SiteHeader } from "@/components/site-header"

export default function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      <EditPropertyForm propertyId={id} />
    </div>
  )
}
