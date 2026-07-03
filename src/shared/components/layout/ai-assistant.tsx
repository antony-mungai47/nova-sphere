"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Search, Loader2 } from "lucide-react";
import { useChat } from '@ai-sdk/react';

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { messages, sendMessage, status } = useChat({
    id: 'chat-1',
    messages: [
      { 
        id: '1',
        role: "assistant", 
        content: "Hello! I am Nova, your premium shopping concierge. Looking for a specific watch, the latest tech, or exclusive auctions?",
        parts: [{ type: 'text', text: "Hello! I am Nova..." }]
      } as any
    ]
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    setIsLoading(true);
    await sendMessage({ role: 'user', content: input, parts: [{ type: 'text', text: input }] } as any);
    setInput("");
    setIsLoading(false);
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
                    <h2 className="text-lg font-bold text-white">Nova Intelligence</h2>
                    <p className="text-xs text-nova-silver uppercase tracking-wider">Commerce Copilot</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-nova-silver hover:text-white hover:bg-white/10 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
                {messages.map((msg: any) => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
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
                        <p className="leading-relaxed text-sm whitespace-pre-wrap">{msg.content}</p>
                        
                        {/* Render Tool Invocations gracefully */}
                        {msg.toolInvocations?.map((toolInvocation: any, idx: number) => (
                          <div key={idx} className="mt-3 p-3 bg-black/40 rounded-lg border border-white/5 text-xs text-nova-silver font-mono">
                            <span className="text-nova-blue">{"{ }"}</span> Executing {toolInvocation.toolName}...
                            {toolInvocation.state === 'result' && (
                              <span className="text-emerald-400 ml-2">✓ Success</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-3 max-w-[85%]">
                      <div className="w-8 h-8 rounded-full bg-nova-blue/20 border border-nova-blue/30 flex items-center justify-center flex-shrink-0 mt-1">
                        <Sparkles className="w-4 h-4 text-nova-blue animate-pulse" />
                      </div>
                      <div className="p-4 rounded-2xl bg-nova-blue/5 border border-nova-blue/20 rounded-tl-sm flex items-center gap-2">
                         <Loader2 className="w-4 h-4 text-nova-blue animate-spin" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 sm:p-6 border-t border-white/10 bg-black/50">
                <form onSubmit={handleSubmit} className="relative flex items-center">
                  <Search className="absolute left-4 w-5 h-5 text-nova-silver/50" />
                  <input 
                    type="text" 
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Ask Nova to compare products, check auctions, or track orders..."
                    className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-12 pr-16 text-sm text-white placeholder:text-nova-silver/50 focus:outline-none focus:border-nova-blue transition-colors"
                  />
                  <button 
                    type="submit"
                    disabled={!input.trim() || isLoading}
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