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
    <section className="py-12 bg-background relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex items-center justify-between mb-6">
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
      image={p.images?.[0]?.url || p.image || "/placeholder.png"}
      images={p.images?.length > 0 ? p.images.map((img: any) => img.url || img) : [p.image || "/placeholder.png"]}
      category={p.category}
      brand={p.brand}
      rating={p.rating}
      reviewCount={p.reviewCount}
    />
  ));

  if (!items.length) return null;

  return (
    <section className="py-12 bg-background">
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
      image={p.images?.[0]?.url || p.image || "/placeholder.png"}
      images={p.images?.length > 0 ? p.images.map((img: any) => img.url || img) : [p.image || "/placeholder.png"]}
      category={p.category}
      brand={p.brand}
      rating={p.rating}
      reviewCount={p.reviewCount}
    />
  ));

  if (!items.length) return null;

  return (
    <section className="py-12 bg-surface border-y border-border">
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
      image={p.images?.[0]?.url || p.image || "/placeholder.png"}
      images={p.images?.length > 0 ? p.images.map((img: any) => img.url || img) : [p.image || "/placeholder.png"]}
      category={p.category}
      brand={p.brand}
      rating={p.rating}
      reviewCount={p.reviewCount}
    />
  ));

  if (!items.length) return null;

  return (
    <section className="py-12 bg-background">
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
      image={p.images?.[0]?.url || p.image || "/placeholder.png"}
      images={p.images?.length > 0 ? p.images.map((img: any) => img.url || img) : [p.image || "/placeholder.png"]}
      category={p.category}
      brand={p.brand}
      rating={p.rating}
      reviewCount={p.reviewCount}
    />
  ));

  if (!items.length) return null;

  return (
    <section className="py-12 bg-surface border-y border-border">
      <div className="container mx-auto px-6">
        <ProductCarousel title="✨ New Arrivals" items={items} animationMode="slide-left" />
      </div>
    </section>
  );
}

export function FeaturedVendors() {
  const vendors = [
    { name: "NovaTech", category: "Electronics", image: "https://images.unsplash.com/photo-1550009158-9effb64fda70?w=100&q=80" },
    { name: "SoundMax", category: "Audio", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&q=80" },
    { name: "ErgoFit", category: "Furniture", image: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=100&q=80" },
    { name: "PlayTech", category: "Gaming", image: "https://images.unsplash.com/photo-1605901309584-818e25960b8f?w=100&q=80" }
  ];

  return (
    <section className="py-12 bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">Featured Brands</h2>
          <a href="/store" className="text-cta-primary hover:text-cta-primary/80 font-bold transition-colors">View All</a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {vendors.map((vendor, i) => (
            <a href={`/store?brand=${vendor.name}`} key={i} className="group glass-panel p-8 text-center transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] ">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full overflow-hidden border border-border shadow-soft group-hover:border-purple-500/50 transition-colors">
                <img src={vendor.image} alt={vendor.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <h4 className="font-bold text-xl text-foreground mb-1 group-hover:text-purple-400 transition-colors">{vendor.name}</h4>
              <p className="text-sm text-muted">{vendor.category}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WhyShopNova() {
  return (
    <section className="py-12 bg-surface border-y border-border">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-heading font-bold text-foreground mb-6 text-center">Why Shop Nova Sphere?</h2>
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
  const reviews = [
    { name: "Sarah Jenkins", role: "Verified Buyer", text: "The fastest and most reliable marketplace I have ever used. The glassmorphism UI is absolutely stunning and the auctions are thrilling!", rating: 5, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80" },
    { name: "Michael Chen", role: "Tech Enthusiast", text: "I managed to win an incredible auction here. The real-time bidding system and instantaneous updates make Nova Sphere the best out there.", rating: 5, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80" },
    { name: "Elena Rodriguez", role: "Verified Buyer", text: "Next-day delivery on my new workstation. The seamless integration of premium brands in one place saves me hours of searching.", rating: 5, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80" }
  ];

  return (
    <section className="py-12 bg-surface border-y border-border relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <h2 className="text-3xl md:text-5xl font-black text-foreground mb-6 text-center tracking-tight">Community <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Feedback</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, i) => (
            <div key={i} className="glass-panel p-8 relative group transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(251,191,36,0.15)]">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg className="w-16 h-16 text-amber-500" fill="currentColor" viewBox="0 0 32 32"><path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-1.1.9-2 2-2h4V8h-4zm18 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-1.1.9-2 2-2h4V8h-4z"/></svg>
              </div>
              <div className="flex text-amber-400 mb-6 gap-1">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
              </div>
              <p className="text-muted mb-8 italic relative z-10">"{review.text}"</p>
              <div className="flex items-center gap-4 border-t border-border pt-6">
                <img src={review.avatar} alt={review.name} className="w-12 h-12 rounded-full object-cover border border-border shadow-soft" />
                <div>
                  <p className="font-bold text-foreground">{review.name}</p>
                  <p className="text-xs text-cta-primary font-medium">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DownloadAppBanner() {
  return (
    <section className="py-12 bg-cta-primary text-white relative overflow-hidden">
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
        <div className="w-64 h-64 glass-panel rounded-3xl flex items-center justify-center transform rotate-12 shadow-2xl">
          <span className="text-6xl text-white">📱</span>
        </div>
      </div>
    </section>
  );
}
