"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, History, TrendingUp, Sparkles, X } from "lucide-react";
import { Input } from "@/components/ui/Input";

export function IntelligentSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative z-z-overlay w-full max-w-2xl mx-auto">
      <div 
        className="relative group cursor-text"
        onClick={() => setIsOpen(true)}
      >
        <Input 
          leftIcon={<Search size={18} />}
          placeholder="Search for products, categories, or vendors..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="h-12 text-base rounded-full border-border/50 bg-surface/80 backdrop-blur-md shadow-soft focus-visible:ring-cta-primary transition-all duration-motion-medium"
        />
        {query && (
          <button 
            onClick={(e) => { e.stopPropagation(); setQuery(""); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-14 left-0 right-0 bg-surface/95 backdrop-blur-xl border border-border rounded-card shadow-hover overflow-hidden"
          >
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Recent & Trending */}
              <div className="space-y-6">
                <div>
                  <h4 className="flex items-center text-sm font-semibold text-muted mb-3 uppercase tracking-wider">
                    <History size={14} className="mr-2" /> Recent Searches
                  </h4>
                  <ul className="space-y-2">
                    {["Wireless Headphones", "Mechanical Keyboard", "Standing Desk"].map((item) => (
                      <li key={item}>
                        <button className="text-foreground hover:text-cta-primary text-sm font-medium transition-colors">
                          {item}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="flex items-center text-sm font-semibold text-muted mb-3 uppercase tracking-wider">
                    <TrendingUp size={14} className="mr-2" /> Popular Now
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {["PS5 Pro", "iPhone 16", "Ergonomic Chair", "Sneakers"].map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-muted/10 text-foreground text-xs rounded-full hover:bg-muted/20 cursor-pointer transition-colors">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: AI Suggestions or Product Previews */}
              <div className="bg-muted/5 rounded-lg p-4">
                <h4 className="flex items-center text-sm font-semibold text-muted mb-3 uppercase tracking-wider">
                  <Sparkles size={14} className="mr-2 text-cta-primary" /> AI Suggestions
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-2 hover:bg-surface rounded-md cursor-pointer transition-colors">
                    <div className="w-10 h-10 bg-cat-electronics/10 rounded flex items-center justify-center">📱</div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Smartphones & Wearables</p>
                      <p className="text-xs text-muted">In Electronics</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 hover:bg-surface rounded-md cursor-pointer transition-colors">
                    <div className="w-10 h-10 bg-cat-home/10 rounded flex items-center justify-center">🪑</div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Modern Office Setup</p>
                      <p className="text-xs text-muted">In Furniture</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer action */}
            <div className="bg-muted/5 p-3 text-center border-t border-border">
              <span className="text-xs text-muted font-medium">Press <kbd className="px-1.5 py-0.5 bg-surface border border-border rounded">Enter</kbd> to search</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
