import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const flags = [
    { id: 'NAVIGATION_V3', name: 'V3 Navigation', description: 'Enable the unified V3 role-aware navigation system.', enabled: false },
    { id: 'PDP_V3', name: 'V3 Product Detail Page', description: 'Enable the strict V3 PDP layout replacing legacy constraints.', enabled: false },
    { id: 'THEME_V3', name: 'V3 Theme Enforcement', description: 'Enforce the strict V3 design system, stripping all legacy tokens.', enabled: false },
    { id: 'MOTION_V3', name: 'V3 Motion Specifications', description: 'Enable the standardized V3 animation and transition system.', enabled: false },
  ];

  for (const flag of flags) {
    await prisma.featureFlag.upsert({
      where: { id: flag.id },
      update: {},
      create: {
        id: flag.id,
        key: flag.id,
        name: flag.name,
        description: flag.description,
        enabled: flag.enabled,
        category: 'Experimental',
        type: 'Release',
        rolloutPercentage: 0,
      },
    });
  }
  
  console.log("Integration Recovery feature flags seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
