import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  pulse?: boolean;
}

export function Skeleton({ className, pulse = true, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-md bg-white/5 border border-white/5",
        pulse && "animate-pulse",
        className
      )}
      {...props}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="glass-panel p-5 rounded-3xl h-full border border-white/10 flex flex-col bg-black/40">
      <Skeleton className="w-full aspect-square mb-5 rounded-2xl" />
      <div className="flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="w-16 h-4" />
          <Skeleton className="w-8 h-4" />
        </div>
        <Skeleton className="w-3/4 h-6 mb-2" />
        <Skeleton className="w-1/2 h-6 mb-4" />
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
          <Skeleton className="w-20 h-8" />
          <Skeleton className="w-10 h-10 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
