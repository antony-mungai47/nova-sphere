export interface StorefrontProductCardDTO {
  id: string;
  name: string;
  price: number;
  salePrice: number | null;
  category: string;
  brand: string;
  rating: number;
  reviewCount: number;
  isTrending: boolean;
  image: string;
  images: string[];
  inStock: boolean; // Boolean only for storefront! No absolute stock numbers.
  description: string;
}

export interface StorefrontProductDetailDTO extends StorefrontProductCardDTO {
  description: string;
  sku: string;
  stock: number;
  specs: any;
  features: any;
  ratingDistribution: any;
  variants: {
    id: string;
    name: string;
    sku: string;
    price: number | null;
    stock: number;
    attributes: any;
  }[];
}

export interface AdminProductDTO {
  id: string;
  name: string;
  price: number;
  sku: string;
  category: string;
  brand: string;
  stock: number; // Absolute stock count allowed
  healthScore: number;
  status: string;
  approvalStatus: string;
  ownerTenantId: string | null;
  imageUrl: string;
  isTrending: boolean;
  description: string;
}

export interface AdminInventoryDTO {
  id: string;
  sku: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  status: string;
}

export interface VendorProductDTO {
  id: string;
  name: string;
  price: number;
  sku: string;
  stock: number;
  status: string;
  approvalStatus: string;
}

export interface ProductSitemapDTO {
  id: string;
  updatedAt: string;
}
