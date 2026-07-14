"use client";

import React, { useState } from "react";
import { Search, ChevronDown, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface QASearchProps {
  onSearch: (query: string) => void;
  categories: { name: string; count: number }[];
  activeCategory?: string;
  onSelectCategory: (cat: string | undefined) => void;
}

export function QASearch({ onSearch, categories, activeCategory, onSelectCategory }: QASearchProps) {
  const [query, setQuery] = useState("");
  const [isAsking, setIsAsking] = useState(false);

  // Mock duplicate detection
  const showDuplicates = query.length > 5 && query.toLowerCase().includes("battery");

  return (
    <div className="flex flex-col gap-6 mb-8">
      {/* Search Input */}
      <div className="relative flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
               setQuery(e.target.value);
               onSearch(e.target.value);
               if (e.target.value.length > 0) setIsAsking(true);
            }}
            placeholder="Have a question? Search for answers or ask the community..."
            className="w-full bg-surface border border-border rounded-xl pl-12 pr-4 py-4 text-base focus:outline-none focus:ring-2 focus:ring-cta-primary/50 transition-all shadow-sm"
          />
          
          {/* Smart "Similar Questions" Dropdown */}
          <AnimatePresence>
            {isAsking && showDuplicates && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-xl shadow-lg z-50 overflow-hidden"
              >
                <div className="p-3 bg-muted/20 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  We found similar questions
                </div>
                <div className="flex flex-col max-h-[200px] overflow-y-auto">
                   <button className="text-left px-4 py-3 hover:bg-surface-hover text-sm border-b border-border/50 text-foreground transition-colors">
                      What is the expected <span className="bg-warning/20 font-bold px-1 rounded">battery</span> life under heavy use?
                   </button>
                   <button className="text-left px-4 py-3 hover:bg-surface-hover text-sm text-foreground transition-colors">
                      Does the <span className="bg-warning/20 font-bold px-1 rounded">battery</span> degrade fast after a year?
                   </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <button className="px-8 py-4 bg-foreground text-background font-bold rounded-xl whitespace-nowrap hover:bg-foreground/90 transition-colors shadow-sm">
          Ask Question
        </button>
      </div>

      {/* Popular Categories */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-bold text-foreground mr-2">Popular Topics:</span>
        <button
          onClick={() => onSelectCategory(undefined)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
            !activeCategory 
              ? "bg-foreground text-background border-foreground" 
              : "bg-surface text-muted-foreground border-border hover:bg-muted"
          }`}
        >
          All
        </button>
        {categories.map((cat, i) => (
          <button
            key={i}
            onClick={() => onSelectCategory(cat.name === activeCategory ? undefined : cat.name)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
              cat.name === activeCategory 
                ? "bg-cta-primary text-cta-primary-foreground border-cta-primary" 
                : "bg-surface text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            {cat.name} <span className="opacity-70 ml-1">({cat.count})</span>
          </button>
        ))}
      </div>
    </div>
  );
}
