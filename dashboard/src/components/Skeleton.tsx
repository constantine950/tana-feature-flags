import React from "react";

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "" }) => {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
};

export const ProjectCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-6 py-5 shadow-sm">
      <Skeleton className="h-6 w-3/4 mb-3" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-1/2" />
      <div className="mt-4 flex space-x-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
};

export const FlagRowSkeleton: React.FC = () => {
  return (
    <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
      <div className="flex-1">
        <Skeleton className="h-5 w-1/3 mb-2" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      <div className="flex space-x-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
  );
};
