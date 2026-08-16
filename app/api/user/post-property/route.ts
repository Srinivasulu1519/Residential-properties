import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { notifyMatchingUsers } from "@/lib/notifications"
import { isSubscriptionEnforcementEnabled } from "@/lib/subscription-settings"

export async function POST(request: NextRequest) {
    try {
        const decoded = getUserFromRequest(request)
        if (!decoded) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            )
        }

        // Check trial status
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } })
        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
        }

        if (decoded.role !== "admin" && !user.subscriptionActive && user.trialEndsAt && new Date() > user.trialEndsAt) {
            // Only block if subscription enforcement is enabled by admin
            const enforcementEnabled = await isSubscriptionEnforcementEnabled()
            if (enforcementEnabled) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Your 30-day free trial has expired. Please subscribe to post properties.",
                        trialExpired: true,
                    },
                    { status: 403 }
                )
            }
        }

        const body = await request.json()
        const {
            title, type, price, priceUnit, location, city, area, areaUnit,
            bedrooms, bathrooms, description, features, images, metadata,
            // New type-specific fields
            listingPurpose, furnishing, constructionStatus, propertyAge,
            floor, totalFloors, balconies, parking, facing,
            plotDimensions, soilType, roadWidth, gatedCommunity,
            waterSource, electricityStatus,
            // Rental owner contact
            ownerName, ownerPhone, ownerEmail,
            // Rental pricing
            monthlyRent, securityDeposit, maintenanceCharge,
            // Tenant preference
            tenantType,
        } = body

        if (!title || !type || !price || !location || !city || !area || !description) {
            return NextResponse.json(
                { success: false, message: "Required fields: title, type, price, location, city, area, description" },
                { status: 400 }
            )
        }

        // Set 30-day expiry for user-posted listings
        const expiresAt = decoded.role !== "admin"
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            : undefined

        const property = await prisma.property.create({
            data: {
                title,
                type: type.toUpperCase() as any,
                price: parseFloat(price),
                priceUnit: priceUnit || "total",
                fullAddress: location,
                location,
                city,
                area: parseFloat(area),
                areaUnit: areaUnit || "sq ft",
                bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
                bathrooms: bathrooms ? parseInt(bathrooms) : undefined,
                description,
                features: features || [],
                images: images || [],
                metadata: metadata || {},
                status: "AVAILABLE",
                postedById: decoded.userId,
                expiresAt,
                // Type-specific fields
                listingPurpose: listingPurpose?.toUpperCase() || undefined,
                furnishing: furnishing?.toUpperCase().replace(/-/g, "_") || undefined,
                constructionStatus: constructionStatus?.toUpperCase().replace(/-/g, "_").replace(/ /g, "_") || undefined,
                propertyAge: propertyAge || undefined,
                floor: floor ? parseInt(floor) : undefined,
                totalFloors: totalFloors ? parseInt(totalFloors) : undefined,
                balconies: balconies ? parseInt(balconies) : undefined,
                parking: parking ? parseInt(parking) : undefined,
                facing: facing?.toUpperCase().replace(/-/g, "_") || undefined,
                plotDimensions: plotDimensions || undefined,
                soilType: soilType || undefined,
                roadWidth: roadWidth || undefined,
                gatedCommunity: gatedCommunity === true || gatedCommunity === "true",
                waterSource: waterSource === true || waterSource === "true",
                electricityStatus: electricityStatus === true || electricityStatus === "true",
                // Rental contact
                ownerName: ownerName || undefined,
                ownerPhone: ownerPhone || undefined,
                ownerEmail: ownerEmail || undefined,
                // Rental pricing
                monthlyRent: monthlyRent ? parseFloat(monthlyRent) : undefined,
                securityDeposit: securityDeposit ? parseFloat(securityDeposit) : undefined,
                maintenanceCharge: maintenanceCharge ? parseFloat(maintenanceCharge) : undefined,
                tenantType: tenantType?.toUpperCase() || undefined,
            }
        })

        // Notify matching users (fire-and-forget)
        notifyMatchingUsers({
            id: property.id,
            title: property.title,
            type: property.type,
            price: property.price,
            city: property.city,
        })

        return NextResponse.json(
            {
                success: true,
                message: "Property posted successfully!",
                propertyId: property.id,
                expiresAt: expiresAt?.toISOString() || null,
                property: {
                    ...property,
                    type: property.type.toLowerCase(),
                    status: property.status.toLowerCase(),
                    createdAt: property.createdAt.toISOString(),
                    updatedAt: property.updatedAt.toISOString(),
                    expiresAt: property.expiresAt?.toISOString() || null,
                }
            },
            { status: 201 }
        )
    } catch (error) {
        console.error("Post property error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to post property" },
            { status: 500 }
        )
    }
}
