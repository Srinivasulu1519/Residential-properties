const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const properties = await prisma.property.findMany({
        select: { id: true, title: true, city: true, location: true, subLocation: true }
    });

    console.log(`Found ${properties.length} properties.`);

    let updated = 0;
    for (const p of properties) {
        console.log(`Processing: "${p.title}" | Location: "${p.location}"`);

        // If subLocation is already set, skip
        if (p.subLocation) continue;

        let subLoc = null;
        if (p.location && p.location.includes(',')) {
            subLoc = p.location.split(',')[0].trim();
        } else if (p.location) {
            // If there's no comma, maybe use the first word or just the whole location if it doesn't match the city
            subLoc = p.location.trim();
        }

        if (subLoc && subLoc.toLowerCase() !== p.city.toLowerCase()) {
            await prisma.property.update({
                where: { id: p.id },
                data: { subLocation: subLoc }
            });
            console.log(`  -> Updated: subLocation = "${subLoc}"`);
            updated++;
        }
    }

    console.log(`\nDone! Updated ${updated} properties.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
