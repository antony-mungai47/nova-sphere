"use client";

import React, { useState } from "react";
import { MessageCircle, X, HelpCircle, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function LiveSupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { sender: "system", text: "Hello! Welcome to Nova Sphere. How can we help you today?" }
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    // Add user message
    setChatHistory(prev => [...prev, { sender: "user", text: message }]);
    const currentMessage = message;
    setMessage("");

    // Simulate auto-reply (In the future, this hooks up to the AI assistant or real support agent via DB)
    setTimeout(() => {
      setChatHistory(prev => [...prev, { 
        sender: "system", 
        text: "Thank you for reaching out. A Nova Sphere support specialist will review your request shortly." 
      }]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-nova-blue text-white rounded-full flex items-center justify-center shadow-glow-primary hover:scale-110 transition-transform z-50 ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        aria-label="Live Support"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] max-h-[80vh] glass-panel bg-black/80 rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden z-50"
          >
            {/* Header */}
            <div className="bg-nova-blue/20 border-b border-white/10 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-nova-blue flex items-center justify-center">
                  <HelpCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Nova Sphere Support</h3>
                  <p className="text-nova-silver text-xs">We typically reply in a few minutes.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-nova-silver hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                    msg.sender === 'user' 
                      ? 'bg-nova-blue text-white rounded-br-none' 
                      : 'bg-white/10 text-nova-silver rounded-bl-none border border-white/5'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-white/5">
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full bg-black/50 border border-white/10 rounded-full py-2 pl-4 pr-12 text-sm text-white placeholder:text-nova-silver/50 focus:outline-none focus:border-nova-blue transition-colors"
                />
                <button 
                  type="submit"
                  disabled={!message.trim()}
                  className="absolute right-2 w-8 h-8 rounded-full bg-nova-blue text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-nova-blue/80 transition-colors"
                >
                  <Send className="w-4 h-4 -ml-0.5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
