"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface FlyItem {
  id: string;
  image: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface FlyToCartContextType {
  triggerFlyToCart: (image: string, startEvent: React.MouseEvent) => void;
}

const FlyToCartContext = createContext<FlyToCartContextType>({
  triggerFlyToCart: () => {},
});

export function useFlyToCart() {
  return useContext(FlyToCartContext);
}

export function FlyToCartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<FlyItem[]>([]);

  const triggerFlyToCart = useCallback((image: string, startEvent: React.MouseEvent) => {
    // Determine start coordinates
    const startX = startEvent.clientX;
    const startY = startEvent.clientY;

    // Find the cart target (Mobile FAB or Header Cart)
    // We try to find the Mobile FAB cart badge or the header cart icon
    const cartTarget = document.getElementById("cart-target") || document.querySelector(".cart-icon-target");
    let endX = window.innerWidth - 40; // Fallback bottom right
    let endY = window.innerHeight - 40;

    if (cartTarget) {
      const rect = cartTarget.getBoundingClientRect();
      endX = rect.left + rect.width / 2;
      endY = rect.top + rect.height / 2;
    }

    const newItem: FlyItem = {
      id: Math.random().toString(36).substr(2, 9),
      image,
      startX,
      startY,
      endX,
      endY,
    };

    setItems((prev) => [...prev, newItem]);

    // Cleanup after animation completes
    setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.id !== newItem.id));
    }, 1000); // Wait for animation duration (800ms + buffer)
  }, []);

  return (
    <FlyToCartContext.Provider value={{ triggerFlyToCart }}>
      {children}
      <div className="fixed inset-0 pointer-events-none z-[9999]">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ 
                x: item.startX, 
                y: item.startY, 
                scale: 1, 
                opacity: 1 
              }}
              animate={{ 
                x: item.endX, 
                y: item.endY, 
                scale: 0.2, 
                opacity: 0.5 
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.8,
                ease: [0.32, 0.72, 0, 1], // Custom bezier curve for "fly" arc
              }}
              className="absolute w-20 h-20 bg-surface rounded-xl shadow-glow-primary flex items-center justify-center p-2 pointer-events-none"
            >
              <Image src={item.image} alt="Flying item" fill className="object-contain p-2 mix-blend-multiply" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </FlyToCartContext.Provider>
  );
}
