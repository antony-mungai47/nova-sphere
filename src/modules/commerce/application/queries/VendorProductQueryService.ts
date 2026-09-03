import { ProductRepository } from "../../infrastructure/repositories/ProductRepository";
import { ProductMapper } from "../mappers/ProductMapper";

export class VendorProductQueryService {
  static async getVendorProducts(tenantId: string) {
    const products = await ProductRepository.findByTenant(tenantId);
    return products.map(p => ProductMapper.toVendorProduct(p));
  }
}
