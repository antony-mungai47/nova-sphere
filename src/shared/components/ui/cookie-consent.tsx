"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Cookie } from "lucide-react";
import { Button } from "./button";
import Link from "next/link";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem("nova_cookie_consent");
    if (!hasConsented) {
      // Small delay so it doesn't pop up instantly on load
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("nova_cookie_consent", "true");
    setIsVisible(false);
    
    // In a real app, you would initialize tracking scripts here or reload
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("cookie_consent_accepted"));
    }
  };

  const declineCookies = () => {
    // We still record their choice so we don't ask again
    localStorage.setItem("nova_cookie_consent", "declined");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 150, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 150, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-[450px] z-50"
        >
          <div className="glass-panel p-6 rounded-3xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-black/80 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-nova-blue via-nova-purple to-nova-blue"></div>
            
            <button 
              onClick={declineCookies}
              className="absolute top-4 right-4 text-nova-silver hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-nova-blue/20 flex items-center justify-center flex-shrink-0 text-nova-blue mt-1">
                <Cookie className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg mb-1">We value your privacy</h3>
                <p className="text-sm text-nova-silver leading-relaxed">
                  We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. 
                  By clicking "Accept All", you consent to our use of cookies.
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button 
                onClick={declineCookies}
                className="px-4 py-2 rounded-xl text-sm font-medium text-nova-silver hover:text-white hover:bg-white/5 transition-colors"
              >
                Decline
              </button>
              <Button 
                onClick={acceptCookies}
                className="px-6 py-2 rounded-xl text-sm font-medium"
              >
                Accept All
              </Button>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/5 flex justify-center gap-4 text-xs text-nova-silver/70">
              <Link href="/policies/privacy" className="hover:text-white underline transition-colors">Privacy Policy</Link>
              <Link href="/policies/terms" className="hover:text-white underline transition-colors">Terms of Service</Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
