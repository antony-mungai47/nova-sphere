"use server";

import { prisma } from "@/lib/prisma";
import { ProductImageService } from "@/modules/commerce/services/ProductImageService";


export async function getUpsellProducts(excludeIds: string[] = []) {
  const products = await prisma.product.findMany({
    where: {
      id: { notIn: excludeIds },
      isTrending: true,
      stock: { gt: 0 }
    },
    include: { images: true },
    take: 3,
    orderBy: { rating: 'desc' }
  });

  return products.map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    salePrice: p.salePrice,
    image: ProductImageService.getThumbnailUrl(p),
    brand: p.brand
  }));
}
