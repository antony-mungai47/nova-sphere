import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info";
  styleType?: "solid" | "subtle" | "outline" | "dot";
}

export function Badge({ 
  className, 
  variant = "default", 
  styleType = "solid", 
  children, 
  ...props 
}: BadgeProps) {
  
  const baseStyles = "inline-flex items-center justify-center font-medium transition-colors px-2.5 py-0.5 rounded-[var(--radius-pill)] text-[var(--text-caption)]";
  
  const styles = {
    solid: {
      default: "bg-surface-elevated text-primary border border-border-default",
      success: "bg-success text-white",
      warning: "bg-warning text-white",
      danger: "bg-danger text-white",
      info: "bg-info text-white",
    },
    subtle: {
      default: "bg-surface-sunken text-secondary",
      success: "bg-success/10 text-success",
      warning: "bg-warning/10 text-warning",
      danger: "bg-danger/10 text-danger",
      info: "bg-info/10 text-info",
    },
    outline: {
      default: "text-primary border border-border-default",
      success: "text-success border border-success",
      warning: "text-warning border border-warning",
      danger: "text-danger border border-danger",
      info: "text-info border border-info",
    },
    dot: {
      default: "bg-transparent text-primary pl-1.5",
      success: "bg-transparent text-success pl-1.5",
      warning: "bg-transparent text-warning pl-1.5",
      danger: "bg-transparent text-danger pl-1.5",
      info: "bg-transparent text-info pl-1.5",
    },
  };

  const dotColors = {
    default: "bg-secondary",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    info: "bg-info",
  };

  return (
    <div className={cn(baseStyles, styles[styleType][variant], className)} {...props}>
      {styleType === "dot" && (
        <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", dotColors[variant])} />
      )}
      {children}
    </div>
  );
}
