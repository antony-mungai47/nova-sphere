import { ProductRepository } from "../../infrastructure/repositories/ProductRepository";
import { ProductMapper } from "../mappers/ProductMapper";

export class ProductQueryFacade {
  static async searchProducts(query: string) {
    const products = await ProductRepository.search(query);
    return products.map(p => ProductMapper.toStorefrontCard(p as any));
  }

  static async getRecommendationContext(take: number = 10) {
    // For Intelligence & Recommendation Engines
    const products = await ProductRepository.findAll(take);
    // Returning generic Product details for internal domain reasoning.
    return products.map(p => ProductMapper.toStorefrontDetail(p as any));
  }
}
