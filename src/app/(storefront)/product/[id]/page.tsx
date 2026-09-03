import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductClient } from "./product-client";
import { ProductClientV3 } from "./v3-product-client";
import { notFound } from "next/navigation";
import { getFeatureFlag } from "@/domains/Foundation/feature-flags/actions";
import { FeatureFlags } from "@/domains/Foundation/feature-flags/flags";
import { ServerNavbar as Navbar } from "@/shared/components/layout/ServerNavbar";
import { Footer } from "@/shared/components/layout/footer";
import { ProductImageService } from "@/modules/commerce/services/ProductImageService";
import { StorefrontProductQueryService } from "@/modules/commerce/application/queries/StorefrontProductQueryService";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await StorefrontProductQueryService.getProductDetail(resolvedParams.id);

  if (!product) {
    return { title: "Product Not Found" };
  }

  const primaryImage = product.images[0] || "";
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
  
  const product = await StorefrontProductQueryService.getProductDetail(resolvedParams.id);

  if (!product) {
    notFound();
  }

  const relatedProducts = await StorefrontProductQueryService.getRelatedProducts(product.category, product.id);

  const liveInventoryEnabled = await getFeatureFlag(FeatureFlags.LIVE_INVENTORY);

  // Generate JSON-LD Schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    offers: {
      '@type': 'Offer',
      url: `https://nova-sphere.com/product/${product.id}`,
      priceCurrency: 'USD',
      price: product.salePrice || product.price,
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    ...(product.reviewCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviewCount,
      },
    }),
  };

  const useV3PDP = await getFeatureFlag(FeatureFlags.PDP_V3);

  return (
    <>
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {useV3PDP ? (
        <ProductClientV3 
          product={product} 
          relatedProducts={relatedProducts} 
          liveInventoryEnabled={liveInventoryEnabled} 
        />
      ) : (
        <ProductClient 
          product={product} 
          relatedProducts={relatedProducts} 
          liveInventoryEnabled={liveInventoryEnabled} 
        />
      )}
      <Footer />
    </>
  );
}
