"use client";
import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { MOTION } from "@/lib/motion";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface CardProps extends HTMLMotionProps<"div"> {
  variant?: "default" | "elevated" | "glass" | "interactive";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    
    const baseStyles = "rounded-[var(--radius-lg)] overflow-hidden";
    
    const variants = {
      default: "bg-surface border border-border-subtle",
      elevated: "bg-surface-elevated border border-border-default shadow-md",
      glass: "bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] shadow-sm",
      interactive: "bg-surface border border-border-subtle cursor-pointer",
    };

    const isInteractive = variant === "interactive";

    return (
      <motion.div
        ref={ref}
        variants={isInteractive ? MOTION.card : undefined}
        initial={isInteractive ? "rest" : undefined}
        whileHover={isInteractive ? "hover" : undefined}
        whileTap={isInteractive ? "tap" : undefined}
        className={cn(baseStyles, variants[variant], className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = "Card";

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 p-[var(--space-6)]", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-[var(--text-h3)] font-semibold leading-none tracking-tight text-primary", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-[var(--text-small)] text-muted", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-[var(--space-6)] pt-0", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center p-[var(--space-6)] pt-0", className)} {...props} />;
}
