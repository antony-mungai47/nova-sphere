import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.storeSettings.updateMany({
    data: {
      primaryColor: "#6D4AFF"
    }
  });
  console.log("Updated StoreSettings primary color to #6D4AFF");
}

main().catch(console.error).finally(() => prisma.$disconnect());
