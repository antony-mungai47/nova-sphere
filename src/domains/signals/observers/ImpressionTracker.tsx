"use client";

import React, { useEffect, useRef } from "react";
import { useSignals } from "../sdk/hooks";

interface ImpressionTrackerProps {
  children: React.ReactNode;
  entityId: string;
  entityName: string;
  category?: "product" | "recommendation" | "banner";
  threshold?: number;
}

export function ImpressionTracker({ 
  children, 
  entityId, 
  entityName, 
  category = "product",
  threshold = 0.5 
}: ImpressionTrackerProps) {
  const { track } = useSignals();
  const ref = useRef<HTMLDivElement>(null);
  const hasFired = useRef(false);

  useEffect(() => {
    if (hasFired.current || !ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasFired.current) {
          hasFired.current = true;
          
          track(
            category === "product" ? "product.impression" : "recommendation.viewed",
            "commerce",
            { entityId, entityName },
            false // batched passive event
          );

          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [track, entityId, entityName, category, threshold]);

  return <div ref={ref}>{children}</div>;
}
