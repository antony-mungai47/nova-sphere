"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { direction: "up" | "down" | "neutral"; value: string };
  isLoading?: boolean;
}

export function MetricCard({ title, value, subtitle, trend, isLoading }: MetricCardProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setTimeout(() => { setShow(false); }, 0);
      return;
    }
    const t = setTimeout(() => setShow(true), 200); // Slight delay for staged feel
    return () => clearTimeout(t);
  }, [isLoading]);

  if (isLoading || !show) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-6">
        <div className="w-1/2 h-4 bg-muted/50 rounded mb-4 animate-pulse" />
        <div className="w-3/4 h-10 bg-muted/30 rounded mb-2 animate-pulse" />
        <div className="w-1/3 h-3 bg-muted/20 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface border border-border rounded-2xl p-6 shadow-sm hover:shadow-soft transition-all"
    >
      <h4 className="text-sm font-medium text-muted-foreground mb-2">{title}</h4>
      <div className="flex items-end gap-3 mb-1">
        <span className="text-3xl font-bold text-foreground">{value}</span>
        {trend && (
          <span className={`text-sm font-bold mb-1 ${
            trend.direction === "up" ? "text-emerald-500" : 
            trend.direction === "down" ? "text-danger" : "text-muted-foreground"
          }`}>
            {trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "−"} {trend.value}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </motion.div>
  );
}
