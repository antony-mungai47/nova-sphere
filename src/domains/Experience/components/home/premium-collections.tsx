import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const COLLECTIONS = [
  {
    id: "tech",
    title: "Consumer Technology",
    span: "md:col-span-2 md:row-span-2",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80",
    link: "/store?category=Electronics"
  },
  {
    id: "fashion",
    title: "Premium Fashion",
    span: "md:col-span-1 md:row-span-1",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    link: "/store?category=Fashion"
  },
  {
    id: "home",
    title: "Modern Living",
    span: "md:col-span-1 md:row-span-1",
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80",
    link: "/store?category=Home"
  }
];

export function PremiumCollections() {
  return (
    <section className="py-24 bg-[var(--background)]">
      <div className="container mx-auto px-6">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-[var(--foreground)] mb-2">Premium Collections</h2>
            <p className="text-[var(--color-muted)]">Curated categories for the modern executive.</p>
          </div>
          <Link href="/store" className="hidden sm:flex items-center gap-2 text-[var(--color-primary)] hover:underline font-medium">
            View All Categories <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
          {COLLECTIONS.map((c) => (
            <Link 
              href={c.link} 
              key={c.id}
              className={`group relative rounded-[var(--radius-card)] overflow-hidden glass-panel border border-[var(--glass-border)] ${c.span}`}
            >
              <Image 
                src={c.image} 
                alt={c.title} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white tracking-wide">{c.title}</h3>
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                  <ArrowUpRight className="w-5 h-5 text-white" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}