import React from 'react';

function CurrentConditionSkeleton() {
  return (
    <div className="flex w-full pl-4 items-center justify-start" aria-label="current-conditions-skeleton">
      <div className="ml-0 h-24 w-full rounded-full p-0.5 sm:ml-8 md:ml-0 md:h-40 md:w-40 md:p-1 bg-[var(--color-overlay-3)]">
        <div className="flex h-full w-full flex-wrap items-center justify-center gap-x-2 gap-y-0 rounded-full bg-[var(--color-overlay-2)] shadow-[inset_0_0_30px_rgba(0,0,0,0.35)] md:flex-col sm:gap-x-4">
          <div className="animate-pulse rounded bg-white/15 px-8 py-2 sm:px-10 md:px-6 md:py-1.5" />
          <div className="order-last w-full max-w-[140px] animate-pulse rounded bg-white/10 py-1 md:order-0 md:max-w-[80px]" />
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 animate-pulse rounded-full bg-white/15 md:h-9 md:w-9" />
            <div className="h-5 w-10 animate-pulse rounded bg-white/15" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CurrentConditionSkeleton;
