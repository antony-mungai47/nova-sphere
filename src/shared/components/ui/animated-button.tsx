"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSafeMotion } from "@/lib/design-system/motion";
import { motionTokens } from "@/lib/design-system/motion";

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "outline" | "ghost";
  glow?: boolean;
  isLoading?: boolean;
  isSuccess?: boolean;
}

export function AnimatedButton({
  children,
  className,
  variant = "primary",
  glow = false,
  isLoading = false,
  isSuccess = false,
  disabled,
  ...props
}: AnimatedButtonProps) {
  const { shouldReduceMotion } = useSafeMotion();
  const [internalSuccess, setInternalSuccess] = useState(false);

  // Auto-reset success state
  useEffect(() => {
    if (isSuccess) {
      const timerShow = setTimeout(() => setInternalSuccess(true), 0);
      const timerHide = setTimeout(() => setInternalSuccess(false), 2000);
      return () => {
        clearTimeout(timerShow);
        clearTimeout(timerHide);
      };
    }
  }, [isSuccess]);

  const showSuccess = isSuccess || internalSuccess;
  const isDisabled = disabled || isLoading || showSuccess;

  const baseStyles = "relative inline-flex items-center justify-center px-8 py-3 text-sm font-medium transition-colors rounded-full overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900";
  
  const variants = {
    primary: "bg-emerald-500 text-white hover:bg-emerald-600",
    outline: "border border-slate-600 text-slate-200 hover:bg-slate-800",
    ghost: "text-slate-300 hover:text-white hover:bg-white/5",
  };

  const scaleHover = shouldReduceMotion ? 1 : motionTokens.scale.hover;
  const scaleTap = shouldReduceMotion ? 1 : motionTokens.scale.pressed;

  return (
    <motion.button
      whileHover={isDisabled ? {} : { scale: scaleHover }}
      whileTap={isDisabled ? {} : { scale: scaleTap }}
      transition={{ duration: motionTokens.duration.fast, ease: motionTokens.easing.standard }}
      className={cn(
        baseStyles, 
        variants[variant], 
        glow && !isDisabled && "shadow-[0_0_20px_rgba(16,185,129,0.3)]",
        isDisabled && "opacity-50 cursor-not-allowed",
        showSuccess && "bg-emerald-600",
        className
      )}
      disabled={isDisabled}
      {...(props as any)}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </motion.div>
        ) : showSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </motion.div>
        ) : (
          <motion.span
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex items-center gap-2"
          >
            {children}
          </motion.span>
        )}
      </AnimatePresence>
      
      {!shouldReduceMotion && variant === "primary" && !isDisabled && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: motionTokens.duration.luxury, ease: "easeInOut" }}
        />
      )}
    </motion.button>
  );
}
