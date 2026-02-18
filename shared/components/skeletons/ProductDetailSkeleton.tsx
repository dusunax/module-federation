import React from 'react';
import Skeleton from '../Skeleton';

function ProductDetailSkeleton() {
  return (
    <div className="mx-auto max-w-[900px] p-3 md:p-5">
      {/* 뒤로가기 */}
      <Skeleton className="mb-6 h-5 w-20" />

      <div className="rounded border border-[var(--color-border-primary)] bg-[var(--color-overlay-2)] p-5 md:p-10">
        <div className="mb-6 md:mb-10 flex flex-wrap gap-5 md:gap-10">
          {/* 이모지 영역 */}
          <div className="flex flex-col items-center gap-3">
            <Skeleton className="h-[64px] w-[64px] rounded-full md:h-[100px] md:w-[100px]" />
            <Skeleton className="h-5 w-16 rounded-sm" />
          </div>

          {/* 기본 정보 */}
          <div className="min-w-0 md:min-w-[300px] flex-1">
            <Skeleton className="mb-4 h-8 w-48" />
            <Skeleton className="mb-5 h-5 w-28" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-sm" />
              <Skeleton className="h-6 w-20 rounded-sm" />
            </div>
          </div>
        </div>

        {/* 설명 */}
        <div className="mb-[30px]">
          <Skeleton className="mb-3 h-5 w-12" />
          <Skeleton className="mb-2 h-4 w-full" />
          <Skeleton className="mb-2 h-4 w-full" />
          <Skeleton className="mb-2 h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>

        {/* 버튼 */}
        <Skeleton className="h-12 w-full rounded" />
      </div>
    </div>
  );
}

export default ProductDetailSkeleton;
