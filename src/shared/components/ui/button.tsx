"use client";
import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { MOTION } from "@/lib/motion";
import { Loader2 } from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline" | "icon";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { 
      className, 
      variant = "primary", 
      size = "md", 
      isLoading = false, 
      leftIcon, 
      rightIcon, 
      children, 
      disabled, 
      ...props 
    }, 
    ref
  ) => {
    
    const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus-ring disabled:opacity-50 disabled:pointer-events-none rounded-[var(--radius-md)] min-h-[var(--touch-target-min)] md:min-h-0";
    
    const variants = {
      primary: "bg-accent text-inverse hover:bg-accent-hover shadow-glow-accent",
      secondary: "bg-surface-elevated text-primary hover:bg-surface-sunken border border-border-default shadow-sm",
      ghost: "bg-transparent text-primary hover:bg-surface-elevated",
      danger: "bg-danger text-white hover:opacity-90 shadow-sm",
      outline: "bg-transparent text-primary border border-border-default hover:bg-surface-elevated",
      icon: "bg-surface-elevated text-primary hover:bg-surface-sunken border border-border-default rounded-full shadow-sm",
    };

    const sizes = {
      sm: "text-[var(--text-small)] px-[var(--space-3)] py-[var(--space-2)]",
      md: "text-[var(--text-body)] px-[var(--space-4)] py-[var(--space-2)]",
      lg: "text-[var(--text-body)] px-[var(--space-6)] py-[var(--space-3)]",
      icon: "p-[var(--space-2)] aspect-square",
    };

    const isIconOnly = variant === "icon" || size === "icon";

    return (
      <motion.button
        ref={ref}
        whileHover={disabled || isLoading ? undefined : MOTION.hover}
        whileTap={disabled || isLoading ? undefined : MOTION.press}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
        ) : leftIcon ? (
          <span className={cn("inline-flex", !isIconOnly && "mr-2")}>{leftIcon}</span>
        ) : null}
        
        {!isIconOnly && (children as React.ReactNode)}
        
        {!isLoading && rightIcon && !isIconOnly && (
          <span className="inline-flex ml-2">{rightIcon}</span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
