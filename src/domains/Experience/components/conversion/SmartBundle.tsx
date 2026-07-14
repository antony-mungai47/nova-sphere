"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Plus, CheckCircle2 } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { CartAnalytics } from "./CartAnalytics";

export function SmartBundle() {
  const { addItem } = useCartStore();
  const [added, setAdded] = useState(false);

  // Mock bundle logic
  const bundleItems = [
    { id: "main1", name: "Nova Pro Laptop", image: "/hero-product.png", price: 1299.99 },
    { id: "acc1", name: "Wireless Mouse", image: "/hero-product.png", price: 49.99 },
    { id: "acc2", name: "Laptop Sleeve", image: "/hero-product.png", price: 39.99 },
    { id: "acc3", name: "USB-C Hub", image: "/hero-product.png", price: 59.99 }
  ];

  const totalValue = bundleItems.reduce((acc, item) => acc + item.price, 0);
  const bundlePrice = 1350.00; // Bundle deal
  const savings = totalValue - bundlePrice;

  const handleAddBundle = () => {
    bundleItems.forEach(item => {
      addItem({
        id: item.id,
        name: item.name,
        price: item.id === "main1" ? item.price : 0, // Simplified distribution of the discount for the mock
        image: item.image,
        quantity: 1
      });
    });
    setAdded(true);
    CartAnalytics.track("bundle_added", { 
      bundleId: "b1", 
      totalValue, 
      bundlePrice, 
      savings 
    });
    
    // reset after 3s
    setTimeout(() => setAdded(false), 3000);
  };

  return (
    <div className="bg-surface/50 border border-border rounded-2xl p-6 mb-8 mt-8">
      <h3 className="text-xl font-bold text-foreground mb-6">Complete Your Setup</h3>
      
      <div className="flex flex-col md:flex-row items-center gap-6">
        
        {/* Visual Builder */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 flex-1">
          {bundleItems.map((item, idx) => (
            <React.Fragment key={item.id}>
              <div className="flex flex-col items-center gap-2 group cursor-pointer">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-background border border-border group-hover:border-cta-primary transition-colors">
                   <Image src={item.image} alt={item.name} fill className="object-cover mix-blend-multiply group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground text-center max-w-[80px] truncate">
                  {item.name}
                </span>
              </div>
              
              {idx < bundleItems.length - 1 && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground flex-shrink-0 mb-6">
                  <Plus className="w-4 h-4" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Pricing & CTA */}
        <div className="flex flex-col items-center md:items-end min-w-[200px] border-t md:border-t-0 md:border-l border-border pt-6 md:pt-0 md:pl-6">
           <div className="text-sm text-muted-foreground line-through mb-1">
             ${totalValue.toFixed(2)}
           </div>
           <div className="text-3xl font-bold text-foreground mb-2">
             ${bundlePrice.toFixed(2)}
           </div>
           <div className="text-sm font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full mb-6">
             Save ${savings.toFixed(2)}
           </div>
           
           <button 
             onClick={handleAddBundle}
             disabled={added}
             className="w-full py-3.5 px-6 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed shadow-sm bg-foreground text-background hover:bg-foreground/90"
           >
             {added ? (
               <><CheckCircle2 className="w-5 h-5 text-emerald-400" /> Added to Cart</>
             ) : (
               "Add Bundle to Cart"
             )}
           </button>
        </div>

      </div>
    </div>
  );
}
