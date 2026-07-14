"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "./Button";

export interface CategoryCardProps {
  title: string;
  productCount: number;
  icon: string;
  accentColorClass: string; // e.g. "bg-cat-electronics"
  href?: string;
}

export function CategoryCard({ title, productCount, icon, accentColorClass, href = "#" }: CategoryCardProps) {
  return (
    <motion.a
      href={href}
      className="group relative block overflow-hidden rounded-card bg-surface border border-border shadow-soft hover:shadow-hover transition-all duration-motion-medium h-48 cursor-pointer"
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {/* Background Gradient Shift on Hover */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-motion-standard",
        accentColorClass
      )} />
      
      <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
        <div className="flex justify-between items-start">
          <motion.div 
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center text-2xl text-white shadow-soft",
              accentColorClass
            )}
            whileHover={{ rotate: 5, scale: 1.1 }}
          >
            {icon}
          </motion.div>
          
          <motion.div 
            className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-muted group-hover:bg-foreground group-hover:text-background transition-colors duration-motion-fast"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <ArrowRight size={16} />
          </motion.div>
        </div>

        <div>
          <h3 className="font-heading font-bold text-xl text-foreground mb-1 group-hover:text-cta-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm font-medium text-muted">
            {productCount.toLocaleString()} Products
          </p>
        </div>
      </div>
    </motion.a>
  );
}
