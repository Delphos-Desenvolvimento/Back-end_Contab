import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const events = await prisma.eventLog.findMany({
        where: { type: 'news_view' },
        orderBy: [
            { userAgent: 'asc' },
            { newsId: 'asc' },
            { createdAt: 'asc' }
        ]
    });

    const toDelete: number[] = [];

    for (let i = 1; i < events.length; i++) {
        const prev = events[i - 1];
        const curr = events[i];

        if (
            prev.userAgent === curr.userAgent &&
            prev.newsId === curr.newsId &&
            (curr.createdAt.getTime() - prev.createdAt.getTime() < 5000) // 5 seconds window
        ) {
            toDelete.push(curr.id);
        }
    }

    console.log(`Found ${toDelete.length} duplicates to delete.`);

    if (toDelete.length > 0) {
        await prisma.eventLog.deleteMany({
            where: { id: { in: toDelete } }
        });
        console.log('Deleted duplicates.');
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
