"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Search, ArrowRight } from "lucide-react";
import Link from "next/link";

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: "assistant" | "user", content: string, links?: { label: string, url: string }[] }[]>([
    { 
      role: "assistant", 
      content: "Hello! I am Nova, your premium shopping concierge. Looking for a specific watch, the latest tech, or exclusive auctions?" 
    }
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isThinking) return;

    setChatHistory(prev => [...prev, { role: "user", content: query }]);
    const currentQuery = query.toLowerCase();
    setQuery("");
    setIsThinking(true);

    setTimeout(() => {
      setIsThinking(false);
      
      // Basic mock AI routing/recommendation logic
      if (currentQuery.includes("watch") || currentQuery.includes("rolex")) {
        setChatHistory(prev => [...prev, { 
          role: "assistant", 
          content: "I recommend exploring our Luxury Timepieces collection. We have verified Rolex and Omega models currently available.",
          links: [{ label: "View Luxury Watches", url: "/store?category=watches" }]
        }]);
      } else if (currentQuery.includes("auction") || currentQuery.includes("bid")) {
        setChatHistory(prev => [...prev, { 
          role: "assistant", 
          content: "Our Premium Auctions feature rare and exclusive items. There are several ending within the next 24 hours.",
          links: [{ label: "Go to Auctions", url: "/auctions" }]
        }]);
      } else if (currentQuery.includes("order") || currentQuery.includes("track")) {
        setChatHistory(prev => [...prev, { 
          role: "assistant", 
          content: "You can track all your recent orders and their shipping status directly from your account dashboard.",
          links: [{ label: "My Orders", url: "/account" }]
        }]);
      } else {
        setChatHistory(prev => [...prev, { 
          role: "assistant", 
          content: `I've found some premium items matching "${currentQuery}". Let me take you to the search results.`,
          links: [{ label: "View Results", url: `/store?search=${encodeURIComponent(currentQuery)}` }]
        }]);
      }
    }, 1200);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-nova-blue/10 hover:border-nova-blue/30 transition-all group"
      >
        <Sparkles className="w-4 h-4 text-nova-blue group-hover:animate-pulse" />
        <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors hidden sm:block">Ask Nova AI</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-black/90 border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(59,130,246,0.15)] flex flex-col overflow-hidden"
              style={{ maxHeight: "80vh", height: "600px" }}
            >
              {/* Header */}
              <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-nova-blue/10 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-nova-blue flex items-center justify-center shadow-glow-primary">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Nova AI Assistant</h2>
                    <p className="text-xs text-nova-silver uppercase tracking-wider">Discovery & Routing Engine</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-nova-silver hover:text-white hover:bg-white/10 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
                {chatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className="flex items-start gap-3 max-w-[85%]">
                      {msg.role === "assistant" && (
                        <div className="w-8 h-8 rounded-full bg-nova-blue/20 border border-nova-blue/30 flex items-center justify-center flex-shrink-0 mt-1">
                          <Sparkles className="w-4 h-4 text-nova-blue" />
                        </div>
                      )}
                      
                      <div className={`p-4 rounded-2xl ${
                        msg.role === "user" 
                          ? "bg-white/10 text-white rounded-tr-sm border border-white/10" 
                          : "bg-nova-blue/5 text-nova-silver border border-nova-blue/20 rounded-tl-sm"
                      }`}>
                        <p className="leading-relaxed text-sm">{msg.content}</p>
                        
                        {msg.links && msg.links.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {msg.links.map((link, i) => (
                              <Link 
                                key={i} 
                                href={link.url}
                                onClick={() => setIsOpen(false)}
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-nova-blue text-white text-xs font-bold hover:bg-nova-blue/80 transition-colors"
                              >
                                {link.label} <ArrowRight className="w-3 h-3" />
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isThinking && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-3 max-w-[85%]">
                      <div className="w-8 h-8 rounded-full bg-nova-blue/20 border border-nova-blue/30 flex items-center justify-center flex-shrink-0 mt-1">
                        <Sparkles className="w-4 h-4 text-nova-blue animate-pulse" />
                      </div>
                      <div className="p-4 rounded-2xl bg-nova-blue/5 border border-nova-blue/20 rounded-tl-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-nova-blue animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 rounded-full bg-nova-blue animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 rounded-full bg-nova-blue animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 sm:p-6 border-t border-white/10 bg-black/50">
                <form onSubmit={handleSend} className="relative flex items-center">
                  <Search className="absolute left-4 w-5 h-5 text-nova-silver/50" />
                  <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask Nova about products, orders, or categories..."
                    className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-12 pr-16 text-sm text-white placeholder:text-nova-silver/50 focus:outline-none focus:border-nova-blue transition-colors"
                  />
                  <button 
                    type="submit"
                    disabled={!query.trim() || isThinking}
                    className="absolute right-2 w-10 h-10 rounded-full bg-nova-blue text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-nova-blue/80 transition-colors shadow-glow-primary"
                  >
                    <Send className="w-4 h-4 -ml-0.5" />
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}