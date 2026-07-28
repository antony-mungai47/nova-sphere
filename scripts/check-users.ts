import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 5 })
  .then(users => console.log(users))
  .finally(() => prisma.$disconnect());
