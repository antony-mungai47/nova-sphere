"use client";

import React from "react";
import { Check } from "lucide-react";

interface StackedProgressProps {
  currentTotal: number;
}

export function RewardProgress({ currentTotal }: StackedProgressProps) {
  const thresholds = [
    { name: "Free delivery", value: 1000, color: "bg-emerald-500" },
    { name: "Silver Member", value: 2500, color: "bg-cta-primary" },
    { name: "Free Gift", value: 5000, color: "bg-warning" },
  ];

  return (
    <div className="flex flex-col gap-4 py-4 border-y border-border">
      {thresholds.map((t, i) => {
        const progress = Math.min((currentTotal / t.value) * 100, 100);
        const isReached = progress === 100;
        const remaining = t.value - currentTotal;

        return (
          <div key={i} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className={isReached ? "text-foreground" : "text-muted-foreground"}>
                {t.name}
              </span>
              <span>
                {isReached ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <span className="text-danger">Spend ${remaining.toFixed(2)} more</span>
                )}
              </span>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full ${isReached ? "bg-emerald-500" : t.color} transition-all duration-500`} 
                style={{ width: `${progress}%` }} 
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
