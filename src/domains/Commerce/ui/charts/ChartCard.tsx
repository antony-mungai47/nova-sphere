"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  insight?: { text: string; confidence: number };
  isLoading?: boolean;
  children: React.ReactNode; // The actual chart
  footer?: React.ReactNode;
  cta?: React.ReactNode;
}

export function ChartCard({ title, subtitle, insight, isLoading, children, footer, cta }: ChartCardProps) {
  // Staged loading logic
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (isLoading) {
      setTimeout(() => { setStage(0); }, 0);
      return;
    }

    // Stage 1: Structure & Numbers (Immediate)
    setTimeout(() => setStage(1), 0);
    
    // Stage 2: Chart renders (300ms)
    const t1 = setTimeout(() => setStage(2), 300);
    
    // Stage 3: Insight appears (600ms)
    const t2 = setTimeout(() => setStage(3), 600);
    
    // Stage 4: CTA appears (900ms)
    const t3 = setTimeout(() => setStage(4), 900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isLoading]);

  if (isLoading || stage === 0) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col min-h-[350px]">
        <div className="w-1/2 h-6 bg-muted/50 rounded mb-2 animate-pulse" />
        <div className="w-1/3 h-4 bg-muted/50 rounded mb-8 animate-pulse" />
        <div className="flex-1 w-full bg-muted/30 rounded-xl mb-4 animate-pulse" />
        <div className="w-full h-12 bg-muted/20 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col h-full shadow-sm hover:shadow-soft transition-shadow">
      {/* Header (Stage 1) */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </motion.div>

      {/* Chart (Stage 2) */}
      <AnimatePresence>
        {stage >= 2 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 min-h-[200px] w-full"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Insight (Stage 3) */}
      <AnimatePresence>
        {stage >= 3 && insight && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 rounded-xl bg-cta-primary/5 border border-cta-primary/20 flex items-start gap-3"
          >
            <Sparkles className="w-5 h-5 text-cta-primary flex-shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-sm text-foreground font-medium">{insight.text}</span>
              <span className="text-xs text-cta-primary font-bold mt-1 uppercase tracking-wider">{insight.confidence}% Confidence</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer & CTA (Stage 4) */}
      <AnimatePresence>
        {stage >= 4 && (footer || cta) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 flex items-center justify-between pt-4 border-t border-border"
          >
            <div className="text-sm text-muted-foreground">{footer}</div>
            <div>{cta}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
