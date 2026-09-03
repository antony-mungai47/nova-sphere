import { ProductRepository } from "../../infrastructure/repositories/ProductRepository";
import { ProductMapper } from "../mappers/ProductMapper";

export class AdminProductQueryService {
  static async getAllProducts() {
    const products = await ProductRepository.findAll();
    return products.map(p => ProductMapper.toAdminProduct(p));
  }

  static async getInventoryOverview() {
    const products = await ProductRepository.findAll();
    return products.map(p => ProductMapper.toAdminInventory(p));
  }

  static async getInventoryStats() {
    return ProductRepository.getInventoryStats();
  }

  static async getCategoryStats() {
    const raw = await ProductRepository.getCategoryStats();
    return raw.map(stat => ({
      name: stat.category,
      productCount: stat._count.id,
      totalStock: stat._sum.stock || 0,
      avgPrice: stat._avg.price || 0
    }));
  }
}
