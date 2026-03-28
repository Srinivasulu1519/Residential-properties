import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = requireAuth(request)
        if ('error' in authResult) {
            return NextResponse.json({ success: false, message: authResult.error }, { status: authResult.status })
        }
        if (authResult.user.role !== "admin") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 })
        }

        const resolvedParams = await params
        const id = resolvedParams.id
        
        // Fetch target user to check their role
        const targetUser = await prisma.user.findUnique({ where: { id } })
        if (!targetUser) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
        }

        // Only allow managing admin accounts
        if (targetUser.role !== "ADMIN") {
            return NextResponse.json({ 
                success: false, 
                message: "Admins can only edit architectural admin accounts. Regular users must be managed via system-wide processes." 
            }, { status: 403 })
        }

        const body = await request.json()
        const { name, email, role, password } = body

        if (!name || !email || !role) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
        }

        // Check if email is already taken by someone else
        const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
        if (existingUser && existingUser.id !== id) {
            return NextResponse.json({ success: false, message: "Email is already registered" }, { status: 400 })
        }

        const updateData: any = {
            name,
            email: email.toLowerCase(),
            role: role.toUpperCase()
        }

        if (password && password.length >= 6) {
            updateData.password = await bcrypt.hash(password, 10)
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: updateData
        })

        return NextResponse.json({
            success: true,
            message: "User updated successfully",
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role.toLowerCase()
            }
        })
    } catch (error) {
        console.error("Failed to update user:", error)
        return NextResponse.json({ success: false, message: "Failed to update user" }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = requireAuth(request)
        if ('error' in authResult) {
            return NextResponse.json({ success: false, message: authResult.error }, { status: authResult.status })
        }
        if (authResult.user.role !== "admin") {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 })
        }

        const resolvedParams = await params
        const id = resolvedParams.id
        
        // Fetch target user to check their role
        const targetUser = await prisma.user.findUnique({ where: { id } })
        if (!targetUser) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
        }

        // Only allow managing admin accounts
        if (targetUser.role !== "ADMIN") {
            return NextResponse.json({ 
                success: false, 
                message: "Admins can only delete other administrators. Regular users are protected." 
            }, { status: 403 })
        }

        // Prevent admin from deleting themselves
        if (id === authResult.user.userId) {
            return NextResponse.json({ success: false, message: "You cannot delete your own account" }, { status: 400 })
        }

        await prisma.user.delete({
            where: { id }
        })

        return NextResponse.json({
            success: true,
            message: "User deleted successfully"
        })
    } catch (error) {
        console.error("Failed to delete user:", error)
        return NextResponse.json({ success: false, message: "Failed to delete user" }, { status: 500 })
    }
}
