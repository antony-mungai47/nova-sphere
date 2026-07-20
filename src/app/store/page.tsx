import React from "react";
import { prisma } from "@/lib/prisma";
import { ServerNavbar as Navbar } from "@/shared/components/layout/ServerNavbar";
import { Footer } from "@/shared/components/layout/footer";
import { ProductGrid } from "@/domains/Commerce/products/components/store/product-grid";
import { ProductGridV3 } from "@/domains/Commerce/products/components/store/v3-product-grid";
import { getFeatureFlag } from "@/domains/Foundation/feature-flags/actions";
import { FeatureFlags } from "@/domains/Foundation/feature-flags/flags";

export const revalidate = 3600; // ISR revalidate every hour
export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const query = typeof resolvedParams.q === 'string' ? resolvedParams.q : undefined;
  const category = typeof resolvedParams.category === 'string' ? resolvedParams.category : undefined;
  const brand = typeof resolvedParams.brand === 'string' ? resolvedParams.brand : undefined;
  const minPrice = typeof resolvedParams.minPrice === 'string' ? parseFloat(resolvedParams.minPrice) : undefined;
  const maxPrice = typeof resolvedParams.maxPrice === 'string' ? parseFloat(resolvedParams.maxPrice) : undefined;
  const sort = typeof resolvedParams.sort === 'string' ? resolvedParams.sort : 'newest';

  const useV3PDP = await getFeatureFlag(FeatureFlags.PDP_V3);

  // Build Prisma where clause
  const where: any = {};
  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ];
  }
  if (category && category !== 'All') where.category = category;
  if (brand && brand !== 'All') where.brand = brand;
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  // Build Prisma orderBy
  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'price-low') orderBy = { price: 'asc' };
  if (sort === 'price-high') orderBy = { price: 'desc' };
  if (sort === 'rating') orderBy = { rating: 'desc' };

  // Run Queries in parallel: filtered products, and aggregations for the filter sidebar
  const [products, allCategories, allBrands] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      include: { images: true },
    }),
    prisma.product.findMany({ select: { category: true }, distinct: ['category'] }),
    prisma.product.findMany({ select: { brand: true }, distinct: ['brand'] }),
  ]);

  const uniqueCategories = ['All', ...allCategories.map(c => c.category)];
  const uniqueBrands = ['All', ...allBrands.map(b => b.brand)];

  const formattedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price.toNumber(),
    category: p.category,
    brand: p.brand,
    image: p.images[0]?.url || "/hero-product.png",
    description: p.description,
    salePrice: p.salePrice ? p.salePrice.toNumber() : null,
    rating: p.rating,
    reviewCount: p.reviewCount,
  }));

  return (
    <main className="min-h-screen flex flex-col bg-black">
      <Navbar />
      
      {/* Header Section */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-nova-blue/10 rounded-full blur-[150px] -z-10 pointer-events-none" />
        
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-nova-blue to-nova-amber">Store</span>
          </h1>
          <p className="text-xl text-nova-silver max-w-2xl mx-auto">
            Browse our entire collection of next-generation technology. Your future starts here.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="flex-1 pb-24">
        <div className="container mx-auto px-6">
          {useV3PDP ? (
            <ProductGridV3 
              initialProducts={formattedProducts} 
              uniqueCategories={uniqueCategories} 
              uniqueBrands={uniqueBrands} 
            />
          ) : (
            <ProductGrid 
              initialProducts={formattedProducts} 
              uniqueCategories={uniqueCategories} 
              uniqueBrands={uniqueBrands} 
            />
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
