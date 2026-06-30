const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database backup...");
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, `../backups/backup-${timestamp}`);
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // Define models to backup
  const models = ['product', 'user', 'order', 'transaction', 'adminLog'];
  
  for (const model of models) {
    console.log(`Backing up ${model}...`);
    try {
      const data = await prisma[model].findMany();
      fs.writeFileSync(
        path.join(backupDir, `${model}.json`),
        JSON.stringify(data, null, 2)
      );
      console.log(`✓ Backed up ${data.length} records for ${model}`);
    } catch (e) {
      console.error(`Error backing up ${model}:`, e.message);
    }
  }

  console.log(`Backup completed successfully in ${backupDir}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
