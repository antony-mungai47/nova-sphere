"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { usePersonalization } from "@/domains/Experience/engines/usePersonalization";
import { CampaignConfig } from "@/domains/Experience/engines/CampaignEngine";

interface HeroContentProps {
  campaign: CampaignConfig | null;
}

export function HeroContent({ campaign }: HeroContentProps) {
  const { greeting } = usePersonalization();

  const headline = campaign?.heroBanner.headline || "The Future of Smart Shopping";
  const subheadline = campaign?.heroBanner.subheadline || "Discover premium devices curated from top vendors globally.";
  const primaryCta = campaign?.heroBanner.primaryCta || "Shop Now";
  const secondaryCta = campaign?.heroBanner.secondaryCta || "Explore Trending";

  return (
    <div className="relative z-10 flex flex-col justify-center max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-cta-secondary/10 text-cta-secondary text-sm font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-cta-secondary mr-2 animate-pulse" />
          {greeting}
        </div>
        
        <h1 className="text-5xl md:text-7xl font-heading font-extrabold text-foreground tracking-tight leading-[1.1] mb-6">
          {headline}
        </h1>
        
        <p className="text-lg md:text-xl text-muted leading-relaxed mb-10 max-w-xl">
          {subheadline}
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" className="rounded-full font-bold">
            Explore Collection
          </Button>
          <Button variant="outline" size="lg" className="rounded-full bg-surface/10 backdrop-blur-md border-surface/20 hover:bg-surface/20">
            {secondaryCta}
          </Button>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex items-center gap-6 opacity-60 grayscale">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="text-xl">🛡️</span> Secure Checkout
          </div>
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="text-xl">⚡</span> Fast Delivery
          </div>
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="text-xl">🔄</span> 30-Day Returns
          </div>
        </div>
      </motion.div>
    </div>
  );
}
