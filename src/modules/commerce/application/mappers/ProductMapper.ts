import type { Product, ProductImage } from "@prisma/client";
import { 
  StorefrontProductCardDTO, 
  StorefrontProductDetailDTO, 
  AdminProductDTO, 
  VendorProductDTO,
  ProductSitemapDTO,
  AdminInventoryDTO
} from "../dtos/ProductDTOs";

import { ProductImageService } from "../../services/ProductImageService";

type ProductWithImages = Product & { images?: ProductImage[], variants?: any[] };

export class ProductMapper {
  static toStorefrontCard(product: ProductWithImages): StorefrontProductCardDTO {
    return {
      id: product.id,
      name: product.name,
      price: Number(product.price),
      salePrice: product.salePrice ? Number(product.salePrice) : null,
      category: product.category,
      brand: product.brand,
      rating: product.rating,
      reviewCount: product.reviewCount,
      isTrending: product.isTrending,
      inStock: product.stock > 0,
      image: ProductImageService.getGalleryImageUrl(product),
      images: ProductImageService.getAllImageUrls(product),
      description: product.description
    };
  }

  static toStorefrontDetail(product: ProductWithImages): StorefrontProductDetailDTO {
    return {
      ...this.toStorefrontCard(product),
      description: product.description,
      sku: product.sku,
      stock: product.stock,
      specs: typeof product.specs === 'string' ? JSON.parse(product.specs) : (product.specs || {}),
      features: typeof product.features === 'string' ? JSON.parse(product.features) : (product.features || []),
      ratingDistribution: typeof product.ratingDistribution === 'string' ? JSON.parse(product.ratingDistribution) : (product.ratingDistribution || {}),
      variants: (product.variants || []).map(v => ({
        id: v.id,
        name: v.name,
        sku: v.sku,
        price: v.price ? Number(v.price) : null,
        stock: v.stock,
        attributes: typeof v.attributes === 'string' ? JSON.parse(v.attributes) : (v.attributes || null)
      }))
    };
  }

  static toAdminProduct(product: ProductWithImages): AdminProductDTO {
    return {
      id: product.id,
      name: product.name,
      price: Number(product.price),
      sku: product.sku,
      category: product.category,
      brand: product.brand,
      stock: product.stock,
      healthScore: product.healthScore || 0,
      status: product.status || 'DRAFT',
      approvalStatus: product.approvalStatus || 'PENDING',
      ownerTenantId: product.ownerTenantId || null,
      imageUrl: ProductImageService.getThumbnailUrl(product),
      isTrending: product.isTrending,
      description: product.description
    };
  }

  static toAdminInventory(product: Product): AdminInventoryDTO {
    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      category: product.category,
      stock: product.stock,
      price: Number(product.price),
      status: product.status
    };
  }

  static toVendorProduct(product: Product): VendorProductDTO {
    return {
      id: product.id,
      name: product.name,
      price: Number(product.price),
      sku: product.sku,
      stock: product.stock,
      status: product.status,
      approvalStatus: product.approvalStatus
    };
  }

  static toSitemap(product: Product): ProductSitemapDTO {
    return {
      id: product.id,
      updatedAt: product.updatedAt.toISOString()
    };
  }
}
