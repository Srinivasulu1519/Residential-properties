"use client"

import { use } from "react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  MapPin,
  Maximize,
  BedDouble,
  Bath,
  Download,
  CheckCircle2,
  Calendar,
  Tag,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SiteHeader } from "@/components/site-header"

import { PropertyDetailClient } from "./property-detail-client"

export default function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <PropertyDetailClient propertyId={id} />

    </div>
  )
}
