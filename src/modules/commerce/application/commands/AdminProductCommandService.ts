import { ProductRepository } from "../../infrastructure/repositories/ProductRepository";
import { prisma } from "@/lib/prisma"; // Internal module boundary allowed to use Prisma

export class AdminProductCommandService {
  static async updateProductStock(productId: string, newStock: number) {
    // In a real CQRS setup, this would go through the Command repository, 
    // but we can proxy it through Prisma here as this is the Command application service.
    return prisma.product.update({
      where: { id: productId },
      data: { stock: newStock }
    });
  }

  static async createProduct(data: any) {
    return prisma.product.create({ data });
  }

  static async updateProduct(id: string, data: any) {
    return prisma.product.update({
      where: { id },
      data
    });
  }

  static async deleteProduct(id: string) {
    return prisma.product.delete({
      where: { id }
    });
  }
}
