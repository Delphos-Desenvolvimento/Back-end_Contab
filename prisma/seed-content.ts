import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding content data...');

    // Seed About Section
    const about = await prisma.aboutSection.upsert({
        where: { id: 1 },
        update: {},
        create: {
            overline: 'Sobre Nós',
            title: 'A Contab é líder em tecnologia para gestão pública',
            subtitle: 'Somos a evolução da gestão pública, com soluções inovadoras para arrecadar mais, atender melhor e acelerar a transformação digital com um sistema de gestão pública em nuvem.',
            solutionsOverline: 'Nossas Soluções',
            solutionsTitle: 'Transforme sua gestão com nossas soluções inteligentes',
            solutionsSubtitle: 'Oferecemos um ecossistema completo de soluções em nuvem para modernizar e otimizar todos os processos da gestão pública.',
        },
    });
    console.log('✓ About section created:', about.id);

    // Seed Statistics
    const statistics = [
        { value: '+30 milhões', label: 'de brasileiros impactados', icon: 'Users', iconType: 'lucide', order: 1 },
        { value: 'R$8 bi+', label: 'em recursos públicos otimizados', icon: 'TrendingUp', iconType: 'lucide', order: 2 },
        { value: '+850', label: 'clientes em todo o Brasil', icon: 'Shield', iconType: 'lucide', order: 3 },
        { value: '24/7', label: 'suporte especializado', icon: 'Clock', iconType: 'lucide', order: 4 },
    ];

    for (const stat of statistics) {
        await prisma.statistic.upsert({
            where: { id: stat.order },
            update: stat,
            create: stat,
        });
    }
    console.log(`✓ Created ${statistics.length} statistics`);

    // Seed Solutions
    const solutions = [
        {
            title: 'Prefeitura e Gestão',
            description: 'Ecossistema cloud completo para governos inteligentes e eficientes.',
            icon: 'BarChart2',
            iconType: 'lucide',
            order: 1,
        },
        {
            title: 'Saúde',
            description: 'Eleve a estratégia e o atendimento em uma única solução integrada.',
            icon: 'Users',
            iconType: 'lucide',
            order: 2,
        },
        {
            title: 'Educação',
            description: 'Melhores resultados com um sistema de gestão educacional completo.',
            icon: 'Award',
            iconType: 'lucide',
            order: 3,
        },
        {
            title: 'Inteligência Artificial',
            description: 'Soluções avançadas de IA para transformar a gestão pública.',
            icon: 'Zap',
            iconType: 'lucide',
            order: 4,
        },
    ];

    for (const solution of solutions) {
        await prisma.solution.upsert({
            where: { id: solution.order },
            update: solution,
            create: solution,
        });
    }
    console.log(`✓ Created ${solutions.length} solutions`);

    console.log('✅ Seeding completed!');
}

main()
    .catch((e) => {
        console.error('Error seeding data:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
