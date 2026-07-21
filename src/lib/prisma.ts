import { PrismaClient, Prisma } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient<Prisma.PrismaClientOptions, 'query' | 'info' | 'warn' | 'error'> | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient<Prisma.PrismaClientOptions, 'query' | 'info' | 'warn' | 'error'>({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'stdout', level: 'error' },
    { emit: 'stdout', level: 'info' },
    { emit: 'stdout', level: 'warn' },
  ],
});

prisma.$on('query', (e: Prisma.QueryEvent) => {
  if (e.duration >= 500) {
    console.warn(`[SLOW_QUERY] Query took ${e.duration}ms: ${e.query}`);
  }
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
