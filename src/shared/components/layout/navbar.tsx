"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingCart, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";
import { CartSidebar } from "@/domains/Commerce/checkout/components/cart/cart-sidebar";
import { MegaMenu } from "@/shared/components/layout/mega-menu";
import { Show, UserButton, useAuth } from "@clerk/nextjs";
import { NotificationCenter } from "@/domains/Engagement/Notifications/components/NotificationCenter";

export function Navbar({ liveNotificationsEnabled = false }: { liveNotificationsEnabled?: boolean }) {
  const { userId } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  const { items } = useCartStore();
  const [mounted, setMounted] = useState(false);
  
  const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled ? "glass-panel py-4" : "bg-transparent py-6"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative w-10 h-10 group-hover:scale-105 transition-transform">
              <Image 
                src="/logo.png" 
                alt="Nova Sphere Logo" 
                fill 
                className="object-contain" 
                priority
              />
            </div>
            <span className="text-xl font-bold tracking-widest text-white">NOVA<span className="text-nova-blue">SPHERE</span></span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/store" className="text-sm font-medium text-white/70 hover:text-white transition-colors relative group">
              Store
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-nova-blue transition-all group-hover:w-full" />
            </Link>
            
            <MegaMenu />
            
            <Link href="/store?trending=true" className="text-sm font-medium text-white/70 hover:text-white transition-colors relative group">
              Trending
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-nova-blue transition-all group-hover:w-full" />
            </Link>
            <Link href="/about" className="text-sm font-medium text-white/70 hover:text-white transition-colors relative group">
              About
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-nova-blue transition-all group-hover:w-full" />
            </Link>
            <Show when="signed-in">
              <Link href="/account" className="text-sm font-medium text-nova-blue hover:text-white transition-colors relative group">
                Account
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-nova-amber transition-all group-hover:w-full" />
              </Link>
              <Link href="/admin" className="text-sm font-medium text-nova-emerald hover:text-white transition-colors relative group">
                Admin
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-nova-emerald transition-all group-hover:w-full" />
              </Link>
            </Show>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-6">
              <div className="relative group/search">
                <div className="flex items-center bg-white/5 border border-white/10 rounded-full px-3 py-1.5 focus-within:bg-white/10 focus-within:border-nova-blue/50 transition-all">
                  <Search className="w-4 h-4 text-white/50" />
                  <input 
                    type="text" 
                    placeholder="Search products..." 
                    className="bg-transparent border-none text-sm text-white placeholder-white/40 focus:outline-none w-32 focus:w-48 transition-all ml-2"
                    value={searchQuery}
                    onChange={async (e) => {
                      const val = e.target.value;
                      setSearchQuery(val);
                      if (val.length < 2) {
                        setShowResults(false);
                        return;
                      }
                      try {
                        const res = await fetch(`/api/search?q=${encodeURIComponent(val)}`);
                        const data = await res.json();
                        setSearchResults(data.results);
                        setShowResults(true);
                      } catch(e) {}
                    }}
                    onFocus={() => {
                      if (searchQuery.length >= 2) setShowResults(true);
                    }}
                    onBlur={() => {
                      // Small delay to allow clicking results
                      setTimeout(() => setShowResults(false), 200);
                    }}
                  />
                </div>
                
                {showResults && (
                  <div className="absolute top-full right-0 mt-2 w-72 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50">
                    <div className="max-h-96 overflow-y-auto">
                      {searchResults.length === 0 ? (
                        <div className="p-4 text-sm text-nova-silver">No results found.</div>
                      ) : (
                        searchResults.map((p) => (
                          <Link 
                            key={p.id} 
                            href={`/product/${p.id}`}
                            className="flex items-center gap-3 p-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                          >
                            <img src={p.image} alt={p.name} className="w-10 h-10 rounded bg-white/5 object-cover" />
                            <div>
                              <p className="text-white text-sm font-medium line-clamp-1">{p.name}</p>
                              <p className="text-nova-blue text-xs">${p.price.toFixed(2)}</p>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            
            <div className="flex items-center space-x-4">
              <Show when="signed-out">
                <Link href="/login" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link href="/register" className="text-sm font-medium text-white bg-nova-blue hover:bg-nova-blue/80 px-4 py-2 rounded-full transition-colors shadow-glow-primary">
                  Sign Up
                </Link>
              </Show>
              <Show when="signed-in">
                <NotificationCenter userId={userId ?? null} enabled={liveNotificationsEnabled} />
                <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
              </Show>
            </div>

            <button 
              onClick={() => setCartOpen(true)}
              className="text-white/70 hover:text-white transition-colors relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {mounted && cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-nova-amber text-xs text-white font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden glass-panel border-t border-white/10 mt-4 overflow-hidden"
            >
              <div className="flex flex-col px-6 py-4 space-y-4">
                {["Store", "Categories", "Trending", "About"].map((item) => (
                  <Link key={item} href={`/${item.toLowerCase()}`} className="text-white/80 font-medium hover:text-nova-blue transition-colors">
                    {item}
                  </Link>
                ))}
                <Show when="signed-in">
                  <Link href="/account" className="text-nova-blue font-medium hover:text-white transition-colors">
                    Account
                  </Link>
                  <Link href="/admin" className="text-nova-emerald font-medium hover:text-white transition-colors">
                    Admin Portal
                  </Link>
                </Show>
                <div className="flex items-center space-x-6 pt-4 border-t border-white/10">
                  <div className="flex items-center space-x-4">
                    <Show when="signed-out">
                      <Link href="/login" className="text-white/70 hover:text-white transition-colors font-medium">
                        Sign In
                      </Link>
                      <Link href="/register" className="text-sm font-medium text-white bg-nova-blue hover:bg-nova-blue/80 px-4 py-2 rounded-full transition-colors">
                        Sign Up
                      </Link>
                    </Show>
                    <Show when="signed-in">
                      <NotificationCenter userId={userId ?? null} enabled={liveNotificationsEnabled} />
                      <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
                    </Show>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setCartOpen(true);
                    }}
                    className="text-white/70 hover:text-white transition-colors flex items-center space-x-2 relative"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Cart {mounted && cartItemCount > 0 && `(${cartItemCount})`}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

