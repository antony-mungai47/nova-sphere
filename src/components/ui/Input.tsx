"use client";

import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, leftIcon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-button border border-border bg-surface px-3 py-2 text-sm placeholder:text-muted transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-secondary disabled:cursor-not-allowed disabled:opacity-50",
            leftIcon && "pl-10",
            error && "border-danger focus-visible:ring-danger",
            className
          )}
          ref={ref}
          aria-invalid={error ? "true" : "false"}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";
