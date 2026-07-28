import { clerkClient } from '@clerk/nextjs/server';
import { PrismaClient, UserRole } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables for the script
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

async function backfill() {
  console.log('--- Starting Clerk to Prisma Identity Backfill ---');

  try {
    // 1. Fetch all users from Clerk
    // Note: In a production app with thousands of users, you would need pagination.
    // Assuming < 500 users for this run.
    console.log('Fetching users from Clerk...');
    const client = await clerkClient();
    const usersResponse = await client.users.getUserList({
      limit: 500,
    });
    
    // In newer Clerk SDKs, the array is in usersResponse.data
    const users = Array.isArray(usersResponse) ? usersResponse : (usersResponse as any).data;

    console.log(`Found ${users.length} users in Clerk.`);

    let createdCount = 0;
    let updatedCount = 0;

    // 2. Iterate and Upsert into Prisma
    for (const clerkUser of users) {
      const primaryEmail = clerkUser.emailAddresses?.find(
        (e: any) => e.id === clerkUser.primaryEmailAddressId
      )?.emailAddress || clerkUser.emailAddresses?.[0]?.emailAddress || 'unknown@example.com';
      
      const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User';

      try {
        const existing = await prisma.user.findUnique({
          where: { clerkId: clerkUser.id }
        });

        await prisma.user.upsert({
          where: { clerkId: clerkUser.id },
          update: {
            email: primaryEmail,
            name: name,
          },
          create: {
            clerkId: clerkUser.id,
            email: primaryEmail,
            name: name,
            role: UserRole.CUSTOMER, // Default role
          }
        });

        if (existing) {
          updatedCount++;
        } else {
          createdCount++;
        }
        
      } catch (upsertError) {
        console.error(`❌ Failed to sync user ${clerkUser.id} (${primaryEmail})`, upsertError);
      }
    }

    console.log('--- Backfill Complete ---');
    console.log(`✅ Created: ${createdCount}`);
    console.log(`✅ Updated: ${updatedCount}`);
    
  } catch (error) {
    console.error('❌ Fatal error during backfill:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

backfill();
