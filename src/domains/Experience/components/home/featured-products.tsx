import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

type ProductData = {
  id: string;
  name: string;
  price: number;
  salePrice: number | null;
  image: string;
  category: string;
  rating: number;
};

export function FeaturedProducts({ products }: { products: ProductData[] }) {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-24 bg-[var(--surface)]">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 border-b border-[var(--glass-border)] pb-6">
          <div>
            <h2 className="text-3xl font-bold text-[var(--foreground)] mb-2">Featured Products</h2>
            <p className="text-[var(--color-muted)]">Hand-selected items representing the pinnacle of quality.</p>
          </div>
          <Link href="/store" className="mt-4 md:mt-0 px-6 py-2 rounded-[var(--radius-button)] border border-[var(--glass-border)] hover:bg-[var(--glass-border)] transition-colors text-[var(--foreground)] font-medium">
            Shop Collection
          </Link>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-[var(--color-slate)] scrollbar-track-transparent">
          {products.map((p) => (
            <Link href={`/product/${p.id}`} key={p.id} className="snap-start min-w-[300px] md:min-w-[350px] group flex-shrink-0">
              <div className="glass-panel p-4 border border-[var(--glass-border)] rounded-[var(--radius-card)] h-full flex flex-col transition-all hover:border-[var(--color-slate)] hover:shadow-[var(--shadow-glow-secondary)] bg-[var(--background)]">
                <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-white/5 mb-4">
                  <Image 
                    src={p.image} 
                    alt={p.name} 
                    fill 
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-500" 
                  />
                  {p.salePrice && (
                    <div className="absolute top-3 left-3 bg-[var(--color-accent)] text-white text-xs font-bold px-2 py-1 rounded">
                      SALE
                    </div>
                  )}
                </div>
                <div className="flex flex-col flex-grow justify-between">
                  <div>
                    <p className="text-[var(--color-muted)] text-xs uppercase tracking-wider mb-1">{p.category}</p>
                    <h3 className="text-[var(--foreground)] font-semibold text-lg line-clamp-2 mb-2">{p.name}</h3>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-end gap-2">
                      <span className="text-xl font-bold text-[var(--foreground)]">
                        ${p.salePrice ? p.salePrice.toFixed(2) : p.price.toFixed(2)}
                      </span>
                      {p.salePrice && (
                        <span className="text-sm text-[var(--color-muted)] line-through mb-0.5">
                          ${p.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[var(--color-accent)] text-sm font-medium">
                      <Star className="w-4 h-4 fill-current" /> {p.rating}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}