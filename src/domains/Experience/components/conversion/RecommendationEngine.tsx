"use client";

import React from "react";
import Image from "next/image";
import { RecommendationDTO } from "./types";
import { Plus } from "lucide-react";
import { useSignals } from "../../../signals/sdk/hooks";
import { ImpressionTracker } from "../../../signals/observers/ImpressionTracker";
import { useCartStore } from "@/store/useCartStore";

interface RecommendationEngineProps {
  strategy: "frequently_bought" | "premium_upgrade" | "complete_setup" | "recently_viewed";
  title: string;
  items: RecommendationDTO[];
}

export function RecommendationEngine({ strategy, title, items }: RecommendationEngineProps) {
  const { addItem } = useCartStore();
  const { track } = useSignals();

  const handleAdd = (item: RecommendationDTO) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.salePrice || item.price,
      image: item.image,
      quantity: 1
    });
    track("recommendation.clicked", "ai_training", { strategy, itemId: item.id }, true);
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="py-6 border-b border-border">
      <h4 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider">{title}</h4>
      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <ImpressionTracker key={item.id} entityId={item.id} entityName={item.name} category="recommendation">
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted/20 border border-border flex-shrink-0">
                <Image src={item.image} alt={item.name} fill className="object-cover mix-blend-multiply" />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-xs font-bold text-foreground truncate">{item.name}</span>
                <span className="text-xs text-danger font-medium mt-0.5">
                  ${item.salePrice ? item.salePrice.toFixed(2) : item.price.toFixed(2)}
                </span>
              </div>
              <button 
                onClick={() => handleAdd(item)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-surface border border-border hover:bg-cta-primary hover:text-cta-primary-foreground hover:border-cta-primary transition-colors"
                aria-label={`Add ${item.name}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </ImpressionTracker>
        ))}
      </div>
    </div>
  );
}
