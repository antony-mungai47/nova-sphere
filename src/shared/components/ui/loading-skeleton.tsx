import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function LoadingSkeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-[var(--radius-md)] bg-surface-elevated/80 border border-border-subtle", className)}
      {...props}
    />
  );
}

// Pre-built skeleton patterns for common UI elements
export function CardSkeleton() {
  return (
    <div className="flex flex-col space-y-[var(--space-3)] p-[var(--space-4)] border border-border-subtle rounded-[var(--radius-lg)] bg-surface">
      <LoadingSkeleton className="h-[200px] w-full rounded-[var(--radius-md)]" />
      <LoadingSkeleton className="h-[var(--space-6)] w-3/4 mt-[var(--space-4)]" />
      <LoadingSkeleton className="h-[var(--space-4)] w-1/2" />
      <div className="flex items-center justify-between mt-[var(--space-4)] pt-[var(--space-4)] border-t border-border-subtle">
        <LoadingSkeleton className="h-[var(--space-6)] w-1/4" />
        <LoadingSkeleton className="h-[var(--space-8)] w-[var(--space-20)] rounded-[var(--radius-md)]" />
      </div>
    </div>
  );
}

export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-[var(--space-2)] w-full">
      {Array.from({ length: lines }).map((_, i) => (
        <LoadingSkeleton 
          key={i} 
          className={cn("h-[var(--space-4)]", i === lines - 1 ? "w-2/3" : "w-full")} 
        />
      ))}
    </div>
  );
}
