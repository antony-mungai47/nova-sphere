import * as React from "react";
import { Loader2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "primary" | "accent" | "muted";
}

export function Spinner({ className, size = "md", variant = "accent", ...props }: SpinnerProps) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const variants = {
    primary: "text-primary",
    accent: "text-accent",
    muted: "text-muted",
  };

  return (
    <div className={cn("inline-flex items-center justify-center", className)} {...props} role="status">
      <Loader2 className={cn("animate-spin", sizes[size], variants[variant])} />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
