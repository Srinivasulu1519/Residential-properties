import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany()
  console.log("Users:", users.map(u => ({ id: u.id, email: u.email, role: u.role })))
  
  const properties = await prisma.property.findMany({ select: { id: true, title: true, postedById: true } })
  console.log("Properties:", properties)
}

main().catch(console.error).finally(() => prisma.$disconnect())
