import { PrismaClient, UserRole } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

async function verifyIdentity() {
  console.log('--- Nova Sphere Identity Verification Report ---');
  try {
    const totalUsers = await prisma.user.count();
    console.log(`Total Prisma Users: ${totalUsers}\n`);

    const roles: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'STAFF', 'CUSTOMER'];

    for (const role of roles) {
      const users = await prisma.user.findMany({
        where: { role },
        select: {
          id: true,
          clerkId: true,
          email: true,
          name: true,
          role: true,
          updatedAt: true,
        },
        take: 5,
      });

      console.log(`Role: [${role}] - Count: ${users.length} (showing up to 5)`);
      if (users.length === 0) {
        console.log('  (No users found for this role)\n');
      } else {
        users.forEach((u) => {
          console.log(`  - ClerkID: ${u.clerkId} | Email: ${u.email} | Name: ${u.name} | Updated: ${u.updatedAt.toISOString()}`);
        });
        console.log('');
      }
    }

    // Check Vendors (users associated with a Tenant via TenantUser)
    const vendors = await prisma.user.findMany({
      where: {
        tenantUsers: {
          some: {}
        }
      },
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        updatedAt: true,
      },
      take: 5,
    });

    console.log(`Associated Vendors (via TenantUser) - Count: ${vendors.length} (showing up to 5)`);
    if (vendors.length === 0) {
      console.log('  (No vendor accounts found)\n');
    } else {
      vendors.forEach((u) => {
        console.log(`  - ClerkID: ${u.clerkId} | Email: ${u.email} | Name: ${u.name} | Updated: ${u.updatedAt.toISOString()}`);
      });
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error during identity verification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyIdentity();
