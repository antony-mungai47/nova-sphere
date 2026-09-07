import React from "react";
import { ProductCarousel } from "@/components/ui/ProductCarousel";
import { CategoryCard } from "@/components/ui/CategoryCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/ui/ProductCard";

export function TrendingCategories() {
  const categories = [
    { title: "Electronics", count: 4200, icon: "🔌", bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-500" },
    { title: "Fashion", count: 8100, icon: "👗", bg: "bg-pink-500/10", border: "border-pink-500/20", text: "text-pink-500" },
    { title: "Home & Garden", count: 3200, icon: "🪴", bg: "bg-green-500/10", border: "border-green-500/20", text: "text-green-500" },
    { title: "Groceries", count: 1200, icon: "🛒", bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-500" },
  ];

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">Trending Categories</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <a href={`/store?category=${cat.title}`} key={i} className="group relative h-48 block">
              <div className={`absolute inset-0 rounded-3xl ${cat.bg} blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className={`glass-panel border ${cat.border} h-full rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl bg-background/50 backdrop-blur-md border ${cat.border}`}>
                  {cat.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-white transition-colors">{cat.title}</h3>
                  <p className={`text-sm font-medium ${cat.text}`}>{cat.count.toLocaleString()} Products</p>
                </div>
                <div className="absolute top-6 right-6 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${cat.bg} ${cat.text}`}>
                    →
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FlashDealsCarousel({ products = [] }: { products?: any[] }) {
  const items = products.map((p, i) => (
    <ProductCard 
      key={p.id || i}
      id={p.id}
      name={p.name}
      price={p.price}
      salePrice={p.salePrice}
      image={p.images?.[0] || p.image || "/placeholder.png"}
      images={p.images || [p.image || "/placeholder.png"]}
      category={p.category}
      brand={p.brand}
      rating={p.rating}
      reviewCount={p.reviewCount}
    />
  ));

  if (!items.length) return null;

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <ProductCarousel title="⚡ Flash Deals" items={items} animationMode="slide-right" />
      </div>
    </section>
  );
}

export function RecommendedProducts({ products = [] }: { products?: any[] }) {
  const items = products.map((p, i) => (
    <ProductCard 
      key={p.id || i}
      id={p.id}
      name={p.name}
      price={p.price}
      salePrice={p.salePrice}
      image={p.images?.[0] || p.image || "/placeholder.png"}
      images={p.images || [p.image || "/placeholder.png"]}
      category={p.category}
      brand={p.brand}
      rating={p.rating}
      reviewCount={p.reviewCount}
    />
  ));

  if (!items.length) return null;

  return (
    <section className="py-24 bg-surface border-y border-border">
      <div className="container mx-auto px-6">
        <ProductCarousel title="⭐ Recommended For You" items={items} animationMode="pause-on-hover" />
      </div>
    </section>
  );
}

export function BestSellers({ products = [] }: { products?: any[] }) {
  const items = products.map((p, i) => (
    <ProductCard 
      key={p.id || i}
      id={p.id}
      name={p.name}
      price={p.price}
      salePrice={p.salePrice}
      image={p.images?.[0] || p.image || "/placeholder.png"}
      images={p.images || [p.image || "/placeholder.png"]}
      category={p.category}
      brand={p.brand}
      rating={p.rating}
      reviewCount={p.reviewCount}
    />
  ));

  if (!items.length) return null;

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <ProductCarousel title="💎 Best Sellers" items={items} animationMode="marquee" />
      </div>
    </section>
  );
}

export function NewArrivals({ products = [] }: { products?: any[] }) {
  const items = products.map((p, i) => (
    <ProductCard 
      key={p.id || i}
      id={p.id}
      name={p.name}
      price={p.price}
      salePrice={p.salePrice}
      image={p.images?.[0] || p.image || "/placeholder.png"}
      images={p.images || [p.image || "/placeholder.png"]}
      category={p.category}
      brand={p.brand}
      rating={p.rating}
      reviewCount={p.reviewCount}
    />
  ));

  if (!items.length) return null;

  return (
    <section className="py-24 bg-surface border-y border-border">
      <div className="container mx-auto px-6">
        <ProductCarousel title="✨ New Arrivals" items={items} animationMode="slide-left" />
      </div>
    </section>
  );
}

export function FeaturedVendors() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-heading font-bold text-foreground mb-12">Featured Vendors</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} hoverable className="h-48 flex items-center justify-center p-6 text-center">
              <div>
                <div className="w-16 h-16 bg-muted/10 rounded-full mx-auto mb-4" />
                <h4 className="font-heading font-semibold text-foreground">Vendor {i+1}</h4>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WhyShopNova() {
  return (
    <section className="py-24 bg-surface border-y border-border">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-heading font-bold text-foreground mb-12 text-center">Why Shop Nova Sphere?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="text-center p-6">
             <div className="text-4xl mb-4">🚀</div>
             <h3 className="font-bold text-lg mb-2">Fastest Delivery</h3>
             <p className="text-muted text-sm">Next-day delivery on over 10,000 items.</p>
           </div>
           <div className="text-center p-6">
             <div className="text-4xl mb-4">🛡️</div>
             <h3 className="font-bold text-lg mb-2">Secure Payments</h3>
             <p className="text-muted text-sm">Bank-level encryption for all transactions.</p>
           </div>
           <div className="text-center p-6">
             <div className="text-4xl mb-4">⭐</div>
             <h3 className="font-bold text-lg mb-2">Verified Reviews</h3>
             <p className="text-muted text-sm">Real reviews from real buyers, always.</p>
           </div>
        </div>
      </div>
    </section>
  );
}

export function CustomerReviews() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-heading font-bold text-foreground mb-12">Customer Reviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-6">
              <div className="flex text-warning mb-4">{"⭐".repeat(5)}</div>
              <p className="text-muted mb-4">"The fastest and most reliable marketplace I have ever used. Highly recommend!"</p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-muted/20 rounded-full" />
                <div>
                  <p className="font-medium text-foreground text-sm">Customer {i+1}</p>
                  <p className="text-xs text-muted">Verified Buyer</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DownloadAppBanner() {
  return (
    <section className="py-24 bg-cta-primary text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-cta-primary to-cta-secondary opacity-50" />
      <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center justify-between">
        <div className="mb-8 md:mb-0 max-w-xl">
          <h2 className="text-4xl font-heading font-bold mb-4">Shop Faster on the Nova App</h2>
          <p className="text-lg opacity-90 mb-8">Get exclusive mobile-only deals and real-time delivery tracking.</p>
          <div className="flex space-x-4">
            <Button variant="secondary" size="lg" className="bg-white text-cta-primary hover:bg-white/90">
              Download for iOS
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              Download for Android
            </Button>
          </div>
        </div>
        <div className="w-64 h-64 bg-white/10 rounded-3xl backdrop-blur-md border border-white/20 flex items-center justify-center transform rotate-12 shadow-2xl">
          <span className="text-6xl text-white">📱</span>
        </div>
      </div>
    </section>
  );
}
