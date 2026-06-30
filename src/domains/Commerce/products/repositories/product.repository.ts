import { prisma } from "@/lib/prisma";

export const ProductRepository = {
  ...prisma.product,
  getTrendingProducts: async (preferredCategories: string[], take: number = 8) => {
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
  },
  getFeaturedProducts: async (minRating: number = 4.5, take: number = 6) => {
    return prisma.product.findMany({
      where: { rating: { gte: minRating } },
      include: { images: true },
      orderBy: { reviewCount: "desc" },
      take,
    });
  },

};
