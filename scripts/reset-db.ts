import { PrismaClient } from '@prisma/client';

async function resetDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Starting database reset...');
    
    // Disable foreign key checks
    await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0`;
    
    // Truncate tables in correct order to respect foreign key constraints
    const tables = ['news_img', 'img', 'news', 'admin', 'info', 'infoimg'];
    
    for (const table of tables) {
      console.log(`🧹 Clearing table: ${table}`);
      try {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE \`${table}\``);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn(`⚠️ Could not truncate ${table}:`, errorMessage);
      }
    }
    
    // Re-enable foreign key checks
    await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1`;
    
    // Create a test admin user
    const admin = await prisma.admin.create({
      data: {
        user: 'admin',
        password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password' hashed
        role: 'ADMIN'
      }
    });
    
    console.log('✅ Database reset complete!');
    console.log('👤 Test admin created:');
    console.log('   Username: admin');
    console.log('   Password: password');
    
  } catch (error) {
    console.error('❌ Error resetting database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();
