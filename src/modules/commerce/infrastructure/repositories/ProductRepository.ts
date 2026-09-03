import { prisma } from "@/lib/prisma";
import { Telemetry, EventType } from "@/lib/observability/Telemetry";
import { getTraceContext } from "@/lib/observability/TraceContext";
export class ProductRepository {
  static async findByIds(ids: string[]) {
    return prisma.product.findMany({
      where: { id: { in: ids } }
    });
  }

  static async getTrendingProducts(preferredCategories: string[], take: number = 8) {
    return prisma.product.findMany({
      where: preferredCategories.length > 0 ? {
        OR: [
          { category: { in: preferredCategories } },
          { isTrending: true }
        ]
      } : { isTrending: true },
      include: { images: true },
      orderBy: { rating: 'desc' },
      take,
    });
  }

  static async getFeaturedProducts(minRating: number = 4.5, take: number = 6) {
    return prisma.product.findMany({
      where: { rating: { gte: minRating } },
      include: { images: true },
      orderBy: { reviewCount: "desc" },
      take,
    });
  }
  static async findById(id: string) {
    const { traceId, spanId } = await getTraceContext();
    Telemetry.record({ layer: 'Infrastructure', type: EventType.RepositoryCall, source: 'ProductRepository.findById', traceId, spanId, metadata: { productId: id } });

    return prisma.product.findUnique({
      where: { id },
      include: { images: true, variants: true }
    });
  }

  static async getRelatedProducts(category: string, excludeId: string) {
    return prisma.product.findMany({
      where: { 
        category,
        id: { not: excludeId }
      },
      take: 4,
      include: { images: true }
    });
  }

  static async findAll(take?: number) {
    return prisma.product.findMany({
      include: { images: true },
      take
    });
  }

  static async findByTenant(tenantId: string) {
    return prisma.product.findMany({
      where: { ownerTenantId: tenantId },
      include: { images: true }
    });
  }

  static async search(query: string) {
    return prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: { images: true }
    });
  }

  static async searchCatalog(filters: { query?: string, category?: string, brand?: string, minPrice?: number, maxPrice?: number, sort?: string }) {
    const where: any = {};
    if (filters.query) {
      where.OR = [
        { name: { contains: filters.query, mode: 'insensitive' } },
        { description: { contains: filters.query, mode: 'insensitive' } },
      ];
    }
    if (filters.category && filters.category !== 'All') where.category = filters.category;
    if (filters.brand && filters.brand !== 'All') where.brand = filters.brand;
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
      if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
    }

    let orderBy: any = { createdAt: 'desc' };
    if (filters.sort === 'price-low') orderBy = { price: 'asc' };
    if (filters.sort === 'price-high') orderBy = { price: 'desc' };
    if (filters.sort === 'rating') orderBy = { rating: 'desc' };

    return prisma.product.findMany({
      where,
      orderBy,
      include: { images: true },
    });
  }

  static async getFilterOptions() {
    const [categories, brands] = await Promise.all([
      prisma.product.findMany({ select: { category: true }, distinct: ['category'] }),
      prisma.product.findMany({ select: { brand: true }, distinct: ['brand'] }),
    ]);
    return {
      categories: ['All', ...categories.map(c => c.category)],
      brands: ['All', ...brands.map(b => b.brand)]
    };
  }

  static async getCategoryStats() {
    return prisma.product.groupBy({
      by: ['category'],
      _count: { id: true },
      _sum: { stock: true },
      _avg: { price: true }
    });
  }

  static async getInventoryStats() {
    const [totalProducts, outOfStock, lowStock] = await Promise.all([
      prisma.product.aggregate({ _count: { id: true } }),
      prisma.product.count({ where: { stock: 0 } }),
      prisma.product.count({ where: { stock: { gt: 0, lte: 10 } } })
    ]);
    return {
      total: totalProducts._count.id,
      outOfStock,
      lowStock
    };
  }
}
