import React from 'react';
import Skeleton from '../Skeleton';

const CHART_BAR_HEIGHTS = [
  'h-[40%]', 'h-[65%]', 'h-[50%]', 'h-[80%]', 'h-[35%]', 'h-[70%]', 'h-[55%]',
  'h-[45%]', 'h-[75%]', 'h-[60%]', 'h-[85%]', 'h-[50%]', 'h-[40%]', 'h-[70%]',
];

export function ChartSkeleton() {
  return (
    <div className="flex h-[200px] items-center justify-center">
      <div className="flex h-full w-full flex-col justify-end gap-1 px-4">
        <div className="flex items-end gap-2">
          {CHART_BAR_HEIGHTS.map((h, i) => (
            <Skeleton key={i} className={`flex-1 ${h}`} />
          ))}
        </div>
        <Skeleton className="h-px w-full" />
      </div>
    </div>
  );
}

export function RecentOrdersSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-md border border-[var(--color-border-faded)] bg-[var(--color-overlay-15)] px-3 py-2"
        >
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-3 w-8" />
        </div>
      ))}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-3xl">
      <Skeleton className="mb-4 h-8 w-28" />

      {/* 차트 섹션 */}
      <section className="mb-6 rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-overlay-1)] p-4">
        <Skeleton className="mb-3 h-4 w-40" />
        <ChartSkeleton />
      </section>

      {/* 요약 */}
      <section className="mb-6 rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-overlay-1)] p-4">
        <Skeleton className="mb-3 h-4 w-12" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <div className="rounded-md border border-[var(--color-border-faded)] bg-[var(--color-overlay-15)] p-3">
            <Skeleton className="mb-2 h-3 w-20" />
            <Skeleton className="h-6 w-12" />
          </div>
          <div className="rounded-md border border-[var(--color-border-faded)] bg-[var(--color-overlay-15)] p-3">
            <Skeleton className="mb-2 h-3 w-16" />
            <Skeleton className="h-6 w-12" />
          </div>
        </div>
      </section>

      {/* 최근 기록 */}
      <section className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-overlay-1)] p-4">
        <Skeleton className="mb-3 h-4 w-24" />
        <RecentOrdersSkeleton />
      </section>
    </div>
  );
}

export default DashboardSkeleton;
