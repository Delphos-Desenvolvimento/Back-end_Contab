import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Updating content data with new fields...');

    // Update existing About Section with new fields
    await prisma.aboutSection.updateMany({
        data: {
            solutionsOverline: 'Nossas Soluções',
            solutionsTitle: 'Transforme sua gestão com nossas soluções inteligentes',
            solutionsSubtitle: 'Oferecemos um ecossistema completo de soluções em nuvem para modernizar e otimizar todos os processos da gestão pública.',
        },
    });
    console.log('✓ About section updated with Solutions fields');

    console.log('✅ Update completed!');
}

main()
    .catch((e) => {
        console.error('Error updating data:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
