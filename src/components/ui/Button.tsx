// @ts-nocheck
"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Loader2 } from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "success" | "danger" | "ghost" | "outline";
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
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
      primary: "bg-cta-primary text-white hover:bg-opacity-90 focus-visible:ring-cta-primary",
      secondary: "bg-cta-secondary text-white hover:bg-opacity-90 focus-visible:ring-cta-secondary",
      success: "bg-success text-white hover:bg-opacity-90 focus-visible:ring-success",
      danger: "bg-danger text-white hover:bg-opacity-90 focus-visible:ring-danger",
      ghost: "hover:bg-muted/10 text-foreground focus-visible:ring-border",
      outline: "border-2 border-border hover:bg-muted/5 text-foreground focus-visible:ring-border",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs rounded-button",
      md: "h-10 px-4 py-2 text-sm rounded-button",
      lg: "h-12 px-8 text-base rounded-button",
      icon: "h-10 w-10 rounded-full",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15, ease: "easeOut" }} // Map to Micro token
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
