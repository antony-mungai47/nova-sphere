import { ProductRepository } from "../infrastructure/repositories/ProductRepository";

export class ProductService {
  static async getProductsByIds(ids: string[]) {
    return ProductRepository.findByIds(ids);
  }

  static async getTrendingProducts(preferredCategories: string[], take: number = 8) {
    return ProductRepository.getTrendingProducts(preferredCategories, take);
  }

  static async getFeaturedProducts(minRating: number = 4.5, take: number = 6) {
    return ProductRepository.getFeaturedProducts(minRating, take);
  }
}
