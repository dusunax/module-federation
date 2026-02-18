import React from 'react';
import Skeleton from '../Skeleton';

/**
 * 실제 Header 렌더 높이 기준 고정값:
 *   mobile(<sm) 65px | sm 75px | md+ 109.5px
 */
function HeaderSkeleton() {
  return (
    <header className="flex h-[65px] sm:h-[75px] md:h-[109.5px] items-center border-b border-[var(--color-border-primary)] bg-[rgba(49,54,71,0.95)] px-3 md:px-5 backdrop-blur-[10px]">
      <nav className="flex w-full items-center justify-between">
        <div>
          <Skeleton className="h-5 w-36 md:h-7 md:w-56" />
          <Skeleton className="mt-1.5 hidden h-3 w-28 sm:block" />
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3">
          <Skeleton className="hidden h-8 w-16 rounded-full md:block" />
          <Skeleton className="hidden h-8 w-8 rounded-full md:block" />
          <Skeleton className="h-10 w-10 rounded-full md:h-8 md:w-8" />
          <Skeleton className="hidden h-8 w-8 rounded-full md:block" />
          <Skeleton className="hidden h-8 w-8 rounded-full md:block" />
          <Skeleton className="h-10 w-10 rounded-full md:hidden" />
        </div>
      </nav>
    </header>
  );
}

export default HeaderSkeleton;
