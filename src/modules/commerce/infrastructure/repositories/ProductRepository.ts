import { prisma } from "@/lib/prisma";

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
}
