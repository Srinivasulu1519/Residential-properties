import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
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
        const property = await prisma.property.findUnique({
            where: { id: propertyId },
            select: { postedById: true }
        })

        if (!property) {
            return NextResponse.json({ success: false, message: "Property not found" }, { status: 404 })
        }

        if (property.postedById !== decoded.userId && decoded.role !== "admin") {
            return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
        }

        // Fetch active leads (Lead records)
        const activeLeads = await prisma.lead.findMany({
            where: { propertyId },
            include: {
                user: {
                    select: { id: true, name: true, email: true, phone: true }
                }
            },
            orderBy: { createdAt: "desc" }
        })

        // Fetch passive leads (ContactView records)
        const passiveLeads = await prisma.contactView.findMany({
            where: { propertyId },
            include: {
                user: {
                    select: { id: true, name: true, email: true, phone: true }
                }
            },
            orderBy: { viewedAt: "desc" }
        })

        return NextResponse.json({
            success: true,
            activeLeads: activeLeads.map(l => ({
                id: l.user.id,
                name: l.user.name,
                email: l.user.email,
                phone: l.user.phone,
                expressedAt: l.createdAt
            })),
            passiveLeads: passiveLeads.map(l => ({
                id: l.user.id,
                name: l.user.name,
                email: l.user.email,
                phone: l.user.phone,
                viewedAt: l.viewedAt
            }))
        })
    } catch (error) {
        console.error("Fetch leads error:", error)
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
    }
}
