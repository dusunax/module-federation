import React from 'react';
import Skeleton from '../Skeleton';

function ProductListSkeleton() {
  return (
    <div className="mx-auto max-w-[1400px] px-3 md:px-5">
      {/* 상단 바 */}
      <div className="mb-6 flex items-center gap-3">
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>

      {/* 카드 그리드 */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4 md:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col rounded border border-[var(--color-border-primary)] bg-[var(--color-overlay-2)] p-4 md:p-6"
          >
            <Skeleton className="mb-4 h-12 w-12 rounded-full" />
            <Skeleton className="mb-2 h-5 w-3/4" />
            <Skeleton className="mb-1 h-3 w-full" />
            <Skeleton className="mb-1 h-3 w-full" />
            <Skeleton className="mb-4 h-3 w-2/3" />
            <div className="mt-5 flex items-center justify-between border-t border-[var(--color-border-faded)] pt-4">
              <Skeleton className="h-5 w-16 rounded-sm" />
              <Skeleton className="h-4 w-10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductListSkeleton;
