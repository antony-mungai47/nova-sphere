"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Search, ShoppingCart, User, Menu, X, Heart } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { CartSidebar } from "@/domains/Commerce/checkout/components/cart/cart-sidebar";

export function MobileFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  
  const { items } = useCartStore();
  const [mounted, setMounted] = useState(false);
  
  const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuItems = [
    { icon: <Home size={20} />, label: "Home", href: "/" },
    { icon: <Search size={20} />, label: "Search", href: "/store" },
    { icon: <Heart size={20} />, label: "Wishlist", href: "/account/wishlist" },
    { icon: <User size={20} />, label: "Account", href: "/account" },
  ];

  return (
    <>
      <div className="md:hidden fixed bottom-6 right-6 z-[60] flex flex-col items-end space-y-3">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col space-y-3 mb-2"
            >
              {/* Cart Button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setCartOpen(true);
                  setIsOpen(false);
                }}
                className="w-12 h-12 rounded-full bg-surface/90 backdrop-blur-md border border-border shadow-elevation flex items-center justify-center text-foreground hover:text-cta-primary transition-colors relative"
              >
                <ShoppingCart size={20} />
                {mounted && cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-cta-secondary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </motion.button>

              {/* Menu Links */}
              {menuItems.map((item, idx) => (
                <Link key={item.label} href={item.href}>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * (menuItems.length - idx) }}
                    className="w-12 h-12 rounded-full bg-surface/90 backdrop-blur-md border border-border shadow-elevation flex items-center justify-center text-foreground hover:text-cta-primary transition-colors"
                  >
                    {item.icon}
                  </motion.div>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Toggle FAB */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleMenu}
          className="w-14 h-14 rounded-full bg-cta-primary text-white shadow-glow-primary flex items-center justify-center z-[60]"
        >
          <motion.div
            initial={false}
            animate={{ rotate: isOpen ? 135 : 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <Menu size={24} />
          </motion.div>
        </motion.button>
      </div>

      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
