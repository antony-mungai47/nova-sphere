import { tool } from 'ai';
import { z } from 'zod';
import { SafetyEngine } from '../../SafetyEngine/SafetyEngine';
import { AIContext } from '../../ContextEngine/ContextEngine';
import { prisma } from '@/lib/prisma';

export const buildCatalogTools = (context: AIContext) => {
  return {
    searchCatalog: tool({
      description: 'Searches the product catalog for items matching a keyword.',
      inputSchema: z.object({
        query: z.string(),
      }),
      execute: (async ({ query }: { query: string }) => {
        SafetyEngine.validateToolAccess('searchCatalog', context);
        
        const products = await prisma.product.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ]
          },
          take: 5,
        });

        return products.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price.toNumber(),
          stock: p.stock,
        }));
      }) as any,
    }),

    compareProducts: tool({
      description: 'Compares two or more products side by side.',
      inputSchema: z.object({
        productIds: z.array(z.string()),
      }),
      execute: (async ({ productIds }: { productIds: string[] }) => {
        SafetyEngine.validateToolAccess('compareProducts', context);
        
        const products = await prisma.product.findMany({
          where: { id: { in: productIds } },
        });

        return products.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price.toNumber(),
          category: p.category,
        }));
      }) as any,
    })
  };
};
