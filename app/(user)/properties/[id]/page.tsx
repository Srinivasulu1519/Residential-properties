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
import { useAdminAuth } from "@/lib/admin-auth"
import { PropertyAuthGate } from "@/components/property-auth-gate"

export default function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { isAuthenticated, isInitialLoading } = useAdminAuth()

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader />
      {isInitialLoading ? (
        <div className="flex flex-1 items-center justify-center p-20 bg-white/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              </div>
            </div>
            <p className="text-sm font-serif font-bold text-slate-400 animate-pulse tracking-widest uppercase">Verifying Identity</p>
          </div>
        </div>
      ) : isAuthenticated ? (
        <PropertyDetailClient propertyId={id} />
      ) : (
        <PropertyAuthGate propertyId={id} />
      )}
    </div>
  )
}
