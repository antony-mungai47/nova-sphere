"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Store, Zap, Star, AlertTriangle, Tag } from "lucide-react";
import { usePulse, PulseEvent } from "./PulseEngine";

export function PulseUI() {
  const { events, removeEvent } = usePulse();

  return (
    <div className="fixed bottom-6 left-6 z-[250] flex flex-col space-y-3 pointer-events-none">
      <AnimatePresence>
        {events.map((event) => (
          <PulseToast key={event.id} event={event} onRemove={() => removeEvent(event.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function PulseToast({ event, onRemove }: { event: PulseEvent; onRemove: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, 6000); // Fade out after 6 seconds
    return () => clearTimeout(timer);
  }, [onRemove]);

  const config = {
    "purchase": { icon: <ShoppingBag size={14} />, color: "text-success", bg: "bg-success/10", border: "border-success/20" },
    "vendor": { icon: <Store size={14} />, color: "text-cta-secondary", bg: "bg-cta-secondary/10", border: "border-cta-secondary/20" },
    "flash-deal": { icon: <Zap size={14} />, color: "text-cta-primary", bg: "bg-cta-primary/10", border: "border-cta-primary/20" },
    "review": { icon: <Star size={14} />, color: "text-warning", bg: "bg-warning/10", border: "border-warning/20" },
    "stock": { icon: <AlertTriangle size={14} />, color: "text-danger", bg: "bg-danger/10", border: "border-danger/20" },
    "coupon": { icon: <Tag size={14} />, color: "text-cat-beauty", bg: "bg-cat-beauty/10", border: "border-cat-beauty/20" }
  }[event.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`flex items-center space-x-3 px-4 py-3 rounded-card bg-surface/90 backdrop-blur-md border ${config.border} shadow-soft pointer-events-auto cursor-pointer w-72`}
      onClick={onRemove}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${config.bg} ${config.color}`}>
        {config.icon}
      </div>
      <p className="text-sm font-medium text-foreground leading-tight">
        {event.message}
      </p>
    </motion.div>
  );
}
