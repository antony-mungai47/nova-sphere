"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Menu, X, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";
import { CartSidebar } from "@/domains/Commerce/checkout/components/cart/cart-sidebar";
import { MegaMenu } from "@/shared/components/layout/mega-menu";
import { Show, UserButton, useAuth } from "@clerk/nextjs";
import { NotificationCenter } from "@/domains/Engagement/Notifications/components/NotificationCenter";
import { Omnibar } from "@/domains/discovery/ui/Omnibar";
import { Button } from "@/components/ui/Button";

export function Navbar({ liveNotificationsEnabled = false }: { liveNotificationsEnabled?: boolean }) {
  const { userId } = useAuth();
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
          "fixed top-0 left-0 right-0 z-z-sticky transition-all duration-motion-standard",
          isScrolled ? "bg-surface/80 backdrop-blur-md border-b border-border shadow-soft py-3" : "bg-transparent py-5"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="container mx-auto px-6 flex items-center justify-between gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 shrink-0 group">
            <div className="relative w-10 h-10 group-hover:scale-105 transition-transform duration-motion-fast">
              <Image 
                src="/logo.png" 
                alt="Nova Sphere Logo" 
                fill 
                className="object-contain" 
                priority
              />
            </div>
            <span className="text-xl font-bold tracking-widest text-foreground">NOVA<span className="text-cta-primary">SPHERE</span></span>
          </Link>

          <div className="hidden lg:block flex-1 max-w-2xl">
            <Omnibar />
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-6 shrink-0">
            <nav className="flex items-center space-x-6 mr-4">
              <Link href="/store" className="text-sm font-medium text-muted hover:text-foreground transition-colors">
                Store
              </Link>
              <MegaMenu />
            </nav>

            <div className="flex items-center space-x-4 border-l border-border pl-6">
              <Show when="signed-out">
                <Link href="/login" className="text-sm font-medium text-muted hover:text-foreground transition-colors">
                  Sign In
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">Sign Up</Button>
                </Link>
              </Show>
              <Show when="signed-in">
                <NotificationCenter userId={userId ?? null} enabled={liveNotificationsEnabled} />
                <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
              </Show>

              <button 
                onClick={() => setCartOpen(true)}
                className="text-muted hover:text-foreground transition-colors relative"
              >
                <ShoppingCart className="w-6 h-6" />
                {mounted && cartItemCount > 0 && (
                  <span data-testid="cart-count" className="absolute -top-2 -right-2 bg-cta-secondary text-xs text-white font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-soft">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Search & Menu Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-surface border-t border-border mt-4 overflow-hidden shadow-hover"
            >
              <div className="p-4">
                <Omnibar />
              </div>
              <div className="flex flex-col px-6 py-4 space-y-4 border-t border-border">
                {["Store", "Categories", "Trending", "About"].map((item) => (
                  <Link key={item} href={`/${item.toLowerCase()}`} className="text-muted font-medium hover:text-foreground transition-colors">
                    {item}
                  </Link>
                ))}
                <Show when="signed-in">
                  <Link href="/account" className="text-cta-primary font-medium hover:text-foreground transition-colors">
                    Account
                  </Link>
                  <Link href="/admin" className="text-success font-medium hover:text-foreground transition-colors">
                    Admin Portal
                  </Link>
                </Show>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center space-x-4">
                    <Show when="signed-out">
                      <Link href="/login" className="text-muted hover:text-foreground transition-colors font-medium">
                        Sign In
                      </Link>
                      <Link href="/register">
                         <Button variant="primary" size="sm">Sign Up</Button>
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
                    className="text-muted hover:text-foreground transition-colors flex items-center space-x-2 relative"
                  >
                    <ShoppingCart className="w-6 h-6" />
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

