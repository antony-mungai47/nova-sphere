"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils"; // Wait, I don't have lib/utils yet. I'll define it.

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "outline" | "ghost";
  glow?: boolean;
}

export function AnimatedButton({
  children,
  className,
  variant = "primary",
  glow = false,
  ...props
}: AnimatedButtonProps) {
  const baseStyles = "relative inline-flex items-center justify-center px-8 py-3 text-sm font-medium transition-colors rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-nova-blue focus:ring-offset-2 focus:ring-offset-background";
  
  const variants = {
    primary: "bg-nova-blue text-white hover:bg-nova-blue/80",
    outline: "border border-white/20 text-white hover:bg-white/10",
    ghost: "text-white/80 hover:text-white hover:bg-white/5",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(baseStyles, variants[variant], glow && "shadow-glow-primary", className)}
      {...(props as any)}
    >
      <span className="relative z-10">{children}</span>
      {variant === "primary" && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
      )}
    </motion.button>
  );
}
