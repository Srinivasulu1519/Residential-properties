import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const decoded = getUserFromRequest(request)
        if (!decoded) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
        }

        const { id: propertyId } = await params
        
        // Verify ownership
        const existingProperty = await prisma.property.findUnique({
            where: { id: propertyId }
        })

        if (!existingProperty) {
            return NextResponse.json({ success: false, message: "Property not found" }, { status: 404 })
        }

        if (existingProperty.postedById !== decoded.userId && decoded.role !== "admin") {
            return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
        }

        const body = await request.json()
        const {
            title, type, price, priceUnit, fullAddress, location, city, area, areaUnit,
            bedrooms, bathrooms, description, features, images, brochureUrl, status, metadata,
            listingPurpose, furnishing, constructionStatus, propertyAge,
            floor, totalFloors, balconies, parking, facing,
            plotDimensions, soilType, roadWidth, gatedCommunity,
            waterSource, electricityStatus, ownerName, ownerPhone, ownerEmail,
            monthlyRent, securityDeposit, maintenanceCharge, tenantType,
        } = body

        // Only update fields that are provided
        const updateData: any = {}
        if (title !== undefined) updateData.title = title
        if (type !== undefined) updateData.type = type.toUpperCase()
        if (price !== undefined) updateData.price = parseFloat(price)
        if (priceUnit !== undefined) updateData.priceUnit = priceUnit
        if (fullAddress !== undefined) updateData.fullAddress = fullAddress
        if (location !== undefined) updateData.location = location
        if (city !== undefined) updateData.city = city
        if (area !== undefined) updateData.area = parseFloat(area)
        if (areaUnit !== undefined) updateData.areaUnit = areaUnit
        if (bedrooms !== undefined) updateData.bedrooms = parseInt(bedrooms) || null
        if (bathrooms !== undefined) updateData.bathrooms = parseInt(bathrooms) || null
        if (description !== undefined) updateData.description = description
        if (features !== undefined) updateData.features = features
        if (images !== undefined) updateData.images = images
        if (brochureUrl !== undefined) updateData.brochureUrl = brochureUrl
        if (status !== undefined) updateData.status = status.toUpperCase()
        if (metadata !== undefined) updateData.metadata = metadata
        
        if (listingPurpose !== undefined) updateData.listingPurpose = listingPurpose?.toUpperCase()
        if (furnishing !== undefined) updateData.furnishing = furnishing?.toUpperCase().replace(/-/g, "_")
        if (constructionStatus !== undefined) updateData.constructionStatus = constructionStatus?.toUpperCase().replace(/-/g, "_").replace(/ /g, "_")
        if (propertyAge !== undefined) updateData.propertyAge = propertyAge
        if (floor !== undefined) updateData.floor = parseInt(floor) || null
        if (totalFloors !== undefined) updateData.totalFloors = parseInt(totalFloors) || null
        if (balconies !== undefined) updateData.balconies = parseInt(balconies) || null
        if (parking !== undefined) updateData.parking = parseInt(parking) || null
        if (facing !== undefined) updateData.facing = facing?.toUpperCase().replace(/-/g, "_")
        if (plotDimensions !== undefined) updateData.plotDimensions = plotDimensions
        if (soilType !== undefined) updateData.soilType = soilType
        if (roadWidth !== undefined) updateData.roadWidth = roadWidth
        if (gatedCommunity !== undefined) updateData.gatedCommunity = gatedCommunity === true || gatedCommunity === "true"
        if (waterSource !== undefined) updateData.waterSource = waterSource === true || waterSource === "true"
        if (electricityStatus !== undefined) updateData.electricityStatus = electricityStatus === true || electricityStatus === "true"
        if (ownerName !== undefined) updateData.ownerName = ownerName
        if (ownerPhone !== undefined) updateData.ownerPhone = ownerPhone
        if (ownerEmail !== undefined) updateData.ownerEmail = ownerEmail
        if (monthlyRent !== undefined) updateData.monthlyRent = monthlyRent ? parseFloat(monthlyRent) : null
        if (securityDeposit !== undefined) updateData.securityDeposit = securityDeposit ? parseFloat(securityDeposit) : null
        if (maintenanceCharge !== undefined) updateData.maintenanceCharge = maintenanceCharge ? parseFloat(maintenanceCharge) : null
        if (tenantType !== undefined) updateData.tenantType = tenantType?.toUpperCase()

        const updatedProperty = await prisma.property.update({
            where: { id: propertyId },
            data: updateData
        })

        return NextResponse.json({
            success: true,
            message: "Property updated successfully",
            property: {
                ...updatedProperty,
                type: updatedProperty.type.toLowerCase(),
                status: updatedProperty.status.toLowerCase()
            }
        })
    } catch (error) {
        console.error("Update property error:", error)
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
    }
}
