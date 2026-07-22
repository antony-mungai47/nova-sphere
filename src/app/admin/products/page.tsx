import React from "react";
import { prisma } from "@/lib/prisma";
import { ProductsClient } from "./products-client";
import { ProductImageService } from "@/modules/commerce/services/ProductImageService";


export default async function AdminProducts() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { images: true }
  });

  const formattedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price.toNumber(),
    category: p.category,
    imageUrl: ProductImageService.getThumbnailUrl(p),
    stock: p.stock,
    isTrending: p.isTrending,
    description: p.description
  }));

  return <ProductsClient initialProducts={formattedProducts} />;
}
