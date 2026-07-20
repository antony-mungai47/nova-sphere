import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  console.log(await prisma.featureFlag.findMany());
}
main().finally(() => prisma.$disconnect());
