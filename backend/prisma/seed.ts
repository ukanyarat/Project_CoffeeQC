const { PrismaClient } = require('@prisma/client');
const { role_name, category_name } = require('../src/utility/util');

const prisma = new PrismaClient()

async function main() {
    for (const role of Object.values(role_name)) {
        await prisma.role.upsert({
            where: { role_name: role },
            update: {},
            create: { role_name: role, created_by: null },
        })
    }

    for (const cat of category_name) {
        await prisma.category.upsert({
            where: { category_name: cat },
            update: {},
            create: { category_name: cat, created_by: null },
        })
    }

    console.log('Seed finished!')
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
