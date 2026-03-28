import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
    try {
        const decoded = getUserFromRequest(request)
        if (!decoded) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
        }

        // Fetch leads for properties POSTED by this user
        // @ts-ignore - Prisma client needs sync
        const leads = await prisma.lead.findMany({
            where: {
                property: {
                    postedById: decoded.userId
                }
            },
            include: {
                user: {
                    select: { 
                        id: true, 
                        name: true, 
                        email: true,
                        phone: true 
                    }
                },
                property: {
                    select: { 
                        id: true, 
                        title: true,
                        type: true,
                        city: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        })

        return NextResponse.json({
            success: true,
            leads
        })
    } catch (error) {
        console.error("User leads fetch error:", error)
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
    }
}
