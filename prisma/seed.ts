import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
    const adminEmail = "admin@propvista.com"
    const adminPassword = "admin123"
    const adminName = "Admin"

    // Check if admin already exists
    const existing = await prisma.user.findUnique({
        where: { email: adminEmail },
    })

    if (existing) {
        console.log(`Admin account already exists: ${adminEmail}`)
        return
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10)

    const admin = await prisma.user.create({
        data: {
            name: adminName,
            email: adminEmail,
            password: hashedPassword,
            role: "ADMIN",
            phone: "+91-0000000000",
            activities: {
                create: { type: "account", title: "Admin account created" },
            },
        },
    })

    console.log("✅ Admin account created successfully!")
    console.log(`   Email:    ${adminEmail}`)
    console.log(`   Password: ${adminPassword}`)
    console.log(`   ID:       ${admin.id}`)
    console.log("\n⚠️  Change the password after first login!")
}

main()
    .catch((e) => {
        console.error("❌ Failed to create admin:", e)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
