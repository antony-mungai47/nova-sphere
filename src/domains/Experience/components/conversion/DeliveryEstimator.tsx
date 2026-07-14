"use client";

import React from "react";
import { Truck, RotateCcw } from "lucide-react";

export function DeliveryEstimator() {
  // In a real app, this would use geolocation or user zip code
  return (
    <div className="flex flex-col gap-3 py-4 border-b border-border">
      <div className="flex items-start gap-3">
        <Truck className="w-5 h-5 text-foreground mt-0.5" />
        <div className="flex flex-col">
          <span className="text-sm font-bold text-foreground">Order today. Delivery Tomorrow.</span>
          <span className="text-xs text-muted-foreground">To Nairobi, Kenya</span>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <RotateCcw className="w-5 h-5 text-emerald-500 mt-0.5" />
        <div className="flex flex-col">
          <span className="text-sm font-bold text-emerald-500">Free Returns</span>
          <span className="text-xs text-muted-foreground">Within 30 days of receipt</span>
        </div>
      </div>
    </div>
  );
}
