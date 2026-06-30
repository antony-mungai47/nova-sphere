import { prisma } from "@/lib/prisma";
import { ProductClient } from "./product-client";
import { notFound } from "next/navigation";
import { Navbar } from "@/shared/components/layout/navbar";
import { Footer } from "@/shared/components/layout/footer";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const product = await prisma.product.findUnique({
    where: { id: resolvedParams.id },
    include: { images: true }
  });

  if (!product) {
    notFound();
  }

  // Fetch Related Products (same category, exclude current)
  const relatedProductsData = await prisma.product.findMany({
    where: { 
      category: product.category,
      id: { not: product.id }
    },
    take: 4,
    include: { images: true }
  });

  // Parse JSON fields safely
  let specs = {};
  let features = [];
  try {
    if (product.specs) specs = typeof product.specs === 'string' ? JSON.parse(product.specs) : product.specs;
    if (product.features) features = typeof product.features === 'string' ? JSON.parse(product.features) : product.features;
  } catch (e) {
    console.error("Failed to parse product JSON fields", e);
  }

  const formattedProduct = {
    id: product.id,
    name: product.name,
    price: product.price,
    salePrice: product.salePrice,
    category: product.category,
    brand: product.brand,
    images: product.images.map(img => img.url),
    image: product.images?.[0]?.url || "/hero-product.png",
    description: product.description,
    rating: product.rating,
    reviewCount: product.reviewCount,
    sku: product.sku,
    stock: product.stock,
    specs,
    features,
  };

  const relatedProducts = relatedProductsData.map(rp => ({
    id: rp.id,
    name: rp.name,
    price: rp.price,
    salePrice: rp.salePrice,
    category: rp.category,
    image: rp.images?.[0]?.url || "/hero-product.png",
    rating: rp.rating,
  }));

  return (
    <>
      <Navbar />
      <ProductClient product={formattedProduct} relatedProducts={relatedProducts} />
      <Footer />
    </>
  );
}
