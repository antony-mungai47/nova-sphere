import React from "react";
import { prisma } from "@/lib/prisma";
import { ProductsClient } from "./products-client";


export default async function AdminProducts() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { images: true }
  });

  const formattedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    category: p.category,
    imageUrl: p.images[0]?.url || "/hero-product.png",
    stock: p.stock,
    isTrending: p.isTrending,
    description: p.description
  }));

  return <ProductsClient initialProducts={formattedProducts} />;
}
