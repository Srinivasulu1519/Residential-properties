import { NextRequest, NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth"
import { addSearchHistory, logUserActivity } from "@/lib/users-db"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
    try {
        const decoded = getUserFromRequest(request)
        if (!decoded) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { searchHistory: true }
        })

        if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })

        return NextResponse.json({
            success: true,
            history: user.searchHistory || []
        })
    } catch (error) {
        console.error("Error fetching search history:", error)
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const decoded = getUserFromRequest(request)
        if (!decoded) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })

        const { query } = await request.json()
        if (!query) return NextResponse.json({ success: false, message: "Query required" }, { status: 400 })

        const history = await addSearchHistory(decoded.userId, query)
        await logUserActivity(decoded.userId, `Searched for: ${query}`, "search")

        return NextResponse.json({
            success: true,
            history
        })
    } catch (error) {
        console.error("Error adding search history:", error)
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
    }
}
