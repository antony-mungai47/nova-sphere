"use client";

import React from "react";
import { Check, ShieldCheck, Truck, Clock, RotateCcw } from "lucide-react";

export function ProductHighlights() {
  const highlights = [
    { icon: <Truck className="w-4 h-4 text-emerald-500" />, text: "Free Delivery" },
    { icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />, text: "24 Month Warranty" },
    { icon: <Check className="w-4 h-4 text-emerald-500" />, text: "Verified Vendor" },
    { icon: <RotateCcw className="w-4 h-4 text-emerald-500" />, text: "Easy Returns" },
    { icon: <Check className="w-4 h-4 text-emerald-500" />, text: "Original Product" },
  ];

  return (
    <div className="flex flex-col gap-3 py-6 border-y border-border my-6">
      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-2">Key Highlights</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {highlights.map((h, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              {h.icon}
            </div>
            <span className="text-sm text-muted-foreground font-medium">{h.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
