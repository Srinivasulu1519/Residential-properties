import { prisma } from "@/lib/prisma"
import { type Property as PropertyDataType } from "@/lib/data"
import { PropertyType, PropertyStatus } from "@prisma/client"

export type Property = PropertyDataType

function mapProperty(p: any): Property {
  return {
    ...p,
    type: p.type.toLowerCase() as any,
    status: p.status.toLowerCase() as any,
    fullAddress: p.fullAddress,
    location: p.location || undefined,
    bedrooms: p.bedrooms ?? undefined,
    bathrooms: p.bathrooms ?? undefined,
    brochureUrl: p.brochureUrl || undefined,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    // New fields
    listingPurpose: p.listingPurpose?.toLowerCase() || undefined,
    furnishing: p.furnishing?.toLowerCase().replace(/_/g, "-") || undefined,
    constructionStatus: p.constructionStatus?.toLowerCase().replace(/_/g, "-") || undefined,
    facing: p.facing?.toLowerCase().replace(/_/g, "-") || undefined,
    propertyAge: p.propertyAge || undefined,
    floor: p.floor ?? undefined,
    totalFloors: p.totalFloors ?? undefined,
    balconies: p.balconies ?? undefined,
    parking: p.parking ?? undefined,
    plotDimensions: p.plotDimensions || undefined,
    soilType: p.soilType || undefined,
    roadWidth: p.roadWidth || undefined,
    gatedCommunity: p.gatedCommunity || false,
    waterSource: p.waterSource || false,
    electricityStatus: p.electricityStatus || false,
    isVerified: p.isVerified || false,
    isActive: p.isActive ?? true,
    viewCount: p.viewCount || 0,
    expiresAt: p.expiresAt?.toISOString() || undefined,
    // Rental-Specific Pricing
    monthlyRent: p.monthlyRent ?? undefined,
    securityDeposit: p.securityDeposit ?? undefined,
    maintenanceCharge: p.maintenanceCharge ?? undefined,
    // Owner Contact
    ownerName: p.ownerName || undefined,
    ownerPhone: p.ownerPhone || undefined,
    ownerEmail: p.ownerEmail || undefined,
  } as unknown as Property
}

export async function getAllProperties(): Promise<Property[]> {
  const properties = await prisma.property.findMany({
    orderBy: { createdAt: 'desc' },
    include: { postedBy: true }
  })
  return properties.map(mapProperty)
}

export async function getPropertyById(id: string): Promise<Property | undefined> {
  const p = await prisma.property.findUnique({
    where: { id },
    include: { postedBy: true }
  })
  if (!p) return undefined

  // Increment view count
  await prisma.property.update({
    where: { id },
    data: { viewCount: { increment: 1 } }
  }).catch(() => {})

  return mapProperty(p)
}

export async function createProperty(
  propertyData: Omit<Property, "id" | "createdAt" | "updatedAt">
): Promise<Property> {
  const data: any = {
    ...propertyData,
    type: propertyData.type.toUpperCase() as PropertyType,
    status: (propertyData.status ? propertyData.status.toUpperCase() : "AVAILABLE") as PropertyStatus,
  }

  // Convert enum fields to uppercase for Prisma
  if (data.listingPurpose) data.listingPurpose = data.listingPurpose.toUpperCase()
  if (data.furnishing) data.furnishing = data.furnishing.toUpperCase().replace(/-/g, "_")
  if (data.constructionStatus) data.constructionStatus = data.constructionStatus.toUpperCase().replace(/-/g, "_").replace(/ /g, "_")
  if (data.facing) data.facing = data.facing.toUpperCase().replace(/-/g, "_")

  const p = await prisma.property.create({ data })
  return mapProperty(p)
}

export async function updateProperty(
  id: string,
  updates: Partial<Property>
): Promise<Property | null> {
  try {
    const data: any = { ...updates }

    // Convert enum fields
    if (data.type) data.type = data.type.toUpperCase() as PropertyType
    if (data.status) data.status = data.status.toUpperCase() as PropertyStatus
    if (data.listingPurpose) data.listingPurpose = data.listingPurpose.toUpperCase()
    if (data.furnishing) data.furnishing = data.furnishing.toUpperCase().replace(/-/g, "_")
    if (data.constructionStatus) data.constructionStatus = data.constructionStatus.toUpperCase().replace(/-/g, "_").replace(/ /g, "_")
    if (data.facing) data.facing = data.facing.toUpperCase().replace(/-/g, "_")

    // Remove computed fields
    delete data.createdAt
    delete data.updatedAt

    const p = await prisma.property.update({
      where: { id },
      data,
    })
    return mapProperty(p)
  } catch (error) {
    return null
  }
}

export async function deleteProperty(id: string): Promise<boolean> {
  try {
    // Delete related records first
    await prisma.lead.deleteMany({ where: { propertyId: id } })
    await prisma.contactView.deleteMany({ where: { propertyId: id } })
    await prisma.notification.deleteMany({ where: { propertyId: id } })
    await prisma.property.delete({ where: { id } })
    return true
  } catch (error) {
    return false
  }
}
