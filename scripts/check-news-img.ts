import { PrismaClient } from '@prisma/client';

async function checkNewsImg() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== Checking news_img table ===');
    
    // Check news_img relationships
    const newsImgLinks = await prisma.newsImg.findMany({
      include: {
        news: true,
        img: true
      }
    });
    
    console.log(`\nFound ${newsImgLinks.length} news-image relationships`);
    
    newsImgLinks.forEach((link, index) => {
      console.log(`\nLink #${index + 1}:`);
      console.log(`- News ID: ${link.newsId} (${link.news?.title || 'News not found'})`);
      console.log(`- Image ID: ${link.imgId}`);
      console.log(`- Image has data: ${!!link.img?.base64}`);
    });
    
    // Check for orphaned images (in img but not in news_img)
    const allImages = await prisma.img.findMany({
      where: {
        news: {
          none: {}
        }
      }
    });
    
    console.log('\n=== Orphaned Images (not linked to any news) ===');
    console.log(`Found ${allImages.length} orphaned images`);
    
    allImages.forEach((img, index) => {
      console.log(`\nOrphaned Image #${index + 1}:`);
      console.log(`- ID: ${img.id}`);
      console.log(`- Has URL: ${!!img.url}`);
      console.log(`- Has base64: ${!!img.base64 ? `Yes (${img.base64.length} chars)` : 'No'}`);
      console.log(`- Created: ${img.createdAt}`);
    });
    
  } catch (error) {
    console.error('Error checking news_img table:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkNewsImg();
