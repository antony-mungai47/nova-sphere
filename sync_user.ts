import { createClerkClient } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
const prisma = new PrismaClient();

async function main() {
  const email = 'antonymungai47@gmail.com';
  console.log(`Looking up user in Clerk by email: ${email}`);
  
  const users = await clerkClient.users.getUserList({ emailAddress: [email] });
  if (users.data.length === 0) {
    console.log("No user found in Clerk with that email.");
    return;
  }
  
  const clerkUser = users.data[0];
  const clerkId = clerkUser.id;
  const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Admin';

  console.log(`Found Clerk user: ${clerkId} (${name})`);
  
  const user = await prisma.user.upsert({
    where: { email },
    update: { role: 'SUPER_ADMIN', clerkId, name },
    create: {
      email,
      clerkId,
      name,
      role: 'SUPER_ADMIN'
    }
  });
  
  console.log("Successfully synced user to DB and set as SUPER_ADMIN!");
  console.log(user);
}

main().catch(console.error).finally(() => prisma.$disconnect());
