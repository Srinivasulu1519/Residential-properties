import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
    try {
        const decoded = getUserFromRequest(request)
        if (!decoded || decoded.role !== "admin") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
        }

        // @ts-ignore - Prisma client needs sync
        const leads = await prisma.lead.findMany({
            include: {
                user: {
                    select: { id: true, name: true, email: true, phone: true }
                },
                property: {
                    select: { id: true, title: true, ownerName: true, ownerPhone: true, ownerEmail: true }
                }
            },
            orderBy: { createdAt: "desc" },
            take: 100
        })

        return NextResponse.json({
            success: true,
            leads
        })
    } catch (error) {
        console.error("Admin leads error:", error)
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
    }
}
