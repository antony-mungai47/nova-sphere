"use client";

import { useState, useEffect } from "react";
import { ProductInsightDTO } from "../types";
import { IntelligenceFacade } from "../facade/ProductIntelligenceFacade";

export function useProductIntelligence(productId: string) {
  const [insight, setInsight] = useState<ProductInsightDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setTimeout(() => { setIsLoading(true); }, 0);

    IntelligenceFacade.getFullProductInsight(productId)
      .then((data) => {
        if (isMounted) {
          setInsight(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch product intelligence", err);
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [productId]);

  return {
    insight,
    isLoading,
    // Granular exports for convenience
    pricing: insight?.pricing,
    inventory: insight?.inventory,
    trust: insight?.trust,
    delivery: insight?.delivery,
    sustainability: insight?.sustainability,
  };
}
