"use client";

import React, { useState } from "react";
import { useExperience } from "../sdk/hooks";
import { X, Gift, Truck, Star, Zap } from "lucide-react";

export function ContextualOffer() {
  const { context, trackExperienceEvent } = useExperience();
  const [dismissedOffers, setDismissedOffers] = useState<Set<string>>(new Set());

  if (!context || context.offers.length === 0) return null;

  // For this component, we'll just display the first non-dismissed offer
  const activeOffer = context.offers.find(o => !dismissedOffers.has(o.id));
  if (!activeOffer) return null;

  const handleDismiss = () => {
    setDismissedOffers(prev => new Set(prev).add(activeOffer.id));
    trackExperienceEvent("offer.dismissed", { offerId: activeOffer.id, offerType: activeOffer.type });
  };

  const handleAccept = () => {
    trackExperienceEvent("offer.accepted", { offerId: activeOffer.id, offerType: activeOffer.type });
  };

  // Determine Icon based on offer type
  const getIcon = () => {
    switch (activeOffer.type) {
      case "free_shipping": return <Truck className="w-5 h-5 text-success" />;
      case "vip_discount": return <Star className="w-5 h-5 text-warning" />;
      case "price_drop": return <Zap className="w-5 h-5 text-danger" />;
      default: return <Gift className="w-5 h-5 text-cta-primary" />;
    }
  };

  return (
    <div className="bg-surface border-b border-border shadow-sm">
      <div className="container mx-auto px-4 max-w-7xl h-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getIcon()}
          <div>
            <span className="font-bold text-foreground text-sm mr-2">{activeOffer.title}</span>
            <span className="hidden md:inline text-muted-foreground text-xs">{activeOffer.description}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a 
            href={activeOffer.ctaLink}
            onClick={handleAccept}
            className="text-xs font-bold text-cta-primary hover:underline"
          >
            {activeOffer.ctaText}
          </a>
          <button 
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss offer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
