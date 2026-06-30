import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

// Configure Cloudinary from NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function main() {
  console.log('Starting Cloudinary migration...');

  if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error("Missing Cloudinary credentials in .env");
    process.exit(1);
  }

  const images = await prisma.productImage.findMany({
    where: {
      url: {
        contains: 'unsplash.com',
      },
    },
  });

  console.log(`Found ${images.length} Unsplash images to migrate.`);

  let successCount = 0;
  let failureCount = 0;

  for (const img of images) {
    try {
      console.log(`Uploading ${img.url}...`);
      // Cloudinary can upload directly from an external URL
      const result = await cloudinary.uploader.upload(img.url, {
        folder: 'nova-sphere-products',
      });
      
      console.log(`Upload success: ${result.secure_url}`);
      
      // Update the database
      await prisma.productImage.update({
        where: { id: img.id },
        data: { url: result.secure_url },
      });
      
      successCount++;
    } catch (e) {
      console.error(`Failed to upload ${img.url}:`, e);
      failureCount++;
    }
  }

  console.log(`Migration complete. Success: ${successCount}, Failures: ${failureCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
