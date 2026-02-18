import React from 'react';
import Skeleton from '../Skeleton';

function LoginSkeleton() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--color-bg-primary)]">
      <div className="w-full max-w-sm rounded border border-[var(--color-border-primary)] bg-[var(--color-overlay-2)] p-8">
        <Skeleton className="mx-auto mb-6 h-7 w-40" />
        <Skeleton className="mx-auto mb-4 h-11 w-full rounded" />
        <Skeleton className="mx-auto h-11 w-full rounded" />
      </div>
    </div>
  );
}

export default LoginSkeleton;
