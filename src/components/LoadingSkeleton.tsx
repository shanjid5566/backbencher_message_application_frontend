import React from "react";

interface LoadingSkeletonProps {
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  count = 1,
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-3 border-b border-slate-800 animate-pulse">
          <div className="flex gap-3 items-start">
            <div className="w-12 h-12 rounded-full bg-slate-700" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-700 rounded w-3/4" />
              <div className="h-3 bg-slate-700 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};
