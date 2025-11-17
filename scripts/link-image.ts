import { PrismaClient } from '@prisma/client';

async function linkImageToNews() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔗 Linking image to news item...');
    
    // Get the first news item
    const news = await prisma.news.findFirst();
    if (!news) {
      throw new Error('No news items found');
    }
    
    // Get the first image
    const image = await prisma.img.findFirst();
    if (!image) {
      throw new Error('No images found');
    }
    
    console.log(`Found news: ${news.id} - ${news.title}`);
    console.log(`Found image: ${image.id} (${image.base64?.length || 0} chars)`);
    
    // Create the link
    const link = await prisma.newsImg.create({
      data: {
        newsId: news.id,
        imgId: image.id,
      },
    });
    
    console.log('✅ Successfully linked image to news item');
    console.log('Link details:', link);
    
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : 'Unknown error');
  } finally {
    await prisma.$disconnect();
  }
}

linkImageToNews();
