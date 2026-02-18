import React from 'react';

interface SkeletonProps {
  className?: string;
}

function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded bg-[var(--color-overlay-3)] ${className}`}
    />
  );
}

export default Skeleton;
