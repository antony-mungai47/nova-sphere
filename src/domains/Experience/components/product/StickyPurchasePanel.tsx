"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Heart, Share, Bell, MessageCircle, Flag, Copy, RefreshCw, ShieldCheck, MapPin } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface StickyPurchasePanelProps {
  price: number;
  salePrice: number | null;
  stock: number;
  onAddToCart: () => void;
  isAdding?: boolean;
}

export function StickyPurchasePanel({ price, salePrice, stock, onAddToCart, isAdding }: StickyPurchasePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [showMobileSticky, setShowMobileSticky] = useState(false);

  useEffect(() => {
    // Only applies to mobile widths technically, but we track globally
    const observer = new IntersectionObserver(
      ([entry]) => {
        // If the main panel is NOT intersecting (scrolled past), show mobile sticky
        setShowMobileSticky(!entry.isIntersecting);
      },
      { rootMargin: "-100px 0px 0px 0px", threshold: 0 }
    );

    if (panelRef.current) {
      observer.observe(panelRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Main Desktop Panel (also renders natively in flow on mobile) */}
      <div 
        ref={panelRef} 
        className="w-full bg-surface border border-border rounded-2xl p-6 shadow-sm sticky top-24"
      >
        <div className="flex flex-col gap-4">
          
          {/* Price & Discount */}
          <div>
            {salePrice ? (
              <div className="flex items-end gap-3">
                <span className="text-4xl font-bold text-danger">${salePrice.toFixed(2)}</span>
                <div className="flex flex-col">
                   <span className="text-muted-foreground line-through text-sm">${price.toFixed(2)}</span>
                   <span className="text-danger text-xs font-bold bg-danger/10 px-1.5 py-0.5 rounded">
                     Save ${(price - salePrice).toFixed(2)}
                   </span>
                </div>
              </div>
            ) : (
              <span className="text-4xl font-bold text-foreground">${price.toFixed(2)}</span>
            )}
          </div>

          {/* Stock Urgency */}
          <div className="flex flex-col gap-1 mt-2">
            {stock > 0 ? (
              <>
                <div className="flex items-center gap-2 text-emerald-500 font-medium text-sm">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  In Stock
                </div>
                <div className="text-xs text-muted-foreground">Only {stock} left • 132 sold today</div>
                
                {/* Visual stock bar */}
                <div className="w-full h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                   <div className="h-full bg-danger rounded-full" style={{ width: `${Math.min(100, Math.max(10, (stock / 50) * 100))}%` }} />
                </div>
              </>
            ) : (
              <span className="text-danger font-medium">Out of Stock</span>
            )}
          </div>

          <div className="h-px w-full bg-border my-2" />

          {/* Delivery Estimator (Mocked) */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Deliver to</span>
              <button className="text-xs text-cta-primary hover:underline">Change Location</button>
            </div>
            <div className="flex items-start gap-3 bg-muted/20 p-3 rounded-lg border border-border">
              <MapPin className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Nairobi</span>
                <span className="text-sm text-emerald-500">✓ Tomorrow</span>
                <span className="text-xs text-muted-foreground mt-1">FREE with Nova Prime</span>
              </div>
            </div>
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <RefreshCw className="w-3.5 h-3.5" /> 30-Day Returns
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="w-3.5 h-3.5" /> 2-Yr Warranty
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-bold text-foreground">500</span> Reward Points
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-500 font-medium">
              Coupons Available
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 mt-4">
            <Button 
              size="lg" 
              className="w-full text-base font-bold rounded-xl shadow-glow-primary"
              onClick={onAddToCart}
              disabled={stock === 0 || isAdding}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {isAdding ? "Adding..." : "Add to Cart"}
            </Button>
            <Button 
              size="lg" 
              variant="secondary"
              className="w-full text-base font-bold rounded-xl bg-foreground text-background hover:bg-foreground/90"
              disabled={stock === 0}
            >
              Buy Now
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-2 mt-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-muted-foreground">Secure SSL Checkout</span>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Action Bar */}
      <AnimatePresence>
        {showMobileSticky && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-surface/90 backdrop-blur-xl border-t border-border p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex flex-col">
                <span className="text-lg font-bold text-foreground">${(salePrice || price).toFixed(2)}</span>
                <span className="text-xs text-emerald-500 font-medium">✓ In Stock</span>
              </div>
              <button className="w-10 h-10 flex items-center justify-center rounded-full bg-muted/20 text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors">
                <Heart className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-3">
              <Button 
                className="flex-1 rounded-xl font-bold"
                onClick={onAddToCart}
                disabled={stock === 0 || isAdding}
              >
                Add to Cart
              </Button>
              <Button 
                variant="secondary"
                className="flex-1 rounded-xl bg-foreground text-background font-bold"
                disabled={stock === 0}
              >
                Buy Now
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
