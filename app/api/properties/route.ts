import { NextRequest, NextResponse } from "next/server"
import { getAllProperties, createProperty } from "@/lib/db"
import { requireAuth, getUserFromRequest } from "@/lib/auth"
import { notifyMatchingUsers } from "@/lib/notifications"

export async function GET(request: NextRequest) {
    try {
        let properties = await getAllProperties()
        const { searchParams } = new URL(request.url)

        // ── Basic Filters ──
        const type = searchParams.get("type")
        const status = searchParams.get("status")
        const city = searchParams.get("city")
        const search = searchParams.get("search")
        const sort = searchParams.get("sort")
        const location = searchParams.get("location")

        // ── New Filters ──
        const listingPurpose = searchParams.get("listingPurpose")
        const furnishing = searchParams.get("furnishing")
        const constructionStatus = searchParams.get("constructionStatus")
        const facing = searchParams.get("facing")
        const minPrice = searchParams.get("minPrice")
        const maxPrice = searchParams.get("maxPrice")
        const minArea = searchParams.get("minArea")
        const maxArea = searchParams.get("maxArea")
        const bedrooms = searchParams.get("bedrooms")
        const gatedCommunity = searchParams.get("gatedCommunity")
        const isVerified = searchParams.get("isVerified")
        const propertyAge = searchParams.get("propertyAge")
        const soilType = searchParams.get("soilType")
        const bhk = searchParams.get("bhk")
        const tenantType = searchParams.get("tenantType")

        // ── Apply Basic Filters ──
        if (type && type !== "all") {
            properties = properties.filter((p) => p.type === type)
        }
        if (status && status !== "all") {
            properties = properties.filter((p) => p.status === status)
        }
        if (city && city !== "all") {
            properties = properties.filter((p) => p.city === city)
        }
        if (location && location !== "all") {
            properties = properties.filter((p) => p.location === location)
        }

        // ── Apply New Filters ──
        if (listingPurpose && listingPurpose !== "all") {
            properties = properties.filter(
                (p) => (p as any).listingPurpose?.toLowerCase() === listingPurpose.toLowerCase()
            )
        }
        if (furnishing && furnishing !== "all") {
            properties = properties.filter(
                (p) => (p as any).furnishing?.toLowerCase().replace(/_/g, "-") === furnishing.toLowerCase()
            )
        }
        if (constructionStatus && constructionStatus !== "all") {
            properties = properties.filter(
                (p) => (p as any).constructionStatus?.toLowerCase().replace(/_/g, "-") === constructionStatus.toLowerCase()
            )
        }
        if (tenantType && tenantType !== "all") {
            properties = properties.filter(
                (p) => (p as any).tenantType?.toLowerCase() === tenantType.toLowerCase() || (p as any).tenantType?.toLowerCase() === "any"
            )
        }
        if (facing && facing !== "all") {
            properties = properties.filter(
                (p) => (p as any).facing?.toLowerCase().replace(/_/g, "-") === facing.toLowerCase()
            )
        }
        if (minPrice) {
            const min = parseFloat(minPrice)
            properties = properties.filter((p) => p.price >= min)
        }
        if (maxPrice) {
            const max = parseFloat(maxPrice)
            properties = properties.filter((p) => p.price <= max)
        }
        if (minArea) {
            const min = parseFloat(minArea)
            properties = properties.filter((p) => p.area >= min)
        }
        if (maxArea) {
            const max = parseFloat(maxArea)
            properties = properties.filter((p) => p.area <= max)
        }
        if (bedrooms && bedrooms !== "all") {
            if (bedrooms.endsWith("+")) {
                const min = parseInt(bedrooms)
                properties = properties.filter((p) => p.bedrooms && p.bedrooms >= min)
            } else {
                const exact = parseInt(bedrooms)
                properties = properties.filter((p) => p.bedrooms === exact)
            }
        }
        if (bhk && bhk !== "all") {
            const bhkNum = parseInt(bhk)
            if (!isNaN(bhkNum)) {
                if (bhkNum >= 5) {
                    properties = properties.filter((p) => p.bedrooms && p.bedrooms >= 5)
                } else {
                    properties = properties.filter((p) => p.bedrooms === bhkNum)
                }
            }
        }
        if (gatedCommunity === "true") {
            properties = properties.filter((p) => (p as any).gatedCommunity === true)
        }
        if (isVerified === "true") {
            properties = properties.filter((p) => (p as any).isVerified === true)
        }
        if (propertyAge && propertyAge !== "all") {
            properties = properties.filter((p) => (p as any).propertyAge === propertyAge)
        }
        if (soilType && soilType !== "all") {
            properties = properties.filter((p) => (p as any).soilType === soilType)
        }

        // ── Text Search ──
        if (search) {
            const q = search.toLowerCase()
            properties = properties.filter(
                (p) =>
                    p.title.toLowerCase().includes(q) ||
                    p.fullAddress.toLowerCase().includes(q) ||
                    p.location?.toLowerCase().includes(q) ||
                    p.city.toLowerCase().includes(q) ||
                    p.description.toLowerCase().includes(q)
            )
        }

        // ── Sorting ──
        switch (sort) {
            case "price-low":
                properties.sort((a, b) => a.price - b.price)
                break
            case "price-high":
                properties.sort((a, b) => b.price - a.price)
                break
            case "area-high":
                properties.sort((a, b) => b.area - a.area)
                break
            case "newest":
            default:
                properties.sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )
        }

        // Filter out expired properties for non-admin users
        const currentUser = getUserFromRequest(request)
        const isAdminRequester = currentUser?.role === "admin"

        const now = new Date()
        properties = properties.filter((p: any) => {
            // Admin sees EVERYTHING
            if (isAdminRequester) return true

            // ── 0. Manual Inactive Check ──
            if (p.isActive === false) return false

            // ── 1. Property Expiry ──
            if (p.expiresAt && new Date(p.expiresAt) <= now) return false

            // ── 2. Owner Trial/Subscription Expiry ──
            // If the property has an owner who is NOT an admin
            if (p.postedBy && p.postedBy.role !== "ADMIN") {
                const isPremium = p.postedBy.subscriptionActive === true
                const trialExpired = p.postedBy.trialEndsAt && new Date(p.postedBy.trialEndsAt) <= now

                // Hide property if trial is expired and they are NOT premium
                if (trialExpired && !isPremium) return false
            }

            return true
        })

        return NextResponse.json(properties)
    } catch (error) {
        console.error("Error fetching properties:", error)
        return NextResponse.json(
            { error: "Failed to fetch properties" },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const auth = requireAuth(request) // Allow both user and admin
        if ("error" in auth) {
            return NextResponse.json(
                { error: auth.error },
                { status: auth.status }
            )
        }

        const body = await request.json()
        
        // If it's a regular user, force the postedById to be their own ID
        if (auth.user.role === "user") {
            body.postedById = auth.user.userId
        }
        
        const newProperty = await createProperty(body)

        // Notify matching users (fire-and-forget)
        notifyMatchingUsers({
            id: newProperty.id,
            title: newProperty.title,
            type: newProperty.type,
            price: newProperty.price,
            city: newProperty.city,
        })

        return NextResponse.json(newProperty, { status: 201 })
    } catch (error) {
        console.error("Error creating property:", error)
        return NextResponse.json(
            { error: "Failed to create property" },
            { status: 500 }
        )
    }
}
