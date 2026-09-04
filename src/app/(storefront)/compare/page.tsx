import React from "react";
import { prisma } from "@/lib/prisma";
import { ServerNavbar as Navbar } from "@/shared/components/layout/ServerNavbar";
import { Footer } from "@/shared/components/layout/footer";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, Minus } from "lucide-react";
import { ProductImageService } from "@/modules/commerce/services/ProductImageService";
import { StorefrontProductQueryService } from "@/modules/commerce/application/queries/StorefrontProductQueryService";

export const dynamic = "force-dynamic";

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const idsParam = typeof resolvedParams.ids === 'string' ? resolvedParams.ids : "";
  const ids = idsParam.split(',').filter(Boolean);

  if (ids.length === 0) {
    return (
      <main className="min-h-screen bg-black flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center pt-32">
          <h1 className="text-3xl font-bold text-white mb-4">No Products Selected</h1>
          <p className="text-slate-300 mb-8">You haven't selected any products to compare.</p>
          <Link href="/store" className="px-6 py-3 bg-cta-primary text-white rounded-xl font-medium hover:bg-orange- transition-colors">
            Return to Store
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const products = await StorefrontProductQueryService.getCompareProductsByIds(ids);

  // Sort them to match the URL order
  products.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));

  // Extract all unique spec keys across all selected products
  const allSpecKeys = new Set<string>();
  const parsedSpecsMap: Record<string, Record<string, string>> = {};

  products.forEach(p => {
    try {
      const specs = p.specs ? (typeof p.specs === 'string' ? JSON.parse(p.specs) : p.specs) as Record<string, string> : {};
      parsedSpecsMap[p.id] = specs;
      Object.keys(specs).forEach(k => allSpecKeys.add(k));
    } catch {
      parsedSpecsMap[p.id] = {};
    }
  });

  const specKeysArray = Array.from(allSpecKeys);

  return (
    <main className="min-h-screen bg-black flex flex-col pt-32 pb-24">
      <Navbar />
      
      <div className="container mx-auto px-6 max-w-7xl flex-1">
        <div className="mb-12">
          <Link href="/store" className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Compare Products</h1>
          <p className="text-slate-300">Side-by-side analysis of your selected items.</p>
        </div>

        <div className="overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <div className="min-w-[800px]">
            {/* Header Row (Images & Names) */}
            <div className="flex">
              <div className="w-48 flex-shrink-0 p-4 border-b border-white/10"></div>
              {products.map(p => (
                <div key={p.id} className="flex-1 min-w-[250px] p-4 border-b border-l border-white/10 flex flex-col items-center text-center">
                  <div className="relative w-40 h-40 rounded-xl bg-white/5 border border-white/10 p-4 mb-4">
                    <Image src={p.image} alt={p.name} fill className="object-contain" />
                  </div>
                  <p className="text-xs text-slate-300 uppercase tracking-wider mb-1">{p.brand}</p>
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{p.name}</h3>
                  <p className="text-2xl font-bold text-amber-500 mb-4">
                    ${p.salePrice ? p.salePrice.toFixed(2) : p.price.toFixed(2)}
                  </p>
                  <Link href={`/product/${p.id}`} className="px-6 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-cta-primary hover:border-cta-primary transition-colors text-sm font-medium w-full">
                    View Details
                  </Link>
                </div>
              ))}
            </div>

            {/* Basic Info */}
            <div className="flex bg-white/5">
              <div className="w-48 flex-shrink-0 p-4 font-bold text-white border-b border-white/10">Rating</div>
              {products.map(p => (
                <div key={p.id} className="flex-1 min-w-[250px] p-4 border-b border-l border-white/10 text-center text-slate-300 flex items-center justify-center gap-1">
                  <span className="text-white font-bold">{p.rating}</span> / 5.0 ({p.reviewCount})
                </div>
              ))}
            </div>
            <div className="flex">
              <div className="w-48 flex-shrink-0 p-4 font-bold text-white border-b border-white/10">Category</div>
              {products.map(p => (
                <div key={p.id} className="flex-1 min-w-[250px] p-4 border-b border-l border-white/10 text-center text-slate-300">
                  {p.category}
                </div>
              ))}
            </div>
            <div className="flex bg-white/5">
              <div className="w-48 flex-shrink-0 p-4 font-bold text-white border-b border-white/10">Availability</div>
              {products.map(p => (
                <div key={p.id} className="flex-1 min-w-[250px] p-4 border-b border-l border-white/10 text-center">
                  {p.inStock ? (
                    <span className="text-green-400 flex items-center justify-center gap-1 text-sm"><Check className="w-4 h-4"/> In Stock</span>
                  ) : (
                    <span className="text-red-400 text-sm">Out of Stock</span>
                  )}
                </div>
              ))}
            </div>

            {/* Dynamic Specs */}
            {specKeysArray.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-bold text-white mb-4">Technical Specifications</h3>
                {specKeysArray.map((specKey, index) => (
                  <div key={specKey} className={`flex ${index % 2 === 0 ? 'bg-white/5' : ''}`}>
                    <div className="w-48 flex-shrink-0 p-4 font-bold text-white border-b border-white/10">{specKey}</div>
                    {products.map(p => {
                      const val = parsedSpecsMap[p.id][specKey];
                      return (
                        <div key={p.id} className="flex-1 min-w-[250px] p-4 border-b border-l border-white/10 text-center text-slate-300 text-sm">
                          {val || <Minus className="w-4 h-4 mx-auto opacity-30" />}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
