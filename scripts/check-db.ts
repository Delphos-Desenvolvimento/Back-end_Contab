import { PrismaClient } from '@prisma/client';

async function checkDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== Checking database content ===');
    
    // Check news items
    const newsItems = await prisma.news.findMany({
      include: {
        images: {
          include: {
            img: true
          }
        }
      }
    });
    
    console.log('\n=== News Items ===');
    console.log(`Found ${newsItems.length} news items`);
    
    newsItems.forEach((news, index) => {
      console.log(`\nNews #${index + 1}:`);
      console.log(`- ID: ${news.id}`);
      console.log(`- Title: ${news.title}`);
      console.log(`- Status: ${news.status}`);
      console.log(`- Created: ${news.createdAt}`);
      console.log(`- Images: ${news.images.length}`);
      
      news.images.forEach((img, imgIndex) => {
        console.log(`  Image #${imgIndex + 1}:`);
        console.log(`  - ID: ${img.img.id}`);
        console.log(`  - Has URL: ${!!img.img.url}`);
        console.log(`  - Has base64: ${!!img.img.base64 ? `Yes (${img.img.base64.length} chars)` : 'No'}`);
        console.log(`  - Alt Text: ${img.img.altText || 'None'}`);
      });
    });
    
    // Check all images
    const allImages = await prisma.img.findMany();
    console.log('\n=== All Images ===');
    console.log(`Found ${allImages.length} images in total`);
    
    allImages.forEach((img, index) => {
      console.log(`\nImage #${index + 1}:`);
      console.log(`- ID: ${img.id}`);
      console.log(`- Has URL: ${!!img.url}`);
      console.log(`- Has base64: ${!!img.base64 ? `Yes (${img.base64.length} chars)` : 'No'}`);
      console.log(`- Created: ${img.createdAt}`);
    });
    
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
