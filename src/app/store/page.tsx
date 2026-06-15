import React from "react";
import { PrismaClient } from "@prisma/client";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ProductGrid } from "@/components/store/product-grid";

const prisma = new PrismaClient();

export default async function StorePage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { images: true }
  });

  const formattedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    category: p.category,
    brand: p.brand,
    image: p.images[0]?.url || "/hero-product.png",
    description: p.description,
    salePrice: p.salePrice,
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
          <ProductGrid initialProducts={formattedProducts} />
        </div>
      </section>

      <Footer />
    </main>
  );
}
