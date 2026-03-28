import { NextRequest, NextResponse } from "next/server"
import {
    getPropertyById,
    updateProperty,
    deleteProperty,
} from "@/lib/db"
import { requireAuth, getUserFromRequest } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const property = await getPropertyById(id)
        if (!property) {
            return NextResponse.json(
                { error: "Property not found" },
                { status: 404 }
            )
        }

        // ── Manual Inactive Check ──
        if (property.isActive === false) {
            const currentUser = getUserFromRequest(request)
            const isOwner = currentUser && currentUser.userId === (property as any).postedById
            const isAdmin = currentUser && currentUser.role === "admin"

            if (!isOwner && !isAdmin) {
                return NextResponse.json(
                    { error: "Property deactivated", message: "This listing has been manually deactivated by the owner or admin." },
                    { status: 403 }
                )
            }
        }

        // ── Subscription/Trial Check ──
        const now = new Date()
        const owner = (property as any).postedBy
        
        if (owner && owner.role !== "ADMIN") {
            const isPremium = owner.subscriptionActive === true
            const trialExpired = owner.trialEndsAt && new Date(owner.trialEndsAt) <= now
            
            if (trialExpired && !isPremium) {
                // Trial expired and not premium — block access for others
                // Allow if requester is Admin or the Owner themselves
                const currentUser = getUserFromRequest(request)
                const isOwner = currentUser && currentUser.userId === (property as any).postedById
                const isAdmin = currentUser && currentUser.role === "admin"
                
                if (!isOwner && !isAdmin) {
                    return NextResponse.json(
                        { 
                            error: "Property temporarily inactive", 
                            message: "This property is currently inactive as the owner's trial has expired and there is no active premium subscription." 
                        },
                        { status: 403 }
                    )
                }
            }
        }

        return NextResponse.json(property)
    } catch (error) {
        console.error("Error fetching property:", error)
        return NextResponse.json(
            { error: "Failed to fetch property" },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const decoded = getUserFromRequest(request)
        if (!decoded) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params
        
        // Fetch property to check ownership
        const property = await prisma.property.findUnique({
            where: { id }
        })

        if (!property) {
            return NextResponse.json({ success: false, message: "Property not found" }, { status: 404 })
        }

        // Allow if Admin OR the original poster
        if (decoded.role !== "admin" && property.postedById !== decoded.userId) {
            return NextResponse.json({ success: false, message: "You don't have permission to edit this property" }, { status: 403 })
        }

        const body = await request.json()
        const updated = await updateProperty(id, body)
        
        return NextResponse.json({
            success: true,
            message: "Property updated successfully",
            property: updated
        })
    } catch (error) {
        console.error("Error updating property:", error)
        return NextResponse.json(
            { success: false, message: "Failed to update property" },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const decoded = getUserFromRequest(request)
        if (!decoded) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params

        // Fetch property to check ownership
        const property = await prisma.property.findUnique({
            where: { id }
        })

        if (!property) {
            return NextResponse.json({ success: false, message: "Property not found" }, { status: 404 })
        }

        // Allow if Admin OR the original poster
        if (decoded.role !== "admin" && property.postedById !== decoded.userId) {
            return NextResponse.json({ success: false, message: "You don't have permission to delete this property" }, { status: 403 })
        }

        const success = await deleteProperty(id)
        if (!success) {
            return NextResponse.json(
                { success: false, message: "Failed to delete property" },
                { status: 500 }
            )
        }
        return NextResponse.json({ success: true, message: "Property deleted successfully" })
    } catch (error) {
        console.error("Error deleting property:", error)
        return NextResponse.json(
            { success: false, message: "Failed to delete property" },
            { status: 500 }
        )
    }
}
