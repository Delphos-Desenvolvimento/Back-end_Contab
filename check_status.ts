import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const news = await prisma.news.findMany({
        select: { id: true, title: true, status: true }
    });
    console.log(JSON.stringify(news, null, 2));
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
