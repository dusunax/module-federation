import React, { Suspense, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import CurrentConditionSkeleton from '@shared/components/skeletons/CurrentConditionSkeleton';
import ProductListSkeleton from '@shared/components/skeletons/ProductListSkeleton';
import WheelSkeleton from '@shared/components/skeletons/WheelSkeleton';
import { getSavedViewMode } from '../utils/viewMode';

function ProductListWithDefault({ children }: { children: React.ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    if (!searchParams.get('view')) {
      const defaultView = getSavedViewMode();
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('view', defaultView);
        return next;
      }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return <>{children}</>;
}

function WheelFallback() {
  return (
    <>
      <CurrentConditionSkeleton />
      <WheelSkeleton />
    </>
  );
}

function ListFallback() {
  return <ProductListSkeleton />;
}

function ProductListFallback() {
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view') || getSavedViewMode();
  return view === 'list' ? <ListFallback /> : <WheelFallback />;
}

export function ProductListShell({ children }: { children: React.ReactNode }) {
  return (
    <ProductListWithDefault>
      <Suspense fallback={<ProductListFallback />}>{children}</Suspense>
    </ProductListWithDefault>
  );
}

export default ProductListFallback;
