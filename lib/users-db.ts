import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import type { UserRole } from "@/lib/auth"

export interface User {
    id: string
    name: string
    email: string
    password: string
    role: string
    phone?: string
    savedProperties?: string[]
    searchHistory?: string[]
    activities?: { type: string; title: string; date: string }[]
    trialEndsAt?: string
    subscriptionActive?: boolean
    contactViewsUsed?: number
    contactViewsLimit?: number
    createdAt: string
}

export type SafeUser = Omit<User, "password">

function toSafeUser(user: any): SafeUser {
    const { password: _, savedProperties, activities, ...safe } = user
    return {
        ...safe,
        role: user.role.toLowerCase(),
        phone: user.phone ?? undefined,
        savedProperties: savedProperties?.map((p: any) => p.id) || [],
        activities: activities?.map((a: any) => ({
            type: a.type,
            title: a.title,
            date: a.date.toISOString()
        })) || [],
        trialEndsAt: user.trialEndsAt?.toISOString() ?? undefined,
        subscriptionActive: user.subscriptionActive ?? false,
        contactViewsUsed: user.contactViewsUsed ?? 0,
        contactViewsLimit: user.contactViewsLimit ?? 7,
        createdAt: user.createdAt.toISOString()
    }
}

export async function getAllUsers(): Promise<SafeUser[]> {
    const users = await prisma.user.findMany({
        include: { activities: true, savedProperties: true }
    })
    return users.map(toSafeUser)
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
    const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        include: { activities: true, savedProperties: true }
    })
    if (!user) return undefined

    return {
        ...user,
        role: user.role.toLowerCase() as UserRole,
        phone: user.phone ?? undefined,
        savedProperties: user.savedProperties.map((p: any) => p.id),
        activities: user.activities.map((a: any) => ({
            type: a.type,
            title: a.title,
            date: a.date.toISOString()
        })),
        trialEndsAt: user.trialEndsAt?.toISOString() ?? undefined,
        subscriptionActive: user.subscriptionActive ?? false,
        createdAt: user.createdAt.toISOString()
    }
}

export async function getUserById(id: string): Promise<SafeUser | undefined> {
    const user = await prisma.user.findUnique({
        where: { id },
        include: { activities: true, savedProperties: true }
    })
    return user ? toSafeUser(user) : undefined
}

export async function createUser(
    name: string,
    email: string,
    password: string,
    role: string = "user",
    phone?: string
): Promise<SafeUser> {
    const hashedPassword = await bcrypt.hash(password, 10)

    // Set trial to 30 days from now for regular users
    const trialEndsAt = role.toLowerCase() === "user"
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        : undefined

    const newUser = await prisma.user.create({
        data: {
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: role.toUpperCase() as any,
            phone,
            trialEndsAt,
            activities: {
                create: { type: "account", title: "Account created" }
            }
        },
        include: { activities: true, savedProperties: true }
    })

    return toSafeUser(newUser)
}

export async function toggleSavedProperty(userId: string, propertyId: string): Promise<string[]> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { savedProperties: true }
    })

    if (!user) throw new Error("User not found")

    const isSaved = user.savedProperties.some((p: any) => p.id === propertyId)

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            savedProperties: isSaved
                ? { disconnect: { id: propertyId } }
                : { connect: { id: propertyId } }
        },
        include: { savedProperties: true }
    })

    return updatedUser.savedProperties.map((p: any) => p.id)
}

export async function updateUser(userId: string, data: Partial<Pick<User, "name" | "phone">>): Promise<SafeUser> {
    const user = await prisma.user.update({
        where: { id: userId },
        data: {
            name: data.name,
            phone: data.phone
        },
        include: { activities: true, savedProperties: true }
    })

    return toSafeUser(user)
}

export async function logUserActivity(userId: string, title: string, type: string = "general"): Promise<void> {
    await prisma.activity.create({
        data: {
            userId,
            title,
            type
        }
    })

    // Cleanup old activities if needed? Prisma doesn't do this automatically easily like the array slice.
    // For now, let's keep it simple.
}

export async function addSearchHistory(userId: string, query: string): Promise<string[]> {
    const user = await prisma.user.findUnique({
        where: { id: userId }
    })

    if (!user) return []

    let history = [...user.searchHistory]
    history = [query, ...history.filter(q => q !== query)].slice(0, 10)

    const updated = await prisma.user.update({
        where: { id: userId },
        data: { searchHistory: history }
    })

    return updated.searchHistory
}

export async function verifyPassword(
    user: User,
    password: string
): Promise<boolean> {
    return bcrypt.compare(password, user.password)
}
