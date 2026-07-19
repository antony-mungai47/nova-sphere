"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Mic, Camera, X, ArrowRight, Clock, TrendingUp } from "lucide-react";
import { useDiscoveryUI, useDiscovery, useSuggestions } from "../sdk/hooks";
import { Engine } from "../engine/DiscoveryEngine";

export function DiscoveryTakeover() {
  const { isOpen, close } = useDiscoveryUI();
  const { search, results, isSearching } = useDiscovery();
  const { suggestions, fetchSuggestions } = useSuggestions();
  
  const [query, setQuery] = useState("");
  const [trending, setTrending] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // small delay to allow animation to complete
      setTimeout(() => inputRef.current?.focus(), 100);
      
      // Fetch initial discovery modules
      Engine.getTrendingSearches().then(setTrending);
      Engine.getRecentSearches().then(setRecent);
    } else if (!isOpen) {
      setQuery("");
    }
  }, [isOpen]);

  // Handle escape to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) close();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, close]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    fetchSuggestions(val);
  };

  const handleSearch = (rawInput: string) => {
    if (!rawInput.trim()) return;
    setQuery(rawInput); // update UI if clicked from a suggestion
    search({ modality: "text", rawInput });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-xl flex flex-col"
        >
          {/* Top Bar / Omnibar */}
          <div className="w-full border-b border-border bg-surface shadow-sm relative z-10">
            <div className="container mx-auto px-4 max-w-5xl flex items-center h-20 gap-4">
              <Search className="w-6 h-6 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleInput}
                onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
                placeholder="Search products, brands, or ask a question..."
                className="flex-1 bg-transparent border-none outline-none text-2xl font-medium text-foreground placeholder:text-muted-foreground"
              />
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => alert("Mock Voice Search: 'I'm looking for black running shoes'")}
                  className="p-3 hover:bg-muted/30 rounded-full transition-colors text-muted-foreground hover:text-foreground"
                  aria-label="Voice Search"
                >
                  <Mic className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => alert("Mock Visual Search: Opening camera/upload overlay")}
                  className="p-3 hover:bg-muted/30 rounded-full transition-colors text-muted-foreground hover:text-foreground"
                  aria-label="Visual Search"
                >
                  <Camera className="w-5 h-5" />
                </button>
                <div className="w-px h-8 bg-border mx-2" />
                <button 
                  onClick={close}
                  className="p-3 bg-muted/20 hover:bg-muted/40 rounded-full transition-colors text-foreground"
                  aria-label="Close search"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto w-full">
            <div className="container mx-auto px-4 max-w-5xl py-8">
              
              {/* State 1: Discovery (Empty query) */}
              {query.length === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">
                      <TrendingUp className="w-4 h-4" /> Trending Now
                    </h3>
                    <ul className="flex flex-col gap-1">
                      {trending.map(t => (
                        <li key={t}>
                          <button onClick={() => handleSearch(t)} className="flex items-center justify-between w-full p-3 text-left rounded-xl hover:bg-surface transition-colors">
                            <span className="text-foreground font-medium">{t}</span>
                            <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">
                      <Clock className="w-4 h-4" /> Recent Searches
                    </h3>
                    <ul className="flex flex-col gap-1">
                      {recent.map(r => (
                        <li key={r}>
                          <button onClick={() => handleSearch(r)} className="flex items-center justify-between w-full p-3 text-left rounded-xl hover:bg-surface transition-colors text-muted-foreground hover:text-foreground">
                            <span>{r}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* State 2: Autocomplete Suggestions (Typing, no results fetched yet) */}
              {query.length > 0 && results.length === 0 && !isSearching && (
                 <ul className="flex flex-col max-w-2xl">
                   {suggestions.map(s => (
                     <li key={s}>
                       <button 
                         onClick={() => handleSearch(s)} 
                         className="flex items-center gap-4 w-full p-4 text-left border-b border-border hover:bg-surface transition-colors"
                       >
                         <Search className="w-4 h-4 text-muted-foreground" />
                         <span className="text-lg font-medium text-foreground">{s}</span>
                       </button>
                     </li>
                   ))}
                   {suggestions.length === 0 && (
                     <div className="p-4 text-muted-foreground">Press Enter to search for "{query}"</div>
                   )}
                 </ul>
              )}

              {/* State 3: Search Results */}
              {isSearching ? (
                 <div className="flex items-center justify-center py-20">
                   <div className="w-8 h-8 border-4 border-cta-primary border-t-transparent rounded-full animate-spin" />
                 </div>
              ) : results.length > 0 ? (
                 <div>
                   <h3 className="text-sm font-bold text-muted-foreground mb-6 uppercase tracking-wider">Results for "{query}"</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {results.map(r => (
                       <div key={r.id} className="bg-surface border border-border p-4 rounded-2xl flex items-start gap-4 hover:shadow-soft transition-shadow cursor-pointer">
                         {r.thumbnail && (
                           <img src={r.thumbnail} alt={r.title} className="w-16 h-16 object-cover rounded-lg" />
                         )}
                         <div>
                           <h4 className="font-bold text-foreground text-sm">{r.title}</h4>
                           {r.subtitle && <p className="text-xs text-muted-foreground mt-1">{r.subtitle}</p>}
                           <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-muted/50 text-muted-foreground uppercase mt-2">
                             {r.type}
                           </span>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
              ) : null}

              {/* State 4: Zero Results Fallback */}
              {query.length > 0 && results.length === 0 && !isSearching && suggestions.length === 0 && (
                 <div className="text-center py-20 max-w-lg mx-auto">
                   <div className="w-16 h-16 mx-auto mb-6 bg-muted/20 rounded-full flex items-center justify-center">
                     <Search className="w-8 h-8 text-muted-foreground" />
                   </div>
                   <h3 className="text-xl font-bold text-foreground mb-2">No exact match found</h3>
                   <p className="text-muted-foreground mb-8">We couldn't find exactly what you were looking for, but here are some popular alternatives.</p>
                   {/* Here we would inject the ZeroResultsState component which pulls Trending & Similar */}
                 </div>
              )}

            </div>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
