import { PrismaClient } from "@prisma/client";
import { ProductClient } from "./product-client";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const prisma = new PrismaClient();

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { images: true }
  });

  if (!product) {
    notFound();
  }

  // Parse JSON fields safely
  let specs = {};
  let features = [];
  try {
    if (product.specs) specs = JSON.parse(product.specs);
    if (product.features) features = JSON.parse(product.features);
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
    image: product.images?.[0]?.url || "/hero-product.png", // fallback for older components
    description: product.description,
    rating: product.rating,
    reviewCount: product.reviewCount,
    sku: product.sku,
    stock: product.stock,
    specs,
    features,
  };

  return (
    <>
      <Navbar />
      <ProductClient product={formattedProduct} />
      <Footer />
    </>
  );
}
