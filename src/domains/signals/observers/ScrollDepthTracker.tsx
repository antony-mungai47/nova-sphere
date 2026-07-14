"use client";

import { useEffect, useRef } from "react";
import { useSignals } from "../sdk/hooks";

interface ScrollDepthTrackerProps {
  pageType?: string;
  productId?: string;
}

export function ScrollDepthTracker({ pageType = "pdp", productId }: ScrollDepthTrackerProps) {
  const { track } = useSignals();
  const reportedMilestones = useRef(new Set<number>());

  useEffect(() => {
    const handleScroll = () => {
      // Calculate max scroll depth
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const scrollPercent = (scrollTop / (docHeight - winHeight)) * 100;

      const milestones = [25, 50, 75, 90, 100];
      
      for (const milestone of milestones) {
        if (scrollPercent >= milestone && !reportedMilestones.current.has(milestone)) {
          reportedMilestones.current.add(milestone);
          track(
            "scroll.depth",
            "engagement",
            { depth: milestone, pageType, productId },
            false // Batched passive event
          );
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [track, pageType, productId]);

  return null; // Headless component
}
