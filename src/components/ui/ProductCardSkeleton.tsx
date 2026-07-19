import { Card } from "./card";
import { Skeleton } from "./Skeleton";

export function ProductCardSkeleton() {
  return (
    <Card className="flex flex-col h-full overflow-hidden p-0">
      {/* Image Skeleton */}
      <Skeleton className="h-56 w-full rounded-none rounded-t-card" />
      
      <div className="p-5 flex flex-col flex-grow">
        {/* Brand & Rating Skeleton */}
        <div className="flex justify-between items-start mb-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>

        {/* Title Skeleton */}
        <Skeleton className="h-5 w-full mb-2" />
        <Skeleton className="h-5 w-2/3 mb-4" />

        {/* Price & Action Skeleton */}
        <div className="mt-auto pt-4 flex items-end justify-between">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
    </Card>
  );
}
