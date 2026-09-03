import { ProductRepository } from "../../infrastructure/repositories/ProductRepository";
import { ProductMapper } from "../mappers/ProductMapper";
import { prisma } from "@/lib/prisma";
import { Telemetry, EventType } from "@/lib/observability/Telemetry";
import { getTraceContext } from "@/lib/observability/TraceContext";
export class StorefrontProductQueryService {
  static async getFeaturedProducts(minRating: number = 4.5, take: number = 6) {
    const products = await ProductRepository.getFeaturedProducts(minRating, take);
    return products.map(p => ProductMapper.toStorefrontCard(p as any));
  }

  static async getTrendingProducts(preferredCategories: string[], take: number = 8) {
    const products = await ProductRepository.getTrendingProducts(preferredCategories, take);
    return products.map(p => ProductMapper.toStorefrontCard(p as any));
  }

  static async getProductsByIds(ids: string[]) {
    const products = await ProductRepository.findByIds(ids);
    return products.map(p => ProductMapper.toStorefrontCard(p as any));
  }

  static async getCompareProductsByIds(ids: string[]) {
    const products = await ProductRepository.findByIds(ids);
    return products.map(p => ProductMapper.toStorefrontDetail(p as any));
  }

  static async getProductDetail(id: string) {
    const { traceId, spanId } = await getTraceContext();
    Telemetry.record({ layer: 'Application', type: EventType.ServiceInvoked, source: 'StorefrontProductQueryService.getProductDetail', traceId, spanId, metadata: { productId: id } });

    const product = await ProductRepository.findById(id); 
    if (!product) return null;
    return ProductMapper.toStorefrontDetail(product as any);
  }

  static async getRelatedProducts(category: string, excludeId: string) {
    const products = await ProductRepository.getRelatedProducts(category, excludeId);
    return products.map(p => ProductMapper.toStorefrontCard(p as any));
  }

  static async searchCatalog(filters: { query?: string, category?: string, brand?: string, minPrice?: number, maxPrice?: number, sort?: string }) {
    const products = await ProductRepository.searchCatalog(filters);
    return products.map(p => ProductMapper.toStorefrontCard(p as any));
  }

  static async getFilterOptions() {
    return ProductRepository.getFilterOptions();
  }

  static async getRecommendedProducts(user: any, country: string) {
    let preferredCategories: string[] = [];
    let userContext = "Welcome to the future of smart shopping.";
    let confidenceScore = 65; // Baseline confidence

    if (user) {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          recentlyViewed: { include: { product: true }, orderBy: { viewedAt: 'desc' }, take: 20 },
          orders: { include: { items: { include: { product: true } } } },
        }
      });

      if (dbUser) {
        const categoryCounts: Record<string, number> = {};
        let totalInteractions = 0;

        dbUser.recentlyViewed.forEach(rv => {
          categoryCounts[rv.product.category] = (categoryCounts[rv.product.category] || 0) + 2;
          totalInteractions += 2;
        });
        
        dbUser.orders.forEach(order => {
          order.items.forEach(item => {
            categoryCounts[item.product.category] = (categoryCounts[item.product.category] || 0) + 5;
            totalInteractions += 5;
          });
        });
        
        preferredCategories = Object.entries(categoryCounts)
          .sort((a, b) => b[1] - a[1])
          .map(e => e[0])
          .slice(0, 4); // Top 4 categories
          
        if (preferredCategories.length > 0) {
          userContext = `Curated for you based on your interest in ${preferredCategories.join(", ")}.`;
          confidenceScore = Math.min(98, 65 + (totalInteractions * 2));
        } else {
          userContext = "We need a bit more data to personalize your experience. Explore the store!";
        }
      }
    } else {
      // Guest Personalization
      const month = new Date().getMonth();
      if (month >= 5 && month <= 7) preferredCategories = ["Travel", "Fashion"]; 
      else if (month >= 10 || month === 0) preferredCategories = ["Electronics", "Home & Kitchen"]; 
      else preferredCategories = ["Watches", "Collectibles"]; 

      if (country === 'GB' || country === 'FR' || country === 'DE') {
        userContext = "Trending across Europe this season.";
        confidenceScore = 75;
      } else if (country === 'US' || country === 'CA') {
        userContext = "Top selections for North America.";
        confidenceScore = 78;
      } else {
        userContext = "Global marketplace highlights.";
      }
    }

    const formattedProducts = await StorefrontProductQueryService.getTrendingProducts(preferredCategories, 24);
    
    return {
      products: formattedProducts,
      userContext,
      confidenceScore,
      preferredCategories
    };
  }

  static async getAllSitemapProducts() {
    const products = await ProductRepository.findAll();
    return products.map(p => ProductMapper.toSitemap(p as any));
  }
}
