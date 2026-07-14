"use client";

import React, { useState } from "react";
import { Tag, Check } from "lucide-react";
import { CartAnalytics } from "./CartAnalytics";

export function CouponWidget() {
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState(false);

  const handleApply = () => {
    if (code.trim().length > 0) {
      setApplied(true);
      CartAnalytics.track("coupon_applied", { code });
    }
  };

  const handleRemove = () => {
    CartAnalytics.track("coupon_dismissed", { code });
    setApplied(false);
    setCode("");
  };

  if (applied) {
    return (
      <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl my-4">
        <div className="flex items-center gap-2 text-sm font-bold text-emerald-500">
          <Tag className="w-4 h-4" />
          <span>{code.toUpperCase()} Applied</span>
        </div>
        <button onClick={handleRemove} className="text-xs text-muted-foreground hover:underline">
          Remove
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 my-4">
      <div className="relative flex-1">
        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Promo code"
          className="w-full bg-surface border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-cta-primary/50 transition-all"
        />
      </div>
      <button 
        onClick={handleApply}
        disabled={code.length === 0}
        className="px-4 py-2.5 rounded-xl font-bold text-sm bg-foreground text-background disabled:opacity-50 disabled:cursor-not-allowed hover:bg-foreground/90 transition-colors"
      >
        Apply
      </button>
    </div>
  );
}
