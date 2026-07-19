"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useExperience } from "../sdk/hooks";
import { ProductRankingData } from "../engine/RankingEngine";
import { RankedProduct } from "../engine/types";
import { Plus } from "lucide-react";

interface RankedProductRowProps {
  title: string;
  rawProducts: ProductRankingData[]; // In a real app, this would be a full product DTO
}

export function RankedProductRow({ title, rawProducts }: RankedProductRowProps) {
  const { context, rankProducts, trackExperienceEvent } = useExperience();
  const [ranked, setRanked] = useState<RankedProduct[]>([]);

  useEffect(() => {
    if (context && rawProducts.length > 0) {
      const sorted = rankProducts(rawProducts);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRanked(sorted);
      trackExperienceEvent("recommendation.shown", { rowTitle: title, topItem: sorted[0]?.id });
    }
  }, [context, rawProducts, rankProducts, title, trackExperienceEvent]);

  if (!context || ranked.length === 0) return null;

  return (
    <section className="py-12 border-t border-border">
      <div className="container mx-auto px-4 max-w-7xl">
        <h2 className="text-2xl font-bold text-foreground mb-8">{title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {ranked.slice(0, 5).map((item, index) => {
            const product = rawProducts.find(p => p.id === item.id);
            if (!product) return null;
            
            return (
              <div 
                key={item.id} 
                className="group relative flex flex-col bg-surface border border-border rounded-2xl overflow-hidden hover:shadow-soft transition-all cursor-pointer"
                onClick={() => trackExperienceEvent("recommendation.clicked", { productId: item.id })}
              >
                <div className="relative aspect-square bg-muted/20 p-4">
                  {/* Mock image placeholder since we don't have full DTOs */}
                  <div className="w-full h-full bg-muted/40 rounded-xl" />
                  {item.reason && (
                    <span className="absolute top-2 left-2 bg-cta-secondary text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                      ✨ Best Match
                    </span>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-foreground text-sm line-clamp-1">{product.category} Item {product.id}</h3>
                  <p className="text-muted-foreground text-xs mt-1">Rank Score: {item.rankScore.toFixed(2)}</p>
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <span className="font-bold text-foreground">${product.price.toFixed(2)}</span>
                    <button className="w-8 h-8 rounded-full bg-muted/20 flex items-center justify-center hover:bg-cta-primary hover:text-white transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
