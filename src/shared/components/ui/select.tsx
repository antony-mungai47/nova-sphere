import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ChevronDown, AlertCircle } from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, leftIcon, id, children, ...props }, ref) => {
    
    const generatedId = React.useId();
    const selectId = id || generatedId;

    return (
      <div className="w-full flex flex-col space-y-[var(--space-2)]">
        {label && (
          <label 
            htmlFor={selectId} 
            className="text-[var(--text-small)] font-medium text-secondary"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          <select
            id={selectId}
            className={cn(
              "flex w-full appearance-none rounded-[var(--radius-md)] border bg-surface-sunken px-3 py-2 pr-10 text-[var(--text-body)] text-foreground transition-colors focus-ring disabled:cursor-not-allowed disabled:opacity-50",
              error ? "border-danger focus-ring-danger" : "border-border-default",
              leftIcon ? "pl-10" : "",
              className
            )}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${selectId}-error` : helperText ? `${selectId}-description` : undefined
            }
            {...props}
          >
            {children}
          </select>
          
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-2">
            {error && <AlertCircle className="w-4 h-4 text-danger" />}
            <ChevronDown className="w-4 h-4 text-muted" />
          </div>
        </div>

        {error && (
          <p id={`${selectId}-error`} className="text-[var(--text-caption)] text-danger mt-1">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={`${selectId}-description`} className="text-[var(--text-caption)] text-muted mt-1">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
