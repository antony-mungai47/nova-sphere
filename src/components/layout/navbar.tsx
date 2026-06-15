"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ShoppingCart, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";
import { CartSidebar } from "@/components/cart/cart-sidebar";
import { MegaMenu } from "@/components/layout/mega-menu";
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  
  const { items } = useCartStore();
  const [mounted, setMounted] = useState(false);
  
  const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
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
            <div className="w-8 h-8 rounded-full bg-nova-blue shadow-[0_0_15px_rgba(59,130,246,0.6)] flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-white font-bold text-lg">N</span>
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
                  onChange={async (e) => {
                    const val = e.target.value;
                    if (val.length < 2) {
                      const el = document.getElementById('search-results');
                      if(el) el.style.display = 'none';
                      return;
                    }
                    try {
                      const res = await fetch(`/api/search?q=${encodeURIComponent(val)}`);
                      const data = await res.json();
                      const el = document.getElementById('search-results');
                      const list = document.getElementById('search-results-list');
                      if (el && list) {
                        el.style.display = 'block';
                        list.innerHTML = '';
                        if (data.results.length === 0) {
                          list.innerHTML = '<div class="p-4 text-sm text-nova-silver">No results found.</div>';
                        } else {
                          data.results.forEach((p: any) => {
                            const item = document.createElement('a');
                            item.href = '/product/' + p.id;
                            item.className = 'flex items-center gap-3 p-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0';
                            item.innerHTML = `
                              <img src="${p.image}" class="w-10 h-10 rounded bg-white/5 object-cover" />
                              <div>
                                <p class="text-white text-sm font-medium line-clamp-1">${p.name}</p>
                                <p class="text-nova-blue text-xs">$${p.price.toFixed(2)}</p>
                              </div>
                            `;
                            list.appendChild(item);
                          });
                        }
                      }
                    } catch(e) {}
                  }}
                />
              </div>
              
              <div id="search-results" className="absolute top-full right-0 mt-2 w-72 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50">
                <div id="search-results-list" className="max-h-96 overflow-y-auto"></div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button className="text-sm font-medium text-white/70 hover:text-white transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="text-sm font-medium text-white bg-nova-blue hover:bg-nova-blue/80 px-4 py-2 rounded-full transition-colors shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                    Sign Up
                  </button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
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
                </Show>
                <div className="flex items-center space-x-6 pt-4 border-t border-white/10">
                  <div className="flex items-center space-x-4">
                    <Show when="signed-out">
                      <SignInButton mode="modal">
                        <button className="text-white/70 hover:text-white transition-colors font-medium">Sign In</button>
                      </SignInButton>
                      <SignUpButton mode="modal">
                        <button className="text-sm font-medium text-white bg-nova-blue hover:bg-nova-blue/80 px-4 py-2 rounded-full transition-colors">
                          Sign Up
                        </button>
                      </SignUpButton>
                    </Show>
                    <Show when="signed-in">
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

