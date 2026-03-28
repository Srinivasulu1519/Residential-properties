"use client"

import { use } from "react"
import { EditPropertyClient } from "./edit-property-client"

export default function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return <EditPropertyClient propertyId={id} />
}
