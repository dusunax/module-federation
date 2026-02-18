import React from 'react';
import Skeleton from '../Skeleton';

function OrderListSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-3 md:px-5">
      <Skeleton className="mb-6 h-7 w-28" />

      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="mb-4 rounded border border-[var(--color-border-primary)] bg-[var(--color-overlay-2)] p-4 md:p-5"
        >
          <div className="mb-3 flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-16 rounded-sm" />
          </div>
          <div className="mb-3 flex gap-2">
            {Array.from({ length: 4 }).map((_, j) => (
              <Skeleton key={j} className="h-8 w-8 rounded" />
            ))}
          </div>
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

export default OrderListSkeleton;
