import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action, className, ...props }: EmptyStateProps) {
  return (
    <div 
      className={cn("flex flex-col items-center justify-center p-[var(--space-12)] text-center w-full min-h-[300px]", className)} 
      {...props}
    >
      <div className="w-16 h-16 rounded-full bg-surface-elevated flex items-center justify-center text-muted mb-4 border border-border-subtle">
        {React.isValidElement(icon) ? React.cloneElement(icon, { className: "w-8 h-8 opacity-60" } as any) : icon}
      </div>
      <h3 className="text-[var(--text-h3)] font-semibold text-primary mb-2">{title}</h3>
      {description && (
        <p className="text-[var(--text-body)] text-muted max-w-sm mx-auto mb-6">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
