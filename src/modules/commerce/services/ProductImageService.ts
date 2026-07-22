import { Product, ProductImage } from "@prisma/client";

export type ProductWithImages = {
  images?: ProductImage[];
};

export class ProductImageService {
  private static readonly DEFAULT_PLACEHOLDER = "/placeholder.png";

  /**
   * Retrieves the primary image URL for a product, or a guaranteed placeholder.
   */
  static getPrimaryImageUrl(product: ProductWithImages | null): string {
    if (!product || !product.images || product.images.length === 0) {
      return this.DEFAULT_PLACEHOLDER;
    }

    const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
    return primaryImage?.url || this.DEFAULT_PLACEHOLDER;
  }

  /**
   * Retrieves all valid image URLs for a product, ensuring at least one placeholder is returned if none exist.
   */
  static getAllImageUrls(product: ProductWithImages | null): string[] {
    if (!product || !product.images || product.images.length === 0) {
      return [this.DEFAULT_PLACEHOLDER];
    }

    const validUrls = product.images.map(img => img.url).filter(Boolean);
    return validUrls.length > 0 ? validUrls : [this.DEFAULT_PLACEHOLDER];
  }

  /**
   * Generates a transformed Cloudinary URL.
   * Isolates Cloudinary logic completely inside this service.
   */
  static getTransformedUrl(originalUrl: string, options: { width?: number; height?: number; quality?: string }): string {
    if (!originalUrl || originalUrl === this.DEFAULT_PLACEHOLDER || !originalUrl.includes("res.cloudinary.com")) {
      return originalUrl || this.DEFAULT_PLACEHOLDER;
    }

    const transformations = [];
    if (options.width) transformations.push(`w_${options.width}`);
    if (options.height) transformations.push(`h_${options.height}`);
    if (options.quality) transformations.push(`q_${options.quality}`);
    transformations.push('c_fill'); // Fill mode by default

    const transformStr = transformations.join(',');
    return originalUrl.replace('/upload/', `/upload/${transformStr}/`);
  }

  /**
   * Retrieves the primary image transformed as a thumbnail.
   */
  static getThumbnailUrl(product: ProductWithImages | null): string {
    const primaryUrl = this.getPrimaryImageUrl(product);
    return this.getTransformedUrl(primaryUrl, { width: 300, height: 300, quality: 'auto' });
  }

  /**
   * Retrieves a high-res primary image for Product Detail Pages (PDP).
   */
  static getGalleryImageUrl(product: ProductWithImages | null): string {
    const primaryUrl = this.getPrimaryImageUrl(product);
    return this.getTransformedUrl(primaryUrl, { width: 800, quality: 'auto' });
  }
}
