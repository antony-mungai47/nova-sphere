import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Please provide an email. Usage: npx tsx set_admin.ts <email>");
    process.exit(1);
  }

  const user = await prisma.user.findFirst({
    where: { email }
  });

  if (!user) {
    console.error(`User with email ${email} not found. Please sign in first to sync your account to the database.`);
    process.exit(1);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: 'SUPER_ADMIN' }
  });

  console.log(`Successfully elevated ${email} to SUPER_ADMIN.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
