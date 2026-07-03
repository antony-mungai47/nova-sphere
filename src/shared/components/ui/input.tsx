import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { AlertCircle } from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    
    // Generate a unique ID if a label is provided but no ID is given
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full flex flex-col space-y-[var(--space-2)]">
        {label && (
          <label 
            htmlFor={inputId} 
            className="text-[var(--text-small)] font-medium text-secondary"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
              {leftIcon}
            </div>
          )}
          
          <input
            id={inputId}
            type={type}
            className={cn(
              "flex w-full rounded-xl border bg-slate-900/50 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50",
              error ? "border-rose-500 focus-visible:ring-rose-500" : "border-slate-800",
              leftIcon ? "pl-10" : "",
              rightIcon || error ? "pr-10" : "",
              className
            )}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-description` : undefined
            }
            {...props}
          />
          
          {(error || rightIcon) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted flex items-center">
              {error ? <AlertCircle className="w-4 h-4 text-danger" /> : rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} className="text-[var(--text-caption)] text-danger mt-1">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={`${inputId}-description`} className="text-[var(--text-caption)] text-muted mt-1">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
