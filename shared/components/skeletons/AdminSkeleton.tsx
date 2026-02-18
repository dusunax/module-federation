import React from 'react';
import Skeleton from '../Skeleton';

function AdminSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4">
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-9 w-16 rounded" />
      </div>

      <div className="overflow-hidden rounded-lg border border-[var(--color-border-primary)]">
        {/* 테이블 헤더 */}
        <div className="flex gap-4 border-b border-[var(--color-border-primary)] bg-[var(--color-overlay-2)] px-4 py-3">
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-14" />
        </div>

        {/* 데이터 행 */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-[var(--color-border-faded)] px-4 py-3"
          >
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-6 w-6 rounded" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="ml-auto h-6 w-12 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminSkeleton;
