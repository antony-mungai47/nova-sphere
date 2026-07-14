"use client";

import React, { useEffect, useState } from "react";
import { CampaignDTO } from "./types";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift } from "lucide-react";
import { CartAnalytics } from "./CartAnalytics";

export function ExitIntentObserver() {
  const [showExitModal, setShowExitModal] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  // Mock campaign logic
  const activeCampaign: CampaignDTO = {
    id: "camp_exit_1",
    title: "Wait! Don't leave empty-handed.",
    subtitle: "Complete your order now and save an extra 10%.",
    code: "SAVE10NOW",
    expiresIn: "14:59",
    theme: "discount"
  };

  useEffect(() => {
    if (hasTriggered) return;

    // Desktop: Mouse out top of window
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 || e.clientX <= 0 || (e.clientX >= window.innerWidth || e.clientY >= window.innerHeight)) {
        triggerExitOffer();
      }
    };

    // Mobile: Inactivity (15s) + Rapid Scroll Up
    let scrollTimeout: NodeJS.Timeout;
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const speed = lastScrollY - currentScrollY; // Positive = scrolling up
      
      if (speed > 50) { // Rapid scroll up
         triggerExitOffer();
      }
      lastScrollY = currentScrollY;

      // Reset inactivity
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        triggerExitOffer(); // 15s idle
      }, 15000);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        triggerExitOffer();
      }
    };

    const triggerExitOffer = () => {
      if (!hasTriggered) {
        setHasTriggered(true);
        setShowExitModal(true);
        CartAnalytics.track("exit_offer_seen", { campaignId: activeCampaign.id });
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("scroll", handleScroll);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Initial idle start
    scrollTimeout = setTimeout(() => triggerExitOffer(), 15000);

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("scroll", handleScroll);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearTimeout(scrollTimeout);
    };
  }, [hasTriggered, activeCampaign.id]);

  const handleAccept = () => {
    CartAnalytics.track("exit_offer_accepted", { campaignId: activeCampaign.id, code: activeCampaign.code });
    // In a real app, apply code to cart here
    setShowExitModal(false);
  };

  return (
    <AnimatePresence>
      {showExitModal && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-lg bg-surface border border-border shadow-2xl rounded-3xl overflow-hidden relative"
          >
            <button 
              onClick={() => setShowExitModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-muted/50 hover:bg-muted text-muted-foreground transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="bg-gradient-to-br from-cta-primary to-cta-primary/80 p-8 text-center text-cta-primary-foreground">
               <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                 <Gift className="w-8 h-8 text-white" />
               </div>
               <h2 className="text-3xl font-bold mb-2">{activeCampaign.title}</h2>
               <p className="text-white/80 text-sm">{activeCampaign.subtitle}</p>
            </div>

            <div className="p-8 text-center">
               <div className="inline-block border-2 border-dashed border-cta-primary bg-cta-primary/5 rounded-xl px-8 py-4 mb-6">
                  <span className="text-2xl font-black text-foreground tracking-widest uppercase">
                    {activeCampaign.code}
                  </span>
               </div>

               {activeCampaign.expiresIn && (
                 <p className="text-sm text-danger font-bold mb-6">
                   Offer expires in {activeCampaign.expiresIn}
                 </p>
               )}

               <button 
                 onClick={handleAccept}
                 className="w-full py-4 bg-foreground text-background font-bold rounded-xl shadow-sm hover:bg-foreground/90 transition-all text-lg"
               >
                 Apply Discount & Checkout
               </button>
               
               <button 
                 onClick={() => setShowExitModal(false)}
                 className="mt-4 text-sm text-muted-foreground font-medium hover:underline"
               >
                 No thanks, I prefer paying full price
               </button>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
