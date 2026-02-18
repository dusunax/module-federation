import React from 'react';
import Skeleton from '../Skeleton';

function CartSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-3 md:px-5">
      <Skeleton className="mb-6 h-7 w-28" />

      {/* 아이템 행 */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="mb-3 flex items-center gap-4 rounded border border-[var(--color-border-primary)] bg-[var(--color-overlay-2)] p-4"
        >
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="flex-1">
            <Skeleton className="mb-2 h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-8 w-20 rounded" />
          <Skeleton className="h-4 w-12" />
        </div>
      ))}

      {/* 하단 합계 */}
      <div className="mt-6 flex items-center justify-between border-t border-[var(--color-border-primary)] pt-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-10 w-32 rounded" />
      </div>
    </div>
  );
}

export default CartSkeleton;
