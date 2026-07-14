"use client";

import React, { useEffect, useState } from "react";
import { CampaignEngine, CampaignConfig } from "@/domains/Experience/engines/CampaignEngine";
import { HeroBackground } from "./HeroBackground";
import { HeroContent } from "./HeroContent";
import { HeroCards } from "./HeroCards";

export function Hero() {
  const [campaigns, setCampaigns] = useState<CampaignConfig[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    CampaignEngine.getActiveCampaigns().then(setCampaigns);
  }, []);

  useEffect(() => {
    if (campaigns.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % campaigns.length);
    }, 7000); // 7s auto-rotate
    return () => clearInterval(interval);
  }, [campaigns.length]);

  const activeCampaign = campaigns[currentIndex] || null;

  return (
    <section className="relative w-full min-h-[85vh] flex items-center overflow-hidden bg-background pt-20">
      <HeroBackground theme={activeCampaign?.theme} />
      
      <div className="container mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <HeroContent campaign={activeCampaign} key={activeCampaign?.id} />
        <HeroCards />
      </div>
    </section>
  );
}
