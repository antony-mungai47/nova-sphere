import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductClient } from "./product-client";
import { notFound } from "next/navigation";
import { getFeatureFlag } from "@/domains/Foundation/feature-flags/actions";
import { FeatureFlags } from "@/domains/Foundation/feature-flags/flags";
import { ServerNavbar as Navbar } from "@/shared/components/layout/ServerNavbar";
import { Footer } from "@/shared/components/layout/footer";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await prisma.product.findUnique({
    where: { id: resolvedParams.id },
    include: { images: true }
  });

  if (!product) {
    return { title: "Product Not Found" };
  }

  const primaryImage = product.images?.[0]?.url || "/hero-product.png";
  const title = `${product.name} | Nova Sphere`;

  return {
    title,
    description: product.description.slice(0, 160),
    openGraph: {
      title,
      description: product.description.slice(0, 160),
      images: [{ url: primaryImage }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: product.description.slice(0, 160),
      images: [primaryImage],
    }
  };
}

export const revalidate = 3600; // ISR revalidate every hour
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
    price: product.price.toNumber(),
    salePrice: product.salePrice ? product.salePrice.toNumber() : null,
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
    price: rp.price.toNumber(),
    salePrice: rp.salePrice ? rp.salePrice.toNumber() : null,
    category: rp.category,
    image: rp.images?.[0]?.url || "/hero-product.png",
    rating: rp.rating,
  }));

  const liveInventoryEnabled = await getFeatureFlag(FeatureFlags.LIVE_INVENTORY);

  // Generate JSON-LD Schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: formattedProduct.name,
    image: formattedProduct.images,
    description: formattedProduct.description,
    sku: formattedProduct.sku,
    brand: {
      '@type': 'Brand',
      name: formattedProduct.brand,
    },
    offers: {
      '@type': 'Offer',
      url: `https://nova-sphere.com/product/${formattedProduct.id}`,
      priceCurrency: 'USD',
      price: formattedProduct.salePrice || formattedProduct.price,
      itemCondition: 'https://schema.org/NewCondition',
      availability: formattedProduct.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    ...(formattedProduct.reviewCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: formattedProduct.rating,
        reviewCount: formattedProduct.reviewCount,
      },
    }),
  };

  return (
    <>
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductClient 
        product={formattedProduct} 
        relatedProducts={relatedProducts} 
        liveInventoryEnabled={liveInventoryEnabled} 
      />
      <Footer />
    </>
  );
}
