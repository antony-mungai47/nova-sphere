"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Paperclip } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export function SupportWidget() {
  const { user, isLoaded } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEmail(user.primaryEmailAddress?.emailAddress || "");
    }
  }, [user, isLoaded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message || !subject || (!user && !email)) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          message,
          email: user ? user.primaryEmailAddress?.emailAddress : email,
          userId: user ? user.id : null,
        })
      });
      
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          setSuccess(false);
          setMessage("");
          setSubject("");
        }, 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-nova-blue text-white shadow-[0_0_20px_rgba(59,130,246,0.5)] flex items-center justify-center z-50 hover:scale-110 transition-transform"
        onClick={() => setIsOpen(true)}
        whileHover={{ rotate: 15 }}
        whileTap={{ scale: 0.9 }}
      >
        <MessageSquare className="w-6 h-6" />
      </motion.button>

      {/* Widget Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] glass-panel border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 flex flex-col bg-black/80 backdrop-blur-xl"
          >
            {/* Header */}
            <div className="p-4 bg-nova-blue/20 border-b border-nova-blue/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-nova-blue flex items-center justify-center">
                  <span className="text-white font-bold text-sm">NS</span>
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Nova Sphere Support</h3>
                  <p className="text-nova-silver text-[10px] uppercase">We typically reply in 2 hours</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {success ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-green-400" />
                  </div>
                  <h4 className="text-white font-bold mb-2">Message Sent</h4>
                  <p className="text-nova-silver text-sm">Our premium support team will get back to you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {!user && (
                    <div>
                      <label className="text-xs text-nova-silver uppercase tracking-wider mb-1 block">Your Email</label>
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-nova-blue" 
                        placeholder="john@example.com"
                      />
                    </div>
                  )}
                  <div>
                    <label className="text-xs text-nova-silver uppercase tracking-wider mb-1 block">Subject</label>
                    <input 
                      type="text" 
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-nova-blue" 
                      placeholder="How can we help?"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-nova-silver uppercase tracking-wider mb-1 block">Message</label>
                    <textarea 
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-nova-blue min-h-[100px] resize-none" 
                      placeholder="Describe your issue or question in detail..."
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-nova-blue text-white font-bold py-3 rounded-lg hover:bg-nova-blue/80 transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"} <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}