import React from 'react';
import Skeleton from '../Skeleton';

function OrderDetailSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-3 md:px-5">
      <Skeleton className="mb-6 h-5 w-20" />

      <div className="rounded border border-[var(--color-border-primary)] bg-[var(--color-overlay-2)] p-5">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-16 rounded-sm" />
        </div>

        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="mb-3 flex items-center gap-4 border-b border-[var(--color-border-faded)] pb-3 last:border-0"
          >
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
            <div className="flex-1">
              <Skeleton className="mb-1 h-4 w-28" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrderDetailSkeleton;
