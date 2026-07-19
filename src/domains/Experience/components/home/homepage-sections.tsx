import React from "react";
import { ProductCarousel } from "@/components/ui/ProductCarousel";
import { CategoryCard } from "@/components/ui/CategoryCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/ui/ProductCard";

export function TrendingCategories() {
  const categories = [
    { title: "Electronics", count: 4200, icon: "💻", color: "bg-cat-electronics" },
    { title: "Fashion", count: 8100, icon: "👗", color: "bg-cat-fashion" },
    { title: "Home & Garden", count: 3200, icon: "🪴", color: "bg-cat-home" },
    { title: "Groceries", count: 1200, icon: "🍎", color: "bg-cat-groceries" },
  ];

  return (
    <section className="py-24 bg-surface border-y border-border">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-heading font-bold text-foreground mb-12">Trending Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <CategoryCard 
              key={i}
              title={cat.title}
              productCount={cat.count}
              icon={cat.icon}
              accentColorClass={cat.color}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function FlashDealsCarousel() {
  const items = Array.from({ length: 8 }).map((_, i) => (
    <ProductCard 
      key={i}
      id={`flash-${i}`}
      name={`Premium Smart Watch Series ${i + 1}`}
      price={299.99}
      salePrice={149.99}
      image="/hero-product.png"
      category="Electronics"
      brand="NovaTech"
      rating={4.8}
      reviewCount={124}
    />
  ));

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <ProductCarousel title="⚡ Flash Deals" items={items} animationMode="slide-right" />
      </div>
    </section>
  );
}

export function RecommendedProducts() {
  const items = Array.from({ length: 8 }).map((_, i) => (
    <ProductCard 
      key={i}
      id={`rec-${i}`}
      name={`Wireless Noise-Cancelling Headphones ${i + 1}`}
      price={199.99}
      image="/hero-product.png"
      category="Audio"
      brand="SoundMax"
      rating={4.5}
      reviewCount={89}
    />
  ));

  return (
    <section className="py-24 bg-surface border-y border-border">
      <div className="container mx-auto px-6">
        <ProductCarousel title="Recommended For You" items={items} animationMode="pause-on-hover" />
      </div>
    </section>
  );
}

export function BestSellers() {
  const items = Array.from({ length: 8 }).map((_, i) => (
    <ProductCard 
      key={i}
      id={`best-${i}`}
      name={`Ergonomic Office Chair Model ${i + 1}`}
      price={349.99}
      salePrice={299.99}
      image="/hero-product.png"
      category="Furniture"
      brand="ErgoFit"
      rating={4.9}
      reviewCount={312}
    />
  ));

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <ProductCarousel title="🔥 Best Sellers" items={items} animationMode="marquee" />
      </div>
    </section>
  );
}

export function NewArrivals() {
  const items = Array.from({ length: 8 }).map((_, i) => (
    <ProductCard 
      key={i}
      id={`new-${i}`}
      name={`Next-Gen Gaming Console ${i + 1}`}
      price={499.99}
      image="/hero-product.png"
      category="Gaming"
      brand="PlayTech"
      rating={5.0}
      reviewCount={12}
    />
  ));

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
      <div className="absolute inset-0 bg-gradient-to-r from-cta-primary to-cta-secondary opacity-50 mix-blend-multiply" />
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
