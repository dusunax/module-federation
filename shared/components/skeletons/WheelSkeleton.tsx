import React from 'react';

/**
 * PlutchikWheel 기본값과 동일:
 *   viewBox 600×600, maxWidth 700px, mt-12 md:mt-0 md:-translate-y-8
 */
function WheelSkeleton() {
  return (
    <div className="flex flex-col items-center mt-12 md:mt-0 translate-y-0 md:-translate-y-8 select-none">
      {/* 크기 조절 버튼 자리 */}
      <div className="mb-3 flex items-center gap-2 -mt-12 rounded-full bg-[#121626]/80 p-1">
        <div className="h-7 w-7 rounded-full bg-white/20" />
        <div className="min-w-[3ch] h-3" />
        <div className="h-7 w-7 rounded-full bg-white/20" />
      </div>

      <svg
        viewBox="0 0 600 600"
        className="w-full animate-pulse"
        style={{ maxWidth: 700 }}
      >
        {/* 바깥 링 */}
        <circle cx="300" cy="300" r="245" fill="none" stroke="var(--color-overlay-3)" strokeWidth="60" />
        {/* 중간 링 */}
        <circle cx="300" cy="300" r="185" fill="none" stroke="var(--color-overlay-3)" strokeWidth="65" opacity="0.7" />
        {/* 안쪽 링 */}
        <circle cx="300" cy="300" r="120" fill="none" stroke="var(--color-overlay-3)" strokeWidth="60" opacity="0.5" />
        {/* 중앙 원 */}
        <circle cx="300" cy="300" r="55" fill="var(--color-overlay-3)" opacity="0.4" />
        {/* 섹터 구분선 8개 */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 45 - 90) * (Math.PI / 180);
          return (
            <line
              key={i}
              x1="300"
              y1="300"
              x2={300 + 275 * Math.cos(angle)}
              y2={300 + 275 * Math.sin(angle)}
              stroke="var(--color-bg-primary)"
              strokeWidth="2"
              opacity="0.5"
            />
          );
        })}
      </svg>
    </div>
  );
}

export default WheelSkeleton;
