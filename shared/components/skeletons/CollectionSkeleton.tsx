import React from 'react';
import Skeleton from '../Skeleton';

function CollectionSkeleton() {
  return (
    <div className="max-w-225 mx-auto px-5 py-10">
      {/* 헤더 */}
      <div className="mb-10 border-b border-[rgba(255,248,212,0.15)] pb-6">
        <Skeleton className="mb-2 h-8 w-28" />
        <Skeleton className="mb-4 h-4 w-36" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-2.5 flex-1 rounded-full" />
          <Skeleton className="h-4 w-10" />
        </div>
      </div>

      {/* 카드 그리드 */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-2 rounded-lg border-2 border-[var(--color-border-faded)] bg-[var(--color-overlay-2)] p-5"
          >
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default CollectionSkeleton;
