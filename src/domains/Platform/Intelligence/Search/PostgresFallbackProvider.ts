import { ISearchProvider } from './ISearchProvider';
import { prisma } from '@/lib/prisma';

export class PostgresFallbackProvider implements ISearchProvider {
  async search(query: string, filters?: any): Promise<any> {
    console.log(`[PostgresFallbackProvider] Searching for: ${query}`);
    return prisma.product.findMany({
      where: {
        approvalStatus: 'PUBLISHED',
        name: { contains: query } // Basic fallback search
      },
      take: 20
    });
  }

  async index(documentId: string, data: any): Promise<void> {
    // No-op for Postgres fallback, as Prisma queries the DB directly
    console.log(`[PostgresFallbackProvider] Indexing ${documentId}`);
  }

  async delete(documentId: string): Promise<void> {
    console.log(`[PostgresFallbackProvider] Deleting ${documentId}`);
  }

  async suggest(prefix: string, type: 'product' | 'category' | 'brand' | 'vendor' = 'product'): Promise<any[]> {
    if (type === 'product') {
      const products = await prisma.product.findMany({
        where: { name: { startsWith: prefix } },
        select: { id: true, name: true },
        take: 5
      });
      return products.map(p => ({ text: p.name, type: 'product' }));
    }
    return [];
  }

  async bulkIndex(documents: any[]): Promise<void> {
    console.log(`[PostgresFallbackProvider] Bulk indexing ${documents.length} docs`);
  }

  async healthCheck(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (e) {
      return false;
    }
  }
}
