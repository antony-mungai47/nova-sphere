const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  if (args.length !== 1) {
    console.error("Usage: node db-restore.js <backup-directory-name>");
    process.exit(1);
  }

  const backupDir = path.join(__dirname, `../backups/${args[0]}`);
  if (!fs.existsSync(backupDir)) {
    console.error(`Backup directory not found: ${backupDir}`);
    process.exit(1);
  }

  console.log(`Starting database restore from ${backupDir}...`);

  // Define models to restore in reverse order of dependencies where possible
  // For a complex schema like Prisma, using createMany is usually preferred, but
  // constraints might require careful ordering or wiping the DB first.
  const models = ['adminLog', 'transaction', 'order', 'user', 'product'];

  for (const model of models) {
    const file = path.join(backupDir, `${model}.json`);
    if (fs.existsSync(file)) {
      console.log(`Restoring ${model}...`);
      try {
        const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
        if (data.length > 0) {
          // Warning: this assumes you've wiped the DB first or are okay with skipping duplicates.
          // Using createMany with skipDuplicates for safety
          const result = await prisma[model].createMany({
            data: data,
            skipDuplicates: true,
          });
          console.log(`✓ Restored ${result.count} records for ${model}`);
        }
      } catch (e) {
        console.error(`Error restoring ${model}:`, e.message);
      }
    }
  }

  console.log("Restore completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
