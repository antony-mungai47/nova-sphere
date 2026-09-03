import React from "react";
import { SkeletonCard } from "@/shared/components/ui/skeleton";

export default function StoreLoading() {
  return (
    <div className="min-h-screen bg-black pt-32 pb-24">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Skeleton */}
          <div className="hidden lg:block w-64 flex-shrink-0 space-y-8">
            <div className="w-full h-8 bg-white/5 rounded-md animate-pulse mb-6" />
            <div className="w-full h-40 bg-white/5 rounded-md animate-pulse mb-6" />
            <div className="w-full h-40 bg-white/5 rounded-md animate-pulse" />
          </div>

          {/* Grid Skeleton */}
          <div className="flex-1">
            <div className="flex justify-between mb-8">
              <div className="w-32 h-6 bg-white/5 rounded-md animate-pulse" />
              <div className="w-48 h-10 bg-white/5 rounded-md animate-pulse" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
