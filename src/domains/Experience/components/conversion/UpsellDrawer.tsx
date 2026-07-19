"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useCartStore } from "@/store/useCartStore";
import { RewardProgress } from "./RewardProgress";
import { DeliveryEstimator } from "./DeliveryEstimator";
import { CouponWidget } from "./CouponWidget";
import { RecommendationEngine } from "./RecommendationEngine";
import { CartAnalytics } from "./CartAnalytics";

interface UpsellDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const MOCK_UPSELLS = [
  {
    id: "acc1",
    name: "Premium Braided Cable (2m)",
    price: 29.99,
    salePrice: 19.99,
    image: "/hero-product.png",
    rating: 4.8,
    type: "accessory" as const
  },
  {
    id: "upg1",
    name: "2-Year Accident Protection",
    price: 99.00,
    salePrice: null,
    image: "/hero-product.png", // Usually an icon
    rating: 5.0,
    type: "upgrade" as const
  }
];

export function UpsellDrawer({ isOpen, onClose }: UpsellDrawerProps) {
  const storeState = useCartStore() as any;
  const items = storeState.items || [];
  const currentTotal = storeState.subtotal || 0;

  useEffect(() => {
    if (isOpen) {
      CartAnalytics.track("drawer_opened", { total: currentTotal, itemsCount: items.length });
    } else {
      CartAnalytics.track("drawer_closed", { total: currentTotal });
    }
  }, [isOpen, currentTotal, items.length]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-[101] w-full max-w-md bg-background border-l border-border shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border bg-surface">
              <div className="flex items-center gap-2 text-emerald-500 font-bold">
                <CheckCircle2 className="w-5 h-5" />
                <span>Added to Cart</span>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-surface-hover transition-colors"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin">
              
              {/* Added Items Preview (just top 2 to save space) */}
              <div className="flex flex-col gap-4 mb-6">
                {items.slice(0, 2).map((item: any) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-surface border border-border rounded-xl">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted/20 border border-border">
                       <Image src={item.image} alt={item.name} fill className="object-cover mix-blend-multiply" />
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="text-sm font-bold text-foreground line-clamp-1">{item.name}</span>
                      <span className="text-xs text-muted-foreground mt-1">Qty: {item.quantity}</span>
                      <span className="text-sm font-bold text-danger mt-auto">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
                {items.length > 2 && (
                  <div className="text-xs text-center text-muted-foreground font-medium">
                    +{items.length - 2} more items in your cart
                  </div>
                )}
              </div>

              {/* Stacked Incentive Progress */}
              <div className="mb-6">
                 <RewardProgress currentTotal={currentTotal} />
              </div>

              {/* Recommendation Engine (Upsells) */}
              <RecommendationEngine 
                strategy="frequently_bought"
                title="Frequently Bought Together"
                items={MOCK_UPSELLS}
              />

              {/* Delivery Info */}
              <DeliveryEstimator />

              {/* Coupons */}
              <CouponWidget />

            </div>

            {/* Sticky Footer */}
            <div className="p-6 bg-surface border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
               <div className="flex items-center justify-between mb-4">
                 <span className="text-muted-foreground font-medium">Subtotal</span>
                 <span className="text-2xl font-bold text-foreground">${currentTotal.toFixed(2)}</span>
               </div>
               
               <div className="text-xs text-emerald-500 font-bold mb-4 flex items-center justify-center gap-1 bg-emerald-500/10 py-1.5 rounded-md">
                 <span>🎉 You've earned</span>
                 <span className="bg-emerald-500 text-background px-1.5 rounded">{Math.floor(currentTotal * 1.5)}</span>
                 <span>Reward Points!</span>
               </div>

               <div className="flex flex-col gap-3">
                 <button className="w-full py-4 bg-cta-primary text-cta-primary-foreground font-bold rounded-xl shadow-glow-primary hover:bg-cta-primary/90 transition-all flex items-center justify-center gap-2">
                   <ShoppingCart className="w-5 h-5" /> Checkout Now
                 </button>
                 <button 
                   onClick={onClose}
                   className="w-full py-3 bg-background text-foreground border border-border font-bold rounded-xl hover:bg-surface transition-colors"
                 >
                   Continue Shopping
                 </button>
               </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
