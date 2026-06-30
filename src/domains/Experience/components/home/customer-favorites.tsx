import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Quote } from "lucide-react";

export function CustomerFavorites() {
  const favorites = [
    {
      id: "fav-1",
      quote: "The attention to detail is remarkable. Nova Sphere curated exactly what I was looking for.",
      customer: "Elena R.",
      role: "Verified Buyer",
      productName: "Astro A50 Wireless",
      productImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
      link: "/store"
    },
    {
      id: "fav-2",
      quote: "My new centerpiece. The delivery was fast, secure, and the item exceeded expectations.",
      customer: "Marcus T.",
      role: "Verified Buyer",
      productName: "Modern Abstract Canvas",
      productImage: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&q=80",
      link: "/store"
    },
    {
      id: "fav-3",
      quote: "A flawless experience from start to finish. This is how e-commerce should feel.",
      customer: "Sarah W.",
      role: "Verified Buyer",
      productName: "Smart Watch Elite",
      productImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
      link: "/store"
    }
  ];

  return (
    <section className="py-24 bg-[var(--background)]">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-4">Customer Favorites</h2>
          <p className="text-[var(--color-muted)] max-w-2xl mx-auto text-lg">
            Real feedback from our global community of collectors and professionals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {favorites.map((fav) => (
            <div key={fav.id} className="glass-panel p-8 rounded-[var(--radius-card)] border border-[var(--glass-border)] flex flex-col justify-between">
              <div>
                <Quote className="w-8 h-8 text-[var(--color-primary)] opacity-50 mb-6" />
                <p className="text-lg text-[var(--foreground)] leading-relaxed font-medium mb-8">
                  "{fav.quote}"
                </p>
              </div>
              
              <div className="flex items-center gap-4 border-t border-[var(--glass-border)] pt-6 mt-auto">
                <Link href={fav.link} className="relative w-14 h-14 rounded-full overflow-hidden border border-[var(--glass-border)] bg-white/5 flex-shrink-0 hover:scale-105 transition-transform">
                  <Image 
                    src={fav.productImage} 
                    alt={fav.productName} 
                    fill 
                    className="object-cover" 
                  />
                </Link>
                <div>
                  <p className="text-[var(--foreground)] font-bold">{fav.customer}</p>
                  <p className="text-[var(--color-muted)] text-sm">{fav.role} • {fav.productName}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}